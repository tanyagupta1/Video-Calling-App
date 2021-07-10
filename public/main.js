// const socket = io('/') // Create our socket
// const videoGrid = document.getElementById('video-grid') // Find the Video-Grid element

// const myPeer = new Peer() // Creating a peer element which represents the current user
// const myVideo = document.createElement('video') // Create a new video tag to show our video
// myVideo.muted = true // Mute ourselves on our end so there is no feedback loop

// // Access the user's video and audio
// navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true
// }).then(stream => {
//     addVideoStream(myVideo, stream) // Display our video to ourselves

//     myPeer.on('call', call => { // When we join someone's room we will receive a call from them
//         call.answer(stream) // Stream them our video/audio
//         const video = document.createElement('video') // Create a video tag for them
//         call.on('stream', userVideoStream => { // When we recieve their stream
//             addVideoStream(video, userVideoStream) // Display their video to ourselves
//         })
//     })

//     socket.on('user-connected', userId => { // If a new user connect
//         connectToNewUser(userId, stream) 
//     })
// })

// myPeer.on('open', id => { // When we first open the app, have us join a room
//     socket.emit('join-room', ROOM_ID, id)
// })

// function connectToNewUser(userId, stream) { // This runs when someone joins our room
//     const call = myPeer.call(userId, stream) // Call the user who just joined
//     // Add their video
//     const video = document.createElement('video') 
//     call.on('stream', userVideoStream => {
//         addVideoStream(video, userVideoStream)
//     })
//     // If they leave, remove their video
//     call.on('close', () => {
//         video.remove()
//     })
// }


// function addVideoStream(video, stream) {
//     video.srcObject = stream 
//     video.addEventListener('loadedmetadata', () => { // Play the video as it loads
//         video.play()
//     })
//     videoGrid.append(video) 
// }

let users;
const { email, psw,name } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const socket = io();
socket.emit('register',{name,email,psw})
document.getElementById('name').innerHTML="Welcome  "+name
function displayRooms()
{
  socket.emit('send rooms',name)
}
displayRooms();

socket.on('rooms list',(docs)=>
{
  for(var i=0;i<docs.length;i++)
  {
      console.log(docs[i].roomname)
      
      var a=document.createElement('a')         
      var link = document.createTextNode(docs[i].roomname);
      a.appendChild(link); 
      a.title = docs[i].roomname; 
      a.href = "chat.html?username="+name+"&room="+docs[i].roomname;  
      document.getElementById('links').append(a);
  }
})
function displayUsers()
{
  console.log("asking for user list")
    socket.emit('send users',name)
}


socket.on('user list',(docs)=>{
    users=docs
    console.log(docs)
    for(var i=0;i<docs.length;i++)
  {
      console.log(docs[i].username)
      var btn= document.createElement('button');
      btn.innerHTML=docs[i].username
      btn.addEventListener("click", function () 
      {
      var rname=name+"_"+this.innerHTML
      var other=this.innerHTML
      console.log("creating room with",other)
      this.disabled=true;
      socket.emit('create room',{rname,name,other})
      console.log(name,other,rname)
      var a=document.createElement('a')         
      var link = document.createTextNode(rname);
      a.appendChild(link); 
      a.title = rname; 
      a.href = "chat.html?username="+name+"&room="+rname;  
      document.getElementById('links').append(a);
      });
      
      
      document.getElementById('users').appendChild(btn); 
  }


})


