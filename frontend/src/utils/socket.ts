import { io } from 'socket.io-client';

const SOCKET_URL = '/';

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('Socket connecté au backend:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('Erreur de connexion socket:', err.message);
});

export default socket;
