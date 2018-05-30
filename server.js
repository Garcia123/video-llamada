var express = require("express.io");
//var https = require('https');
var fs = require('fs');

var options = {
   key: fs.readFileSync('mitienda.key'),
   cert: fs.readFileSync('mitienda.crt')
};

var app = express();
app.http().io();
//app.https(options).io();
var cont = 0;
var PORT = 3000;
console.log("server started on port " + PORT);
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
   res.render("index.ejs");
});

app.io.route("ready", (req) => {

   req.io.join(req.data.chat_room);
   req.io.join(req.data.signal_room);

   app.io.room(req.data).broadcast("announce", {
      message: "new client in the " + req.data + "room."
   });

});

app.io.route("send", (req) => {
   app.io.room(req.data.room).broadcast("message", {
      message: req.data.message,
      author: req.data.author
   });
});

app.io.route("signal", (req) => {
   
   req.io.room(req.data.room).broadcast('signaling_mensaje', {
      type: req.data.type,
      message: req.data.message
   });
});

app.listen(PORT);