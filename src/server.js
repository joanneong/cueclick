/* This is the server-side file of our mobile remote controller app.
   It initializes socket.io and a new express instance and controls the routing.
   Additionally, it also creates and keeps track of user sessions.
   Start it by running node server.js on your computer
*/

// Store all the currently connected web clients
var webClients = [];

// Create a socket.io server instance
var express = require('express');
var app = express();
var server  = require('http').Server(app);
var io      = require('socket.io')(server);
var static  = require('express-static');

// Import middleware for storing secret key on mobile end
var fs = require('fs');
var replace = require('stream-replace');

// Import middleware for secret key validation
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

// Listen on port 8000
// Uses process.env.PORT for Heroku deployment as Heroku will dynamically assign a port
server.listen(process.env.PORT || 8000);

// Serve static files by using static middleware
app.use("/css", static(__dirname + '/css'));
app.use("/js", static(__dirname + '/js'));
app.use("/img", static(__dirname + '/img'));

// Add body parser and validator to the middleware stack as well
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

// Serve the favicon file
app.get('/favicon.ico', function(req, res) {
    res.sendFile(__dirname + '/favicon.ico');
});

// Index route -- home page for website and mobile site
app.get('/', function (req, res) {

    console.log("at /: " + JSON.stringify(req.body));
    // Basic user agent check - test for mobiles
    var userAgent = req.headers['user-agent'];
    if (/mobile/i.test(userAgent)) {
        // Send mobile to the mobile login site
        res.sendFile(__dirname + '/pages/mobile.html');
    } else {
        // Send desktop to the main site
        res.sendFile(__dirname + '/pages/index.html');
    }
});

// Dealing with secret key input
app.post('/secretKey', function(req, res) {

    // Check that the secret key field is not empty (even though we have already
    // made the field a required field)
    req.checkBody('secretKey', 'Secret key required').notEmpty();

    // Trim and escape the secret key field
    req.sanitize('secretKey').escape();
    req.sanitize('secretKey').trim();

    // Run the validators
    var error = req.validationErrors();

    if (error) {
        // Send users to an error page if there is really an error (not supposed to happen!)
        res.send("We are really sorry, but an unexpected error occurred.");
        return;
    } else {
        // Otherwise, the data is valid
        // Store the secret key in a variable first
        var secretKey = req.body.secretKey;

        // Check if the secret key matches with any key in the database (current session)
        var index = webClients.indexOf(secretKey);

        // Send the user to the mobile controls if there is something that matches
        if (index != -1) {
            fs.createReadStream(__dirname + '/pages/mobileControl.html')
                .pipe(replace('to replace', secretKey))
                .pipe(res);
        } else {
            res.redirect('/');
        }
    }

});

// Instructions page
app.get('/infoPage', function(req, res) {
   res.sendFile(__dirname + '/pages/infoPage.html');
});

// Privacy policy page
app.get('/privacyPolicy', function(req, res) {
    res.sendFile(__dirname + '/pages/privacyPolicy.html');
});

// About page
app.get('/about', function(req, res) {
    res.sendFile(__dirname + '/pages/about.html');
});

// Uploading site verification file for Google's OAuth Developer Authentication form
app.get('/google8bf6e0ef8b22a71f.html', function(req, res) {
    res.sendFile(__dirname + '/pages/google8bf6e0ef8b22a71f.html');
});

// SOCKET IO
io.on('connection', function (socket) {

    // Shows list of connected clients on console whenever a new client connects
    io.clients(function(error, clients) {
        if (error) throw error;
        console.log(clients);
    });

    // Store web client id substring whenever a new web client connects
    socket.on('web client signed in', function(id) {
        console.log("web client connected: " + id);
        webClients.push(id.substr(0, 7));
    });

    // Remove web client id whenever a web client disconnects
    socket.on('web client signed out', function(id, room) {
        console.log("web client disconnected: " + id);
        var indexToRemove = webClients.indexOf(id.substr(0, 7));
        webClients.splice(indexToRemove, 1);
        socket.to(room).emit('web client signed out');
    });

    // Connect client to the correct room
    socket.on('room', function(room) {
        console.log("a new client, " + socket.id + " joined the room " + room);
        socket.join(room);
    });

    // Notify the relevant web client that a new mobile client has connected
    socket.on('mobile client signed in', function(webClientId, mobileClientId) {
        socket.to(webClientId).emit('mobile client signed in', mobileClientId);
    });

    // Send the current script to a newly connected mobile client
    socket.on('current script', function(mobileClientId, script, currentSlideNo, maxSlidesNo) {
        socket.to(mobileClientId).emit('current script', script, currentSlideNo, maxSlidesNo);
    });

    // Notify all connected clients except sender when a valid presentation is chosen
    socket.on('presentation chosen', function(room) {
        socket.to(room).emit('presentation chosen');
        console.log("presentation chosen");
    });

    // Notify all connected clients except sender when a new presentation is being selected
    socket.on('re-choosing presentation', function(room) {
        socket.to(room).emit('re-choosing presentation');
        console.log("rechoosing presentation");
    });

    // Notify all connected clients except sender when the Google Picker is cancelled
    socket.on('picker cancelled', function(room) {
        socket.to(room).emit('picker cancelled');
        console.log("picker cancelled");
    });

    // Notify all connected clients except sender when there are slide changes
    socket.on('next-slide', function(room) {
        socket.to(room).emit('next-slide');
    });

    socket.on('previous-slide', function(room) {
        socket.to(room).emit('previous-slide');
    });

    // Notify all connected clients to load the presenter notes
    socket.on('presenter note', function(room, notes, currentSlideNo, maxSlidesNo) {
        socket.to(room).emit('presenter note', notes, currentSlideNo, maxSlidesNo);
    });

});
