const { Server } = require("socket.io");
const messageModel=require('../model/messageModel')

function setupChat(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', 
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join', async () => {
      try {
        const messages = await messageModel.find()
        console.log(messages)
        socket.emit('previous_messages', messages);
      } catch (err) {
        console.log("Error fetching messages:", err);
      }
    });
  
    socket.on('send_message', async (data) => {
      try {
        const msg=await messageModel.create({
          sender: data.username,
          text: data.text,
          receiver:data.receiver
        })
        console.log("Message received:", msg);
        io.emit('receive_message', msg);
      } catch (err) {
        console.log("Error saving message:", err);
      }
    });
  
    socket.on('disconnect', () => {
      // console.log("User disconnected");
    });
  });
}

module.exports = setupChat;
