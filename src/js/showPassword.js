var p = document.getElementById("pwd");
var show = document.getElementById("show");
var hide = document.getElementById("hide");

//Shows the password when it is hidden
function showPwd() {
    p.setAttribute('type', 'text');
    hide.style.display = 'block';
    show.style.display = 'none';
}

//Hides the password when it is shown
function hidePwd() {
    p.setAttribute('type', 'password');
    hide.style.display = 'none';
    show.style.display = 'block';
}

var pwShown = 0;

//Function to toggle between showing and hiding the password when eye is clicked
document.getElementById("showHide").addEventListener("click", function() {
    if (pwShown === 0) {
        pwShown = 1;
        showPwd();
    } else {
        pwShown = 0;
        hidePwd();
    }
}, false);
