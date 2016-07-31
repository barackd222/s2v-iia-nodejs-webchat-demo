# s2v-iia-nodejs-webchat-demo

This webchat is based on Node.JS socket.io - It integrates with Gravatar, responsivevoice TTS and Sphero's APIs via free English based commander.

To run it:

1. Clone or download Zip file
2. npm install
3. node app.js
4. Open a browser and go to http://IP:8080
5. In the browser enter a nickname and email - Ideally use an account that has a Gravatar account, so that it can integrate with it and use your picture, rather than a grey faceless man.
6. Once you create a private room, it will give you a unique id, give it to a friend (make sure the IP address is accessible by your friend) and ask him to enter a nickname and email as well.
7. That's it, happy chatting!

If you want to send commands to the Sphero, you can type the commands in free English (non case-sensitive), just make sure to follow these rules:

a) Sphero - Must be at the very beginning of your sentence.
b) Shapes that are supported so far: square, triangle and line - Though it is easy to extend any shape or command
c) Colours that are supported are: red, blue, yellow, green and pink.

For example, the following sentences work in the same way:

     - Sphero, would you be gentle enough to help us making a square and while you do it flash a red color.
     - Sphero make a square and turn red
     - Sphero square red

Note: Since this webchat integrates with Gravatar and responsivevoice TTS, it requires access to Internet.
