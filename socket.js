const express = require('express')
const http  =  require('http')
const {Server} =  require('socket.io')
const cors =  require('cors');
const { Socket } = require('dgram');


const app = express();

app.use(cors());

const server =  http.createServer(app);

const io =  new Server(server,{
       cors:{
        origin: "*",
       },
});

io.on("connection",  (socket) =>{ 
       console.log(`User connected:  ${socket.id}`);


       socket.on("chatMessage", (msg) =>{
            console.log(`Message recieved:  ${msg}`);
            io.emit("chatMessage", msg);
       });

       socket.on("disconnect", ()=>{
          console.log(`User disconnected:  ${socket.id}`);
       })
})

server.listen(3000,  () => console.log("websocket server running on port 3000"));


