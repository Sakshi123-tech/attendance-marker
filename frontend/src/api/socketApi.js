import { io } from 'socket.io-client';
import axiosInstance from './axios'; // used for base URL inference if needed

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
let socketInstance = null;

export const initSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to server');
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection Error:', error.message);
    });
  }
  return socketInstance;
};

export const getSocket = () => {
  if (!socketInstance) return initSocket();
  return socketInstance;
};
