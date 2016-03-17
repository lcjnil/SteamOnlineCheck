var socket = io('http://localhost:8080');
 socket.on('msg', function (msg) {
   chrome.notifications.create(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10), {
     type: 'basic',
     title: 'Message',
     message: msg,
     expandedMessage: msg,
     iconUrl: './images.png'
   });
 });
