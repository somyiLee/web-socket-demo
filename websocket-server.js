import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as map from 'lib0/map';

const PORT = process.env.WS_PORT || 1234;

// 문서와 awareness 저장소
const docs = new Map();
const messageSync = 0;
const messageAwareness = 1;

/**
 * 문서와 awareness 가져오기
 */
const getYDoc = (docname, gc = true) =>
  map.setIfUndefined(docs, docname, () => {
    const doc = new Y.Doc();
    doc.gc = gc;
    const awareness = new awarenessProtocol.Awareness(doc);
    awareness.setLocalState(null);

    const docData = {
      doc,
      awareness,
      conns: new Map(),
    };

    return docData;
  });

// WebSocket 서버 생성
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (conn, req) => {
  // URL에서 문서 이름 추출
  const docname = req.url.slice(1).split('?')[0] || 'default-room';
  const { doc, awareness, conns } = getYDoc(docname);

  // 연결 저장
  conns.set(conn, new Set());
  let closed = false;

  /**
   * 메시지를 같은 방의 다른 클라이언트에게 전송
   */
  const send = (message) => {
    if (conn.readyState === 1) {
      conn.send(message, (err) => {
        if (err) {
          conn.close();
        }
      });
    }
  };

  /**
   * 문서 업데이트 핸들러 - 다른 클라이언트에게 브로드캐스트
   */
  const updateHandler = (update, origin) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);

    // 모든 클라이언트에게 브로드캐스트 (origin이 WebSocket이면 그것만 제외)
    conns.forEach((_, c) => {
      if (c !== origin && c.readyState === 1) {
        c.send(message, (err) => {
          if (err) {
            c.close();
          }
        });
      }
    });
  };

  // 문서 업데이트 이벤트 리스닝
  doc.on('update', updateHandler);

  /**
   * 메시지 처리
   */
  conn.on('message', (message) => {
    try {
      const encoder = encoding.createEncoder();
      const decoder = decoding.createDecoder(new Uint8Array(message));
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync:
          encoding.writeVarUint(encoder, messageSync);

          // 현재 클라이언트에게 응답 전송
          if (encoding.length(encoder) > 1) {
            send(encoding.toUint8Array(encoder));
          }
          break;

        case messageAwareness:
          awarenessProtocol.applyAwarenessUpdate(
            awareness,
            decoding.readVarUint8Array(decoder),
            conn
          );
          break;

        default:
          console.warn('알 수 없는 메시지 타입:', messageType);
      }
    } catch (err) {
      console.error('❌ 메시지 처리 오류:', err);
    }
  });

  /**
   * Awareness 변경 시 브로드캐스트
   */
  const awarenessChangeHandler = ({ added, updated, removed }, origin) => {
    const changedClients = added.concat(updated).concat(removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
    );
    const awarenessMessage = encoding.toUint8Array(encoder);
    broadcastMessage(docname, awarenessMessage, origin);
  };

  awareness.on('update', awarenessChangeHandler);

  /**
   * 연결 종료 처리
   */
  conn.on('close', () => {
    if (!closed) {
      closed = true;
      conns.delete(conn);

      // 이벤트 리스너 제거
      doc.off('update', updateHandler);
      awareness.off('update', awarenessChangeHandler);

      // Awareness에서 제거
      awarenessProtocol.removeAwarenessStates(awareness, [doc.clientID], 'disconnect');

      // 연결이 없으면 문서 제거
      if (conns.size === 0) {
        docs.delete(docname);
      }
    }
  });

  conn.on('error', (error) => {
    console.error('❌ WebSocket 오류:', error);
  });

  // 초기 sync 메시지 전송
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  send(encoding.toUint8Array(encoder));

  // Awareness 상태 전송
  const awarenessStates = awareness.getStates();
  if (awarenessStates.size > 0) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys()))
    );
    send(encoding.toUint8Array(encoder));
  }
});

/**
 * 같은 방의 다른 클라이언트에게 메시지 브로드캐스트
 */
const broadcastMessage = (docname, message, excludeConn = null) => {
  const docData = docs.get(docname);
  if (docData) {
    docData.conns.forEach((_, conn) => {
      if (conn !== excludeConn && conn.readyState === 1) {
        conn.send(message, (err) => {
          if (err) {
            conn.close();
          }
        });
      }
    });
  }
};

// 정리
process.on('SIGINT', () => {
  wss.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  wss.close(() => {
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});
