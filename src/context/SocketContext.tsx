import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../services/api/config';
import { DashboardOverview, QueueMetrics, ConcurrencyMetrics } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  liveOverview: Partial<DashboardOverview> | null;
  liveQueue: Partial<QueueMetrics> | null;
  liveConcurrency: Partial<ConcurrencyMetrics> | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  liveOverview: null,
  liveQueue: null,
  liveConcurrency: null,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveOverview, setLiveOverview] = useState<Partial<DashboardOverview> | null>(null);
  const [liveQueue, setLiveQueue] = useState<Partial<QueueMetrics> | null>(null);
  const [liveConcurrency, setLiveConcurrency] = useState<Partial<ConcurrencyMetrics> | null>(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('⚡ [Socket.IO] Connected to FairQueue Realtime Server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('⚡ [Socket.IO] Disconnected from FairQueue Realtime Server');
      setIsConnected(false);
    });

    socketInstance.on('metrics:update', (data: Partial<DashboardOverview>) => {
      setLiveOverview(prev => ({ ...prev, ...data }));
    });

    socketInstance.on('queue:update', (data: Partial<QueueMetrics>) => {
      setLiveQueue(prev => ({ ...prev, ...data }));
    });

    socketInstance.on('concurrency:update', (data: Partial<ConcurrencyMetrics>) => {
      setLiveConcurrency(prev => ({ ...prev, ...data }));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        liveOverview,
        liveQueue,
        liveConcurrency,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
