import { useState, useEffect } from 'react';
import { getSocket } from '../api/socketApi';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);
    
    // For real socket.io, it emits 'connect' and 'disconnect'
    // For mock socket, it does the same
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // Initial state check
    if (socketInstance.connected) {
      setIsConnected(true);
    }

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket, isConnected };
};

export default useSocket;
