/* Description: This JavaScript file controls the following processes:
    - Google authentication (Sign in)
    - Appearance of Google Picker
    - Prepares display of iframe, key, status, and side buttons
    - Sign out
    - Selection of new presentation
*/
// Enter the API Discovery Docs that describes the APIs you want to access
var discoveryDocs = ["https://slides.googleapis.com/$discovery/rest?version=v1"];
// Enter one or more authorization scopes. Refer to the documentation for
// the API or https://developers.google.com/people/v1/how-tos/authorizing
// for details
var scopes = 'https://www.googleapis.com/auth/presentations.readonly https://www.googleapis.com/auth/drive';

var authorizeButton = document.getElementById('authorize-button');
var sideButtons = document.getElementById('side-buttons');
var signoutButton = document.getElementById('signout-button');
var newPresentation = document.getElementById('new-presentation');
var center = document.getElementById('center');
var slidesDisplay = document.getElementById('slides');
var keyAndStatus = document.getElementById('key-and-status');
var key = document.getElementById('key');
var secret = document.getElementById('secret');
var secretBox = document.getElementById('secret-box');
var syncStatus = document.getElementById('status');
var syncInner = document.getElementById('synced');
var statusBox = document.getElementById('status-box');
var iframe = document.getElementById('iframe');
var user;
var authResponse;
var oauthToken;
var pickerApiLoaded = false;
var presentationId;
var presentation;
var clientId;


function handleClientLoad() {
    // Load the API client and auth2 library
    gapi.load('client:auth2', initClient);
    //Load the Picker API
    gapi.load('picker', onPickerApiLoad);
}

const getKeys = new Promise((resolve, reject) => {
    // Create a new XMLHttpRequest to get the corresponding slides object
    var xhr = new XMLHttpRequest(),
        method = 'GET',
        url = "https://cueclick.herokuapp.com/getKeys";
        xhr.open(method, url, true);
        xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
        }
    }
    xhr.send();
});

function initClient() {
    getKeys
    .then((data) => {
        clientId = data.clientId;
        gapi.auth2.init({
            'discoveryDocs': discoveryDocs,
            'clientId': data.clientId,
            'scope': scopes
        }).then(function () {
            // Listen for sign-in state changes
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            // Handle the initial sign-in state
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            // Set the current Google User
            gapi.auth2.getAuthInstance().currentUser.listen(updateUser);
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
        });
    });
}

// Callback to make sure that the Picker API has loaded
function onPickerApiLoad() {
  pickerApiLoaded = true;
  createPicker();
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      center.style.display = 'none';
      sideButtons.style.display = 'block';
      secret.innerHTML = "Click for secret key";
      socket.emit('web client signed in', socketId);
      createPicker();
    } else {
      sideButtons.style.display = 'none';
    }
}

// Store the current Google user
function updateUser(gUser) {
    user = gUser;
    if (user != null && user != undefined) {
        updateToken();
    }
}

// Store the access token
function updateToken() {
  authResponse = user.getAuthResponse(true);
  oauthToken = authResponse.access_token;
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
    socket.emit('web client signed out', socketId, room);
    // Reload the page on signout
    window.location.reload();
}

// Reopen a new picker for selecting another presentation
function openNewPresentation() {
    isInitialised = false;
    var pickedBefore = (iframe.style.display != 'none');
    if (pickedBefore) {
        // Return the mobile page to the instruction page during the selection
        socket.emit('re-choosing presentation', room);
    }
    createPicker();
}

// Create and render a Picker object for picking user slides
function createPicker() {
    if (pickerApiLoaded && oauthToken) {
      var view = new google.picker.View(google.picker.ViewId.PRESENTATIONS).
        setMimeTypes('application/vnd.google-apps.presentation');
      var picker = new google.picker.PickerBuilder().
        addView(view).
        setOAuthToken(oauthToken).
        setCallback(pickerCallback).
        build();
      picker.setVisible(true);
    }
}

// Callback implementation - get the Presentation object using its ID
// Alternatively, if no presentation was picked and the Picker is then
// closed, reload the previous presentation controls
function pickerCallback(data) {
    isInitialised = true;
    if(data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        var doc = data[google.picker.Response.DOCUMENTS][0];
        // If a new presentation is chosen, load it
        if (doc[google.picker.Document.ID] != presentationId) {
            presentationId = doc[google.picker.Document.ID];
            resetIFrame();
            getPresentation();
        } else {
            reloadSettings();
        }
    } else if (data[google.picker.Response.ACTION] == google.picker.Action.CANCEL) {
        reloadSettings();
    }
}

// Reload the last presentation controls if a presentation was previously
// selected in the event that the picker is cancelled and closed
function reloadSettings() {
    var pickedBefore = (iframe.style.display != 'none');
    if (pickedBefore) {
        socket.emit('picker cancelled', room);
    } else {
        socket.emit('re-choosing presentation', room);
    }
}

// Get the presentation by making a GET request to the Google Slides API
// and store the Presentation object in a variable
function getPresentation() {
    // Create a new XMLHttpRequest to get the corresponding slides object
    var xhr = new XMLHttpRequest(),
        method = 'GET',
        url = "https://slides.googleapis.com/v1/presentations/" + presentationId;
    xhr.open(method, url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + oauthToken);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            // Get the JSON object (the Presentation) from the returned string
            presentation = JSON.parse(xhr.responseText);
            displayPresentation();
        }
    }
    xhr.send();
}

// Display the chosen presentation in an iframe
function displayPresentation() {
    slidesDisplay.style.display = "block";
    keyAndStatus.style.display = "flex";
    key.style.display = "flex";
    syncStatus.style.display = "flex";
    iframe.src = "https://docs.google.com/presentation/d/" + presentation.presentationId + "/embed?start=false&loop=false&delayms=3000";
    socket.emit('presentation chosen', room);
    iframe.onload = function() {
        initWebControl();
    }
}
