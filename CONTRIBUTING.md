# Contribution guide

## Project set-up

1. Fork this repository.
2. Clone the forked repository to your local computer.
3. Check that you have [Node](https://nodejs.org/en/download/) installed.
4. Visit the [Google Developers Console](https://console.developers.google.com) and start a new project.
5. Go to Credentials --> Create Credentials --> Web Application (Configure the consent screen accordingly if necessary)
6. Create an API Key by pressing Create Credentials --> API key.
7. Create an OAuth 2.0 client ID by pressing Create Credentials --> OAuth client ID and select "Web application". In the "Authorized JavaScript origins" field, enter the origin for the application:

    ```markdown
    http://localhost:8000
    https://cueclick.herokuapp.com
    ```

8. Go to Dashboard --> ENABLE APIS AND SERVICES. Search for and enable three APIS:
    - Google Slides API
    - Google Drive API
    - Google Picker API
9. Join this [Google group](https://groups.google.com/forum/#!forum/risky-access-by-unreviewed-apps) for unreviewed Google applications.
10. Update `default.js` with the [API key and OAuth client ID](https://console.developers.google.com/apis/credentials).
11. Open the terminal/command line, and switch to the project folder. Install the necessary dependencies by doing `npm install`.
12. Run the project by doing `npm run start`.
13. Go to `localhost:8000` in your browser using your desktop.
14. Find the [IPV4 address](https://en.wikipedia.org/wiki/IPv4) for your desktop ([MacOS](http://osxdaily.com/2010/11/21/find-ip-address-mac/) and [Windows](https://kb.wisc.edu/page.php?id=27309)).
15. On your mobile phone browser, enter the corresponding IPV4 address (from step 13), along with the port 8000 to see the mobile site. For example, if the IPV4 address found is 129.168.1.209, enter `129.168.1.209:8000` into the browser on your mobile phone.

Note: Joining the Google Group is necessary before any deployment is done. If you choose to deploy the application (e.g. on Heroku), [this form](https://support.google.com/code/contact/oauth_app_verification) can be submitted for the application to be reviewed.

## Project contribution

1. Create a new branch.

    ```git
    git checkout -b <new_branch>
    ```

2. Make changes to the branch.
3. Commit the changes made. Remember not to commit `config.js` as it contains sensitive data. An easier workaround would be to do:

    ```git
    vim .gitignore
    ```

and add `config.js` into the `.gitignore` file.
4. Submit a pull request for the changes made.
