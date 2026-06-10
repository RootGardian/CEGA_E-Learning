const { io } = require('socket.io-client');

const socket = io('http://localhost:5000', {
  withCredentials: true,
  extraHeaders: {
    cookie: 'token=invalid'
  }
});

socket.on('connect', () => {
  console.log('Connected!');
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.log('Connect error:', err.message);
  process.exit(1);
});
