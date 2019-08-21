//Shows the secret key when it is hidden
function show() {
    secret.innerHTML = socketId.substr(0, 7);
    secretBox.style.borderColor = "yellow";
}

//Hides the secret key when it is shown
function hide() {
    secret.innerHTML = "Click for secret key";
    secretBox.style.borderColor = "white";
}

var keyShown = 0;

//Function to toggle between showing and hiding the secret when the secret box is clicked
secretBox.addEventListener("click", function() {
    if (keyShown === 0) {
        keyShown = 1;
        show();
    } else {
        keyShown = 0;
        hide();
    }
}, false);
