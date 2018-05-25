var express = require("express.io");
var app = express();
app.http().io();
var PORT = 3000;
console.log("server started");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.io.route("ready", (req) => {

})

app.listen(PORT);