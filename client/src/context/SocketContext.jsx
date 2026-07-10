import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    const sock = socketRef.current;

    sock.on('connect', () => setConnected(true));
    sock.on('disconnect', () => setConnected(false));

    sock.on('emergency:new', ({ emergency }) => {
      setActiveEmergencies(prev => [emergency, ...prev]);
    });

    sock.on('emergency:updated', ({ emergency }) => {
      setActiveEmergencies(prev =>
        prev.map(e => e._id === emergency._id ? emergency : e)
      );
    });

    sock.on('alert:new', ({ alert }) => {
      setLiveAlerts(prev => [alert, ...prev]);
    });

    sock.on('alert:updated', ({ alert }) => {
      setLiveAlerts(prev =>
        prev.map(a => a._id === alert._id ? alert : a)
      );
    });

    return () => {
      sock.disconnect();
    };
  }, [token]);

  const emit = (event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event, cb) => {
    socketRef.current?.on(event, cb);
    return () => socketRef.current?.off(event, cb);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, emit, on, activeEmergencies, liveAlerts }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
