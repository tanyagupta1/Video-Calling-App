const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose =require('mongoose')
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


//db stuff

const DB='mongodb+srv://tan:1234@cluster0.el61l.mongodb.net/chatapp?retryWrites=true&w=majority'
mongoose.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useUnifiedTopology:true,
  useFindAndModify:false
}).then(()=>{
  console.log('connected to DB')
}).catch((err)=>console.log(err))
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('db connection opened')
});
const roomSchema = new mongoose.Schema({
    roomname: String,
    username:String,
    message:String,
    time:{type: Date, default: Date.now}

  });
const Rooms = mongoose.model('Rooms', roomSchema);

const roomUserSchema = new mongoose.Schema({
    roomname: String,
    username:String
  });
const RoomUsers = mongoose.model('RoomUsers', roomUserSchema);

const userSchema = new mongoose.Schema({
    username: String,
    email:String,
    password:String
  });
  const users = mongoose.model('users', userSchema);

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'TeamsClone Bot';

// Run when client connects
io.on('connection', socket => {
  console.log("connected now");
  

  socket.on('register',({name,email,psw})=>{
     
      console.log(name,email,psw)
      var query = users.find({username:name},function(err,docs){
      
        if(err) console.log(err)
      })
      var reg=0;
query.count(function (err, count) {
    if (err) console.log(err)
    console.log(count)
    reg=count;
    if(reg==0)
    {
      console.log('registering user')
    var newUser=new users({username:name,email:email,password:psw})
    newUser.save(function(err){
        if(err) console.log(err);
       })
      }
      else 
      {
        console.log('already reg')
      }
})
    
  })
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    Rooms.find({roomname:user.room},function(err,docs){
      
      if(err) console.log(err)
      else 
      {
        socket.emit('load older msgs',docs)
        console.log(docs)
        console.log('loading older messages')
      }
    })
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );


    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
    socket.emit('init please')
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    var newMsg=new Rooms({roomname:user.room,username:user.username,message:msg})
    newMsg.save(function(err){
     if(err) console.log(err);
    })

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });
  socket.on('new conn', (id) => {
    const user = getCurrentUser(socket.id);
    console.log(user,"sent new connn");

    socket.broadcast.to(user.room).emit('new conn',id);
  });

  socket.on('send users',(name)=>
  {
    users.find({username:{$ne:name}},function(err,docs){
      
        if(err) console.log(err)
        else 
        {
          socket.emit('user list',docs)
          console.log(docs)
          console.log('sent users')
        }
    })
    
  })
  socket.on('send rooms',(name)=>
  {
    RoomUsers.find({username:name},function(err,docs){
      
        if(err) console.log(err)
        else 
        {
          socket.emit('rooms list',docs)
          console.log(docs)
          console.log('sent rooms')
        }
    })
    
  })

  socket.on('all rooms',(name)=>
  {
    RoomUsers.find({},function(err,docs){
      
        if(err) console.log(err)
        else 
        {
          socket.emit('all rooms',docs)
          console.log(docs)
          console.log('sent all rooms')
        }
    })
    
  })




  socket.on('create room',({rname,name,other})=>
  {
    var newRoom1=new RoomUsers({roomname:rname,username:name});
    newRoom1.save(function(err){
        if(err) console.log(err);
       })
       var newRoom2=new RoomUsers({roomname:rname,username:other});   
       newRoom2.save(function(err){
        if(err) console.log(err);
       })
       console.log("created room",rname)
})


  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
      io.to(user.room).emit('remove peer')
      

    }
  });
  socket.on('end call',()=>{
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('remove peer')
  })
});




const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));