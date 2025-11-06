'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import Cell from './components/Cells';
import Header from './components/Header';
import { useCellEvents } from './hooks/useCellEvents';
import { getCellKey, getRandomColor, getRandomName } from './utils';
import ConnectionStatus from './components/ConnectionStatus';

// 사용자 정보 타입
interface UserInfo {
  name: string;
  color: string;
  cellKey: string | null;
}

export default function SpreadSheet() {
  const ROWS = 20;
  const COLS = 15;

  const yMapRef = useRef<Y.Map<string> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [cellData, setCellData] = useState<Map<string, string>>(new Map());
  const [editingUsers, setEditingUsers] = useState<Map<string, UserInfo>>(new Map());

  const { awarenessRef, selectedCell, handleCellClick, handleCellBlur } = useCellEvents();

  // Yjs 초기화
  useEffect(() => {
    // Y.Doc 생성
    const doc = new Y.Doc();
    const map = doc.getMap<string>('spreadsheet');
    yMapRef.current = map;

    // WebSocket Provider 설정
    // 개발 환경: localhost, 프로덕션: 환경 변수에서 가져옴
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234';
    const wsProvider = new WebsocketProvider(wsUrl, 'spreadsheet-demo-room', doc);

    // Awareness 설정
    const awareness = wsProvider.awareness;
    awarenessRef.current = awareness;

    // 현재 사용자 정보 설정
    const userInfo: UserInfo = {
      name: getRandomName(),
      color: getRandomColor(),
      cellKey: null,
    };

    awareness.setLocalState(userInfo);

    // 연결 상태 감지
    wsProvider.on('status', (event: { status: string }) => {
      setIsConnected(event.status === 'connected');
    });

    // Yjs 데이터 변경 감지
    const observer = () => {
      const newData = new Map<string, string>();
      map.forEach((value, key) => {
        newData.set(key, value);
      });
      setCellData(newData);
    };

    map.observe(observer);

    // Awareness 변경 감지 (다른 사용자들의 편집 상태)
    const awarenessChangeHandler = () => {
      const states = awareness.getStates();
      const users = new Map<string, UserInfo>();

      states.forEach((state, clientId) => {
        // 자신은 제외하고, UserInfo 타입으로 캐스팅
        const userState = state as UserInfo;
        if (clientId !== awareness.clientID && userState.cellKey) {
          users.set(userState.cellKey, userState);
        }
      });

      setEditingUsers(users);
    };

    awareness.on('change', awarenessChangeHandler);

    // 초기 데이터 로드
    observer();
    awarenessChangeHandler();

    // Cleanup
    return () => {
      map.unobserve(observer);
      awareness.off('change', awarenessChangeHandler);
      wsProvider.destroy();
      doc.destroy();
    };
  }, []);

  // 셀 값 업데이트
  const updateCell = useCallback((cellKey: string, value: string) => {
    const yMap = yMapRef.current;
    if (yMap) {
      if (value === '') {
        yMap.delete(cellKey);
      } else {
        yMap.set(cellKey, value);
      }
    }
  }, []);

  return (
    <div className='w-full h-screen bg-white overflow-auto'>
      <div className='inline-block min-w-full'>
        <ConnectionStatus isConnected={isConnected} />

        {/* 스프레드시트 그리드 */}
        <div className='border border-gray-300 w-fit '>
          <Header cols={COLS} />
          {/* 데이터 행 */}
          {Array.from({ length: ROWS }, (_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className='flex'
            >
              {/* 행 헤더 */}
              <div className='w-12 h-8 border-r border-b border-gray-300 flex items-center justify-center font-medium text-xs text-gray-600 bg-gray-100 shrink-0'>
                {rowIndex + 1}
              </div>
              {/* 셀들 */}
              {Array.from({ length: COLS }, (_, colIndex) => {
                const cellKey = getCellKey(rowIndex, colIndex);
                const editingUser = editingUsers.get(cellKey);
                return (
                  <Cell
                    key={cellKey}
                    cellKey={cellKey}
                    value={cellData.get(cellKey) || ''}
                    isSelected={selectedCell === cellKey}
                    onSelect={handleCellClick}
                    onUpdate={updateCell}
                    onBlur={handleCellBlur}
                    editingUser={editingUser}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
