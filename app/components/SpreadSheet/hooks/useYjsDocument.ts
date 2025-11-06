import { useEffect, useMemo } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { WEBSOCKET_CONFIG } from '../constants';

/**
 * Yjs 문서와 WebSocket Provider를 초기화 & 관리
 */
export const useYjsDocument = () => {
  // Yjs 문서는 한 번만 생성
  const doc = useMemo(() => new Y.Doc(), []); // Yjs Document
  const yMap = useMemo(() => doc.getMap<string>(WEBSOCKET_CONFIG.MAP_NAME), [doc]); // Yjs Map

  /**
   * Doc: 모든 내용을 담는 컨테이너로, 클라이언트당 1개의 doc이 존재함.
   * Map: 데이터 구조 레벨로, yjs Document 내부의 데이터 저장소.
   *      하나의 doc 내부에 여러 개의 Map이 존재할 수 있음.
   * Data: 실제 데이터로
   * room: 네트워크/통신 레벨로, WebSocket 연결에서 클라이언트들을 그룹화하는 역할
   * Provider: 네트워크/통신 레벨로, Doc과 네트워크(WebSocket)의 연결을 관리하는 역할
   *           y-webrtc(P2P), y-indexeddb(Local Storage) 등의 다양한 provider가 지원되며, 여러 provider를 동시에 사용할 수 있음.
   */

  // WebSocket Provider도 한 번만 생성
  const provider = useMemo(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || WEBSOCKET_CONFIG.DEFAULT_URL;
    return new WebsocketProvider(wsUrl, WEBSOCKET_CONFIG.ROOM_NAME, doc);
  }, [doc]);

  // Cleanup
  useEffect(() => {
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [provider, doc]);

  return {
    doc,
    provider,
    yMap,
  };
};
