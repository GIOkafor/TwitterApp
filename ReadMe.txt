Twitter Live Search App
---------------------------

To run: 
1) Download and unzip file.
2) Navigate to root folder and run 'npm install'.
3) Navigate to public folder and run 'bower install'.
4) From root folder, run 'node server.js' to start application.
5) Finally open up a browser and go to 'localhost:3000' to see the app in action.

Usage:
 The app queries the twitter API for a keyword entered by the user and returns the last 10 tweets containing it. IThen it continually monitors twitter for subsequent tweets containing said keyword and updates page in real time with tweets and a link to the original tweet.  