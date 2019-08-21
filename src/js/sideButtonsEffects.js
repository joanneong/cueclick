/* Description: This JavaScript file controls the following processes:
    - Yellow border materialises when hovering over side buttons
*/

var topPresentation = document.getElementById('top-presentation');
var bottomPresentation = document.getElementById('bottom-presentation');
var topSignout = document.getElementById('top-button');
var bottomSignout = document.getElementById('bottom-button');


// Make yellow border appear when hovering over 'new presentation' button
function hoverP() {
    topPresentation.style.display = 'block';
    bottomPresentation.style.display = 'none';
}

// Make yellow border disappear when moving out of 'new presentation' button
function unhoverP() {
    topPresentation.style.display = 'none';
    bottomPresentation.style.display = 'block';
}

// Make yellow border appear when hovering over 'signout' button
function hoverS() {
    topSignout.style.display = 'block';
    bottomSignout.style.display = 'none';
}

// Make yellow border disappear when moving out of 'signout' button
function unhoverS() {
    topSignout.style.display = 'none';
    bottomSignout.style.display = 'block';
}
