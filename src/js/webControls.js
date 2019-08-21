/* Description: This JavaScript file controls the following processes:
    - Display of chosen presentation in the iframe
    - Retreival of speakers note and passing it to the server
    - Changing iframe contents according to mobile navigations
*/

// Default url for any presentation
var defaultUrl;
// An array of all the slides in the chosen presentation
var slides;
// Record the current slide and current speakers note
var currentSlide;
var speakerNote;

// Create new socket instance
// Socket.IO connection established to '/'
var socket = io.connect('/');
var socketId;
var room;
// TEMPORARY solution: make each web client join a room that is a substring of its id
socket.on('connect', function() {
    socketId = socket.id;
    room = socketId.substr(0, 7);
    socket.emit('room', room);
});

// Check if a slide has been chosen and loaded
var isInitialised;
// Counters to ensure there is a 'next' and 'previous' slide
var currentSlideNo;
var maxSlidesNo;
// Boolean value to indicate whether the next slide has loaded
var isReady = true;
// Store the script for the current slide of the presentation
var currentScript;

// Initialise variables, and ensure that chosen presentation has been loaded
// before remote control is allowed
function initWebControl() {
    mobileClientCount = 0;
    defaultUrl = "https://docs.google.com/presentation/d/" + presentation.presentationId + "/embed?start=false&loop=false&delayms=3000";
    slides = presentation.slides;
    currentSlideNo = 0;
    maxSlidesNo = presentation.slides.length;
    currentSlide = slides[0];
    speakerNote = "";
    sendNotes();
    isInitialised = true;
}

// Get the notes for the current slide in the iframe
function sendNotes() {
    var notesPage = currentSlide.slideProperties.notesPage;
    var notesId = notesPage.notesProperties.speakerNotesObjectId;
    // Find the object with the speaker notes Id
    // Note that the hierarchy works like this: a slide has a notes page, a notes
    // page has several page elements, and one of these elements is the shape
    // containing the text content which wraps the speakers notes. Deep, I know ;_;
    for (var i = 0; i < notesPage.pageElements.length; i++) {
        var currentProperty = notesPage.pageElements[i];
        if (currentProperty.objectId == notesId) {
            var notesShape = currentProperty.shape;
            var notesText = notesShape.text;
            // If there is no speaker note in the current slide, break from the loop
            if (notesText == undefined) {
                break;
            }
            var notesTextContent = notesText.textElements;
            for (var j = 0; j < notesTextContent.length; j++) {
                var notesTextElement = notesTextContent[j];
                if (notesTextElement.hasOwnProperty('textRun')) {
                    var notesTextRun = notesTextElement.textRun;
                    var notes = notesTextRun.content;
                    speakerNote += notes;
                }
            }
            // Remove trailing whitespaces (retains spacing within the string though)
            speakerNote = speakerNote.trim();
            // Exit after the correct element has been found and dealt with since
            // there is only one notes page per slide
            break;
        }
    }

    // Store the script of the current slide
    currentScript = speakerNote;

    socket.emit('presenter note', room, speakerNote, currentSlideNo, maxSlidesNo);
    // Reset speakerNote after sending it to mobile
    speakerNote = "";
}

// Reset the variables and view in the iframe when new presentation is picked
function resetIFrame() {
    defaultUrl = null;
    slides = null;
    currentSlide = null;
    speakerNote =  "";
    isInitialised = false;
    currentSlideNo = null;
    maxSlidesNo = null;
    isReady = true;
}

// Ensure that the iframe has loaded before proceeding to prevent asynchronous
// programming from screwing up the slide counters
function changeReadyState() {
    isReady = true;
}

// Change the display in the iframe to the slide corresponding to slideNo
function slideChange() {
    currentSlide = slides[currentSlideNo];
    var currentSlideId = currentSlide.objectId;
    // Change the presenter note display on mobile whenever there is a valid slide change
    sendNotes();
    iframe.src = defaultUrl + "#slide=id." + currentSlideId;
    iframe.onload = changeReadyState();
}

// Update the sync status whenever a new mobile client connects
function updateSyncStatus() {
    syncInner.innerHTML = "SYNCED";
    statusBox.style.borderColor = "yellow";
};

// Whenever a new mobile client signs in, send the script for the current slide to new client
// Also, increment the counter for number of connected mobile clients, and change the sync
// status on the desktop accordingly
socket.on('mobile client signed in', function(mobileClientId) {
    socket.emit('current script', mobileClientId, currentScript, currentSlideNo, maxSlidesNo);
    // Hide the secret key once a new mobile client connects
    hide();
    updateSyncStatus();
});

// Listen for the 'next-slide' event emitted by mobile client
socket.on('next-slide', function() {

    // Check if a valid presentation has been selected
    if (isInitialised) {
        // Check if the current slide has been loaded into the iframe
        if (isReady) {
            // Check if there is a next slide
            if (currentSlideNo < (maxSlidesNo - 1)) {
                isReady = false;
                currentSlideNo++;
                slideChange();
            }
        }
    }

});

// Listen for the 'previous-slide' event emitted by mobile client
socket.on('previous-slide', function() {

    // Check if a valid presentation has been selected
    if (isInitialised) {
        // Check if the current slide has been loaded into the iframe
        if (isReady) {
            // Check if there is a previous slide
            if (currentSlideNo > 0) {
                isReady = false;
                currentSlideNo--;
                slideChange();
            }
        }
    }

});
