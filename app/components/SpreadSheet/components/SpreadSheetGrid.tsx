import Cell from './Cells';
import Header from './Header';
import { getCellKey } from '../utils';
import { CellData, EditingUsers } from '../types';

interface SpreadSheetGridProps {
  rows: number;
  cols: number;
  cellData: CellData;
  editingUsers: EditingUsers;
  selectedCell: string | null;
  onCellSelect: (cellKey: string) => void;
  onCellUpdate: (cellKey: string, value: string) => void;
  onCellBlur: () => void;
}

/**
 * 스프레드시트 그리드 렌더링 컴포넌트
 */
export default function SpreadSheetGrid({
  rows,
  cols,
  cellData,
  editingUsers,
  selectedCell,
  onCellSelect,
  onCellUpdate,
  onCellBlur,
}: SpreadSheetGridProps) {
  return (
    <div className='border border-gray-300 w-fit'>
      <Header cols={cols} />

      {/* 데이터 행들 */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className='flex'
        >
          {/* 행 헤더 */}
          <div className='w-12 h-8 border-r border-b border-gray-300 flex items-center justify-center font-medium text-xs text-gray-600 bg-gray-100 shrink-0'>
            {rowIndex + 1}
          </div>

          {/* 셀들 */}
          {Array.from({ length: cols }, (_, colIndex) => {
            const cellKey = getCellKey(rowIndex, colIndex);
            const editingUser = editingUsers.get(cellKey);

            return (
              <Cell
                key={cellKey}
                cellKey={cellKey}
                value={cellData.get(cellKey) || ''}
                isSelected={selectedCell === cellKey}
                onSelect={onCellSelect}
                onUpdate={onCellUpdate}
                onBlur={onCellBlur}
                editingUser={editingUser}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
