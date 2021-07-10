
// let Peer=require('simple-peer')
let count=0;
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const joinCall= document.getElementById('joincall')
const shareScreen=document.getElementById('ShareScreen')
let myPeer
let screenPeer
let Stream
const myvid=document.getElementById('myvid')
// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//socket oniitit

socket.on('init please',()=>
{
  navigator.mediaDevices.getUserMedia({video:true,audio:true})
.then(stream=>{
    // socket.emit('NewClient')
    myvid.srcObject=stream
    Stream=stream
    // myvid.play()
  })
    console.log("initilased my stufff")


})

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
socket.on('load older msgs',(docs)=>{
  console.log("received a keww")
  for(var i=0;i<docs.length;i++)
  {
      // console.log(docs[i].message)
      outputOldMessage(docs[i].message,docs[i].username,docs[i].time)
  }

})
function outputOldMessage(message,user,time) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = user
  p.innerHTML += `<span>${time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}
// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});

joinCall.addEventListener('click',()=>
{
  myvid.play()
  myPeer = new Peer()
  myPeer.on('open', id => { // When we first open the app, have us join a room
  
    socket.emit('new conn',id)
    console.log("done thissss",count)
    // count++;
  })
  myPeer.on('call', call => { // When we join someone's room we will receive a call from them
          console.log("received a call")
          call.answer(Stream) // Stream them our video/audio
          call.on('stream', userVideoStream => { // When we recieve their stream
              CreateVideo(userVideoStream) // Display their video to ourselves
          })
      })
  

})

//videp send
socket.on('new conn',(id)=>{
  console.log(socket.id,"i received a request so sending my video")

  connectToNewUser(id, Stream) 

})

function connectToNewUser(userId, stream) { // This runs when someone joins our room
  const call = myPeer.call(userId, stream) // Call the user who just joined

  // Add their video
  call.on('stream', userVideoStream => {
      CreateVideo(userVideoStream)
  })
  // If they leave, remove their video
  call.on('close', () => {
    let video=document.getElementById('peerVideo')
      video.remove()
  })
}
function CreateVideo(stream)
    {
      if(count==1) return 
      count=1;
      console.log("creating peer video")
        let video=document.createElement('video')
        video.id='peerVideo'
        video.srcObject=stream
        video.class='embed-responsive-item'
        document.querySelector('#vids').append(video)
        video.play()
    }

    socket.on('remove peer',()=>{
      console.log("perr has disconnected removing video")
      let video=document.getElementById('peerVideo')
      video.srcObject=null
      video.remove()
    })


document.querySelector('#VideoControl').addEventListener('click', videoControl);
document.querySelector('#AudioControl').addEventListener('click', audioControl);
function videoControl()
{
    var elem = document.getElementById("VideoControl");
    let video = document.getElementById('myvid');
    let stream = video.srcObject;
    let tracks = stream.getTracks();
    console.log(tracks[0])  //audio
    console.log(tracks[1])  //video
    if (elem.value=="Open Camera") 
    {
        tracks[1].enabled=true;
        elem.value="Close Camera"
        document.getElementById("VideoControl").innerHTML = "Close Camera";
    }
    else 
    {
        tracks[1].enabled=false;
        elem.value = "Open Camera";
        document.getElementById("VideoControl").innerHTML = "Open Camera";
    }
}
function audioControl()
{
    var elem = document.getElementById("VideoControl");
    let video = document.getElementById('myvid');
    console.log("got my video",video)
    let stream = video.srcObject;
    let tracks = stream.getTracks();
    console.log(tracks[0])  //audio
    console.log(tracks[1])  //video
    if (elem.value=="Unmute") 
    {
        tracks[0].enabled=true;
        elem.value="Mute"
        document.getElementById("AudioControl").innerHTML = "Mute";
    }
    else 
    {
        tracks[0].enabled=false;
        elem.value = "Unmute";
        document.getElementById("AudioControl").innerHTML = "Unmute";
    }
}

