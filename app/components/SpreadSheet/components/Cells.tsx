'use client';

import { useRef, useEffect, useState } from 'react';

// 다른 사용자 정보 타입
interface EditingUser {
  name: string;
  color: string;
  cellKey: string | null;
}

interface CellProps {
  cellKey: string;
  value: string;
  isSelected: boolean;
  onSelect: (cellKey: string) => void;
  onUpdate: (cellKey: string, value: string) => void;
  onBlur: () => void;
  editingUser?: EditingUser;
}

export default function Cell({
  cellKey,
  value,
  isSelected,
  onSelect,
  onUpdate,
  onBlur,
  editingUser,
}: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);

  // value prop이 변경되면 localValue 업데이트
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // 선택되었을 때 input에 포커스
  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isSelected]);

  // 셀 클릭 핸들러
  const handleClick = () => {
    if (!isSelected) {
      onSelect(cellKey);
    }
  };

  // input 값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  // Enter 키나 Blur 시 값 저장
  const handleBlur = () => {
    if (localValue !== value) {
      onUpdate(cellKey, localValue);
    }
    onBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      e.currentTarget.blur();
    }
  };

  // 다른 사용자가 편집 중인지 확인
  const isBeingEditedByOther = !isSelected && editingUser;

  return (
    <div
      className={`
        w-24 h-8 border-r border-b border-gray-300 flex items-center
        shrink-0 relative cursor-cell focus:outline-none hover:bg-gray-50
        ${isSelected ? 'ring-2 ring-blue-500 ring-inset z-20' : ''}
        ${isBeingEditedByOther ? 'ring-2 ring-inset z-10' : ''}
      `}
      style={{
        borderColor: isBeingEditedByOther ? editingUser.color : undefined,
        backgroundColor: isBeingEditedByOther
          ? `${editingUser.color}15` // 색상에 투명도 추가
          : undefined,
      }}
      onClick={handleClick}
      tabIndex={isSelected ? 0 : -1}
    >
      {isSelected ? (
        <input
          ref={inputRef}
          type='text'
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className='w-full h-full px-2 text-sm outline-none border-0 focus:ring-0 focus:outline-none'
        />
      ) : (
        <div className='w-full h-full px-2 text-sm flex items-center truncate'>{value}</div>
      )}

      {/* 다른 사용자가 편집 중일 때 표시 */}
      {isBeingEditedByOther && (
        <div
          className='absolute -top-5 left-0 px-2 py-1 rounded text-white text-xs whitespace-nowrap z-30 shadow-lg'
          style={{ backgroundColor: editingUser.color }}
        >
          {editingUser.name} 수정 중
        </div>
      )}
    </div>
  );
}
