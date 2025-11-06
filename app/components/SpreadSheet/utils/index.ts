// 랜덤 색상 생성
export const getRandomColor = () => {
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
export const getRandomName = () => {
  const adjectives = ['KR', 'US'];
  const nouns = ['SL', 'WL', 'UK', 'JK', 'HJ'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}-${noun}`;
};

// 셀 키 생성
export const getCellKey = (row: number, col: number): string => {
  return `${row}-${col}`;
};
