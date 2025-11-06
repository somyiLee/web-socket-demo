import { useCallback, useRef, useState } from 'react';
import { WebsocketProvider } from 'y-websocket';

export const useCellEvents = () => {
  const awarenessRef = useRef<WebsocketProvider['awareness'] | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

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

  return { awarenessRef, selectedCell, handleCellClick, handleCellBlur };
};
