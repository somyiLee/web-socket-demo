export default function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className='p-2 bg-gray-100 border-b border-gray-300 text-sm'>
      <span className='font-semibold'>상태: </span>
      {isConnected ? (
        <span className='text-green-600'>✓ 연결됨</span>
      ) : (
        <span className='text-yellow-600'>● 연결 중...</span>
      )}
      <span className='ml-4 text-gray-600'>
        websocket url: {process.env.NEXT_PUBLIC_WS_URL} | Room: spreadsheet-demo-room
      </span>
    </div>
  );
}
