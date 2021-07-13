let users;
const { psw,name } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const socket = io();

socket.emit('register',{name,psw})
document.getElementById('title').innerHTML="Welcome  "+name
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
      var mydiv=document.createElement('div')
      var a=document.createElement('a')         
      var link = document.createTextNode(docs[i].roomname);
      a.appendChild(link); 
      a.title = docs[i].roomname; 
      a.style.color="white"
      a.href = "chat.html?username="+name+"&room="+docs[i].roomname;  
      mydiv.append(a)
      document.getElementById('links').append(mydiv);
  }
})
function displayUsers()
{
  document.getElementById('userlist').disabled=true
  console.log("asking for user list")
    socket.emit('all rooms')
    
}
let rooms=[]
socket.on('all rooms',(docs)=>
{
  for(var i=0;i<docs.length;i++)
  rooms.push(docs[i].roomname)
  socket.emit('send users',name)
})


socket.on('user list',(docs)=>{
    users=docs
    console.log(docs)
    for(var i=0;i<docs.length;i++)
  {
      console.log(docs[i].username)
      var tmp=name+"_"+docs[i].username
      var ind=rooms.indexOf(tmp)
      tmp=docs[i].username+"_"+name
      ind=Math.max(ind,rooms.indexOf(tmp));
      console.log("index is ",ind)
      if(ind==-1)
      {
      var mydiv= document.createElement('div');
      var btn= document.createElement('button');
      btn.classList.add("btn2");
      btn.innerHTML=docs[i].username
      btn.addEventListener("click", function () 
      {
      var rname=name+"_"+this.innerHTML
      var other=this.innerHTML
      console.log("creating room with",other)
      this.disabled=true;
      socket.emit('create room',{rname,name,other})
      console.log(name,other,rname)
      var linkdiv=document.createElement('div')
      var a=document.createElement('a')   
      a.style.color="white"      
      var link = document.createTextNode(rname);
      a.appendChild(link); 
      a.title = rname; 
      a.href = "chat.html?username="+name+"&room="+rname; 
      linkdiv.append(a) 
      document.getElementById('links').append(linkdiv);
      })
      mydiv.append(btn)
      document.getElementById('users').appendChild(mydiv);
    }
   
  }
   
})


