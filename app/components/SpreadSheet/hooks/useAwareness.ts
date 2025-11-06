import { useState, useEffect, useRef } from 'react';
import { WebsocketProvider } from 'y-websocket';
import { UserInfo, EditingUsers } from '../types';
import { getRandomColor, getRandomName } from '../utils';

/**
 * 사용자 Awareness를 관리하는 훅
 * 다른 사용자들의 편집 상태를 추적
 */
export const useAwareness = (provider: WebsocketProvider | null) => {
  const [editingUsers, setEditingUsers] = useState<EditingUsers>(new Map());
  const awarenessRef = useRef<WebsocketProvider['awareness'] | null>(null);

  /**
   * awareness: 사용자의 상태를 실시간으로 추적하는 객체로, 일시적인 상태를 공유유
   *            awareness.getStates() : 현재 모든 사용자의 상태를 가져옴
   *            awareness.setLocalState(userInfo) : 현재 사용자의 상태를 설정함
   *            awareness.on('change', awarenessChangeHandler) : 사용자의 상태가 변경될 때 이벤트를 발생시킴
   *            awareness.off('change', awarenessChangeHandler) : 사용자의 상태가 변경될 때 이벤트를 제거시킴
   */

  useEffect(() => {
    if (!provider) return;

    const awareness = provider.awareness;
    awarenessRef.current = awareness;

    // 현재 사용자 정보 설정
    const userInfo: UserInfo = {
      name: getRandomName(),
      color: getRandomColor(),
      cellKey: null,
    };

    awareness.setLocalState(userInfo);

    // Awareness 변경 감지 (다른 사용자들의 편집 상태)
    const awarenessChangeHandler = () => {
      const states = awareness.getStates();
      const users = new Map<string, UserInfo>();

      states.forEach((state, clientId) => {
        const userState = state as UserInfo;
        // 자신은 제외하고, cellKey가 있는 경우만 추가
        if (clientId !== awareness.clientID && userState.cellKey) {
          users.set(userState.cellKey, userState);
        }
      });

      setEditingUsers(users);
    };

    // 초기 로드 및 이벤트 리스닝
    awarenessChangeHandler();
    awareness.on('change', awarenessChangeHandler);

    return () => {
      awareness.off('change', awarenessChangeHandler);
    };
  }, [provider]);

  return {
    editingUsers,
    awarenessRef,
  };
};
