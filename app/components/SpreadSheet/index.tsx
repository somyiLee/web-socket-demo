'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import Cell from './components/Cells';
import Header from './components/Header';

// 사용자 정보 타입
interface UserInfo {
  name: string;
  color: string;
  cellKey: string | null;
}

// 랜덤 색상 생성
const getRandomColor = () => {
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 랜덤 사용자 이름 생성
const getRandomName = () => {
  const adjectives = ['KR', 'US'];
  const nouns = ['SL', 'WL', 'UK', 'JK', 'HJ'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}-${noun}`;
};

export default function SpreadSheet() {
  const ROWS = 20;
  const COLS = 15;

  const yMapRef = useRef<Y.Map<string> | null>(null);
  const awarenessRef = useRef<WebsocketProvider['awareness'] | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [cellData, setCellData] = useState<Map<string, string>>(new Map());
  const [editingUsers, setEditingUsers] = useState<Map<string, UserInfo>>(new Map());

  // 셀 키 생성
  const getCellKey = (row: number, col: number): string => {
    return `${row}-${col}`;
  };

  // Yjs 초기화
  useEffect(() => {
    // Y.Doc 생성
    const doc = new Y.Doc();
    const map = doc.getMap<string>('spreadsheet');
    yMapRef.current = map;

    // WebSocket Provider 설정 (로컬 서버 사용)
    // 'spreadsheet-demo-room'을 원하는 room 이름으로 변경 가능
    const wsProvider = new WebsocketProvider('ws://localhost:1234', 'spreadsheet-demo-room', doc);

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

  // 셀 선택
  const handleCellClick = useCallback((cellKey: string) => {
    setSelectedCell(cellKey);

    // Awareness 상태 업데이트 (다른 사용자들에게 내가 편집 중인 셀 알림)
    const awareness = awarenessRef.current;
    if (awareness) {
      const currentState = awareness.getLocalState();
      awareness.setLocalState({
        ...currentState,
        cellKey: cellKey,
      });
    }
  }, []);

  // 셀 선택 해제
  const handleCellBlur = useCallback(() => {
    setSelectedCell(null);

    // Awareness 상태 업데이트 (편집 종료)
    const awareness = awarenessRef.current;
    if (awareness) {
      const currentState = awareness.getLocalState();
      awareness.setLocalState({
        ...currentState,
        cellKey: null,
      });
    }
  }, []);

  return (
    <div className='w-fit h-screen bg-white overflow-auto'>
      <div className='inline-block min-w-full'>
        {/* 연결 상태 표시 */}
        <div className='p-2 bg-gray-100 border-b border-gray-300 text-sm'>
          <span className='font-semibold'>상태: </span>
          {isConnected ? (
            <span className='text-green-600'>✓ 연결됨</span>
          ) : (
            <span className='text-yellow-600'>● 연결 중...</span>
          )}
          <span className='ml-4 text-gray-600'>Room: spreadsheet-demo-room (로컬 서버)</span>
        </div>

        {/* 스프레드시트 그리드 */}
        <div className='border border-gray-300'>
          {/* 헤더 행 */}
          <Header cols={COLS} />

          {/* 데이터 행들 */}
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
