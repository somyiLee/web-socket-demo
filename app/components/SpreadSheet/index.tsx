'use client';

import ConnectionStatus from './components/ConnectionStatus';
import SpreadSheetGrid from './components/SpreadSheetGrid';
import { useCellEvents } from './hooks/useCellEvents';
import { useYjsDocument } from './hooks/useYjsDocument';
import { useWebSocketConnection } from './hooks/useWebSocketConnection';
import { useCollaborativeData } from './hooks/useCollaborativeData';
import { useAwareness } from './hooks/useAwareness';
import { SPREADSHEET_CONFIG } from './constants';

/**
 * 실시간 협업 스프레드시트 메인 컴포넌트
 */

export default function SpreadSheet() {
  // Yjs Document & WebSocket Provider 초기화 및 관리
  const { provider, yMap } = useYjsDocument();

  // WebSocket 연결 상태 관측
  const { isConnected } = useWebSocketConnection(provider);

  // 협업 데이터 관리 (셀 데이터 동기화)
  const { cellData, updateCell } = useCollaborativeData(yMap);

  // 사용자 Awareness 관리
  const { editingUsers, awarenessRef } = useAwareness(provider);

  // 셀 이벤트 관리 (선택, 포커스, 블러)
  const { selectedCell, handleCellClick, handleCellBlur } = useCellEvents(awarenessRef);

  return (
    <div className='w-full h-screen bg-white overflow-auto'>
      <div className='inline-block min-w-full'>
        {/* 연결 상태 표시 */}
        <ConnectionStatus isConnected={isConnected} />

        {/* 스프레드시트 그리드 */}
        <SpreadSheetGrid
          rows={SPREADSHEET_CONFIG.ROWS}
          cols={SPREADSHEET_CONFIG.COLS}
          cellData={cellData}
          editingUsers={editingUsers}
          selectedCell={selectedCell}
          onCellSelect={handleCellClick}
          onCellUpdate={updateCell}
          onCellBlur={handleCellBlur}
        />
      </div>
    </div>
  );
}
