# Cueclick

## Table of Contents

- [Motivation](#motivation)
- [Scope of Project](#scope-of-project)
- [Features Implemented](#features-implemented)
- [Instructions](#instructions----how-to-run-the-code)
- [Issues and Bugs](#known-issues-and-bugs)

## Motivation

Presentations are important; they communicate and sell our ideas to a target audience. We try to perfect our presentations, but it can be expensive and bothersome to do so. Why?

For a start, we need to control the slides during our presentation. Unfortunately, depending on our teammates can sometimes result in out-of-sync slides, while a clicker is bulky, easy to forget, and not necessarily cheap. Additionally, we may want to reference our scripts during the presentation, but fumbling with a stack of cue-cards or worse, forgetting to bring the cue-cards can destroy the entire presentation.

This then begs the question: can we control our presentations in a cheaper and more convenient way?

## Scope of project

The web-application provides a site for users to show their Google Slides presentation from their desktop, and to control their slides using their mobile phones.

Consequently, this site has to be accessed on both desktop and mobile to allow for real time communication between the devices. On desktop, users can log into their Google Drive accounts to select their presentation slides. Meanwhile, the mobile end combines the functionalities of clickers and cue cards to give users remote control of their presentations while displaying their scripts on their phones.

## Features implemented

### Web

- Authenticate users via Google sign-in
- Allow users to choose their intended presentation
- Display intended presentation in an expendable iframe
- Switch slide display in response to mobile controls
- Allow users to choose a new presentation
- Allow users to sign out of the web application

### Mobile

- Allow users to connect to and control a specific presentation via a secret key
- Allow users to control the presentation by swiping left and right
- Display corresponding speaker notes (i.e. script) on connected mobile devices
- Switch script display in response to mobile controls
- Automatically 'sign out' all connected users and redirect them to secret key login page whenever the corresponding web client has signed out on desktop

## Instructions -- How to run the code

Click [here](https://cueclick.herokuapp.com) to see a live demo.

For details on how to run the code locally, check out [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Known issues and bugs

### Sign in

- If a user closes the window that pops up during Google login, the web console will throw an error
- If a user repeatedly refreshes the mobile client page after logging in successfully with the
secret key, the number of connected clients detected will simply keep increasing

### Presentation

- If a user presses the control on the iframe, the mobile controls will become inaccurate, and
will fail. Due to cross-origins issues, it is hard to determine when the location of the iframe
content has changed
- The iframe is currently at a fixed width and height, which may be inconvenient for smaller
desktops/laptops/tablets. However, the current solution is hard-coded (i.e. the presentation is retrieved via an embed link) so there is little choice to resolve this at the moment

### Sign out

- If a user refreshes the page after signing in, the whole page becomes unresponsive, and is
treated as a new client
