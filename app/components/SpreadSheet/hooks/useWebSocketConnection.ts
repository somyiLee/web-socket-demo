import { useState, useEffect } from 'react';
import { WebsocketProvider } from 'y-websocket';

/**
 * WebSocket 연결 상태를 관측하는 훅
 */
export const useWebSocketConnection = (provider: WebsocketProvider | null) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!provider) return;

    const handleStatus = (event: { status: string }) => {
      setIsConnected(event.status === 'connected');
    };

    provider.on('status', handleStatus);

    return () => {
      provider.off('status', handleStatus);
    };
  }, [provider]);

  return { isConnected };
};
