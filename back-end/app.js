
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
app.use(express.static(__dirname));


// export one function that gets called once as the server is being initialized
module.exports = function (app, server) {

    
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', '*');
        next();
    });

    app.use(express.json());

    const io = require('socket.io')(server, {
        cors: {
            origin: "http://127.0.0.1:5000",
            methods: ["GET", "POST"] 
            
        }
    })

    require('./socket/chat')(io);

    app.use(function (req, res, next) { req.io = io; next(); });

    app.get('/test', (req, res, next) => {
        res.status(200).json({ hello: 'world' })
    })


    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false}));

    var dburl=
            "mongodb+srv://NodeJs:Rootroot@nodejscluster.zxuny.mongodb.net/test";
    var Message = mongoose.model("message", {
        name:String,
        message:String
    });

    app.get ("/messages", async (req, res) => {
        Message.find({}, (err, messages) => {
            res.send(messages);
        });
    });

    app.post("/messages", async (req, res) => {
        try {
            var message = new Message(req.body);
            var savedMessage = await message.save();
            console.log("saved");

            var censored = await Message.findOne({ message: "badword" });

            if (censored) await Message.remove({_id: censored.id });
            else io.emit("message", req.body);
            res.sendStatus(200);}
            catch (error) {
                res.sendStatus(500);
                return console.error(error);
            } finally {
                console.log("message post called");
            }
    });

    io.on("connection", socket => {
        console.log("a user has been connected");
    });

    mongoose.connect(
        dburl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        err => {
            console.log("server is listening on port", server.address().port);
        }
    );

    var server = http.listen(3000, () => {
        console.log("server is listening on port", server.address().port);
    });

}  