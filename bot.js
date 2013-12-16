var PlugAPI = require('./plugapi'); // git clone (or unzip) into the same directory as your .js file. There should be plugapi/package.json, for example (and other files)
var ROOM = 'new-to-this-shit-mrsuicidesheep';
var UPDATECODE = '$&2h72=^^@jdBf_n!`-38UHs'; // We're not quite sure what this is yet, but the API doesn't work without it. It's possible that a future Plug update will change this, so check back here to see if this has changed, and set appropriately, if it has. You can omit using it if you wish - the value as of writing needs to be '$&2h72=^^@jdBf_n!`-38UHs', and is hardcoded into the bot in the event it is not specified below.

// Instead of providing the AUTH, you can use this static method to get the AUTH cookie via twitter login credentials:
PlugAPI.getAuth({
    username: 'BaderBombs',
    password: 'chewy767'
}, function(err, auth) { // if err is defined, an error occurred, most likely incorrect login
    if(err) {
        console.log("An error occurred: " + err);
        return;
    }
    //console.log(auth);
    var bot = new PlugAPI(auth, UPDATECODE);
    bot.connect(ROOM);

    bot.on('roomJoin', function(data) {
        // data object has information on the room - list of users, song currently playing, etc.
        //console.log("Joined " + ROOM + ": ", data);
        //bot.sendChat("Test!");
    });

    bot.on('chat', commands);

    function commands (data) {
        if (data.message===".hey") {
            bot.sendChat("Well hey there "+data.from+"!");
        }
        else if (data.message===".props") {
            bot.sendChat("Nice play "+checkCurrentDJ()+"!");
        }
    }
});
