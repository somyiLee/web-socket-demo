export default function Header({ cols }: { cols: number }) {
  const getColumnLabel = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className='flex sticky top-0 z-10 bg-gray-100'>
      {/* 좌상단 빈 셀 */}
      <div className='w-12 h-8 border-r border-b border-gray-300 flex items-center justify-center font-medium text-xs text-gray-600 shrink-0'></div>
      {/* 열 헤더 */}
      {Array.from({ length: cols }, (_, colIndex) => (
        <div
          key={`header-${colIndex}`}
          className='w-24 h-8 border-r border-b border-gray-300 flex items-center justify-center font-medium text-xs text-gray-600 shrink-0'
        >
          {getColumnLabel(colIndex)}
        </div>
      ))}
    </div>
  );
}
