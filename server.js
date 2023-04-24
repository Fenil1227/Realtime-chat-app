const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage  = require('./utils/messages.js')
const {userJoin, getCurrentUser, userLeave, getRoomUsers}  = require('./utils/users.js')


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatCord Bot';

//run whenn client vonnects
io.on('connection',socket=>{
   socket.on('joinRoom',({username,room})=>{
    const user = userJoin(socket.id,username,room);
    socket.join(user.room);
  
    //Welcome Current user
    socket.emit('message', formatMessage(botName,'Welcome to ChatCord!'));

    //Broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat!`));

    // io.emit()
    //send users and room info
    io.to(user.room).emit('roomusers',{
        room: user.room,
        users:getRoomUsers(user.room) 
        });

    
});
   

    // console.log('New WS Connection...');
     
    

    

    //listen for chat msg
    socket.on('chatMessage', (msg)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });
    //Runs when client disconnects
    socket.on('disconnect',()=>{ 
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} left the chat`));
            //send users and room info
            io.to(user.room).emit('roomusers',{
            room: user.room,
            users:getRoomUsers(user.room) 
            });
        }
        
    })

});

const PORT = 7004 || process.env.PORT;



server.listen(PORT, ()=>{
    console.log(`server tunning on ${PORT}`)
});

//pm2 start server.js
//pm2 stop id.no