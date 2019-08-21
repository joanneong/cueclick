// Segment for displaying the presenter note
var presenterNotes = document.getElementById('note');

// Create new socket instance
var socket = io.connect('/');

// TEMPORARY room
var room = webClientId;

// Once socket has connected, join it to the web client room
socket.on('connect', function() {
    socket.emit('room', room);
    socket.emit('mobile client signed in', webClientId, socket.id);
    initNotesDisplay();
});

// Retrieve script at the point in time when the mobile client connects
socket.on('current script', function(script, currentSlideNo, maxSlidesNo) {
    updateSlidesNo(currentSlideNo, maxSlidesNo);
    displayNotes(script);
});

// Make presenter note div appear after a valid presentation is chosen
socket.on('presentation chosen', function() {
    initNotesDisplay();
});

// Prepares the segment for the script to be displayed
function initNotesDisplay() {
    presenterNotes.style.display = 'flex';
    instructions.style.display = 'none';
}

// Listen for presenter note event
socket.on('presenter note', function(notes, currentSlideNo, maxSlidesNo) {
    updateSlidesNo(currentSlideNo, maxSlidesNo);
    displayNotes(notes);
});

// Updates the slide number above the script display
function updateSlidesNo(currentSlideNo, maxSlidesNo) {
    var trueCurrentSlideNo = currentSlideNo + 1;
    var slideNo = document.getElementById('slide-no');
    slideNo.innerHTML = "Slide " + trueCurrentSlideNo + "/" + maxSlidesNo;
}

// Display the presenter note on mobile
function displayNotes(notes) {
    var oldContent = document.getElementById('script');
    var para = document.createElement("p");
    para.id = 'script';
    var newContent = document.createTextNode(notes);
    para.appendChild(newContent);
    presenterNotes.replaceChild(para, oldContent);
}

// Make presenter note div disappear, and instructions div reappear when
// new slides are being chosen
socket.on('re-choosing presentation', function() {
    presenterNotes.style.display = 'none';
    instructions.style.display = 'block';
});

// Make the previous script be loaded again if the picker is cancelled
// without picking a new presentation
socket.on('picker cancelled', function() {
    instructions.style.display = 'none';
    presenterNotes.style.display = 'block';
});

// Make the page refresh and redirect to the pre-sign in page if any signout
// occurs on the web client end
socket.on('web client signed out', function() {
    alert("web client signed out!");
    document.location.href = '/';
});

// Add event listeners for touchstart (new touch on the surface)
// and touchmove (when user moves a touch point along the surface)
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

function handleTouchMove(evt) {
    if ( !xDown || !yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs( xDiff ) > Math.abs( yDiff )) {
        if ( xDiff > 0 ) {
            // Swipe towards left <--
            socket.emit('next-slide', room);
        } else {
            // Swipe towards right -->
            socket.emit('previous-slide', room);
        }
    }
    // Reset values
    xDown = null;
    yDown = null;
};
