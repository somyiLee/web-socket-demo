import { useState, useEffect, useCallback } from 'react';
import * as Y from 'yjs';
import { CellData } from '../types';

/**
 * Yjs를 통한 협업 데이터를 관리하는 훅
 */
export const useCollaborativeData = (yMap: Y.Map<string> | null) => {
  const [cellData, setCellData] = useState<CellData>(new Map());

  // 다른 사용자가 셀 값을 변경했을때 실행됌 (수신)
  useEffect(() => {
    if (!yMap) return;

    const observer = () => {
      const newData = new Map<string, string>();
      yMap.forEach((value, key) => {
        newData.set(key, value);
      });
      setCellData(newData);
    };

    // 초기 데이터 로드
    observer();

    // 변경 감지하고 cellData 업데이트
    yMap.observe(observer);

    return () => {
      yMap.unobserve(observer);
    };
  }, [yMap]);

  // 현재 사용자가 셀 값을 업데이트 했을때 실행 (발신)
  const updateCell = useCallback(
    (cellKey: string, value: string) => {
      if (!yMap) return;

      if (value === '') {
        yMap.delete(cellKey);
      } else {
        yMap.set(cellKey, value);
      }
    },
    [yMap]
  );

  return {
    cellData,
    updateCell,
  };
};
