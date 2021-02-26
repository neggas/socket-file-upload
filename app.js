

const express = require('express');
const fs = require("fs")
const app = express();
const http = require("http").Server(app)
const io = require('socket.io')(http);

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res)=> {
  res.sendFile(__dirname +'/index.html');
});

let files = {}
let struct = {
    name:null,
    type:null,
    size:0,
    data:[],
    slice:0
}
io.on("connection",(socket)=>{
    console.log("user is connected !")
    
    socket.on("upload",(data)=>{
        
        if(!files[data.name]){
            files[data.name] = Object.assign({},struct,data);
            files[data.name].data = [];
        }

        data.data = new Buffer.from(new Uint8Array(data.data));
        files[data.name].data.push(data.data);
        files[data.name].slice++;


        if (files[data.name].slice * 100000 >= files[data.name].size) {  

          
            let fileBuffer = Buffer.concat(files[data.name].data); 
            fs.writeFile('./'+data.name, fileBuffer, (err) => { 
                delete files[data.name]; 
                if(err) throw err;
                socket.emit('end upload');
            }); 

           


        } else { 
            socket.emit('request slice upload', { 
                currentSlice: files[data.name].slice 
            }); 
        } 
       
    })
})

http.listen(3000,()=>{
    console.log("app ouvert sur le port 3000")
})
