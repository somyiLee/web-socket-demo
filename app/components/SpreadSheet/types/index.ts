// 사용자 정보 타입
export interface UserInfo {
  name: string;
  color: string;
  cellKey: string | null;
}

// 셀 데이터 타입
export type CellData = Map<string, string>;

// 편집 중인 사용자 목록 타입
export type EditingUsers = Map<string, UserInfo>;
