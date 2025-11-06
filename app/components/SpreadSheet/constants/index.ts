// 스프레드시트 크기
export const SPREADSHEET_CONFIG = {
  ROWS: 20,
  COLS: 15,
} as const;

// WebSocket 설정
export const WEBSOCKET_CONFIG = {
  ROOM_NAME: 'spreadsheet-demo-room',
  DEFAULT_URL: 'ws://localhost:1234',
  MAP_NAME: 'spreadsheet',
} as const;
