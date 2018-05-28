var express = require("express.io");
var app = express();
app.http().io();
var PORT = 3000;
console.log("server started on port " + PORT);
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.io.route("ready", (req) => {
    req.io.join(req.data);
    app.io.room(req.data).broadcast("announce", {
        message: "new client in the " + req.data + "room."
    })
});

app.io.route("send", (req) => {
    app.io.room(req.data.room).broadcast("message", {
        message: req.data.message,
        author: req.data.author
    });
});
app.listen(PORT);