import { useCallback, useState, MutableRefObject } from 'react';
import { WebsocketProvider } from 'y-websocket';

/**
 * 셀 선택 및 포커스 이벤트를 관리하는 훅
 */
export const useCellEvents = (
  awarenessRef: MutableRefObject<WebsocketProvider['awareness'] | null>
) => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // 셀 선택
  const handleCellClick = useCallback(
    (cellKey: string) => {
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
    },
    [awarenessRef]
  );

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
  }, [awarenessRef]);

  return { selectedCell, handleCellClick, handleCellBlur };
};
