var PlugAPI = require('plugapi'); //Use 'git clone git@github.com:plugCubed/plugAPI.git' in your node_modules

var bot = new PlugAPI({
    "email": "jbader@conncoll.edu",
    "password": "xxx"
});
var ROOM = 'chillout-mixer-ambient-triphop';
bot.connect(ROOM); // The part after https://plug.dj

var Lastfm = require('simple-lastfm'); //Use 'npm install simple-lastfm'
var lastfm = new Lastfm({ //Get own last.fm account with api_key, api_secret, username, and password
    api_key: 'd657909b19fde5ac1491b756b6869d38',
    api_secret: '571e2972ae56bd9c1c6408f13696f1f3',
    username: 'BaderBombs',
    password: 'xxx'
});

var LastfmAPI = require('lastfmapi');
var lfm = new LastfmAPI({
    'api_key' : 'd657909b19fde5ac1491b756b6869d38',
    'secret' : '571e2972ae56bd9c1c6408f13696f1f3'
});

var api = require('dictionaryapi'); //Use 'npm install dictionaryapi'

var Wiki = require("wikijs"); //Use 'npm install wikijs'

var google_geocoding = require('google-geocoding'); //Use 'npm install google-geocoding'
var weather = require('weathers'); //Use 'npm install weathers'

var mlexer = require('math-lexer'); //Use 'npm install math-lexer'

var MsTranslator = require('mstranslator'); //Use 'npm install mstranslator'
var client = new MsTranslator({client_id:"PlugBot", client_secret: "uScbNIl2RHW15tIQJC7EsocKJsnACzxFbh2GqdpHfog="}); //Get own Microsoft Translator account with client_id and client_secret
var translateList = [];

var request = require('request'); //Use 'npm install request'
var time = require('time'); //Use 'npm install time'

var reconnect = function() { 
    bot.connect(ROOM); 
};

bot.on('close', reconnect);
bot.on('error', reconnect);

var media = null;
var waitlist = null;
var dj = null;
var staff = null;
var users = null;
var roomScore = null;

//Event which triggers when the bot joins the room
bot.on('roomJoin', function(data) {
    media = bot.getMedia();
    waitlist = bot.getWaitList();
    dj = bot.getDJ();
    staff = bot.getStaff();
    users = bot.getUsers();
    console.log("I'm live!");
});

//Event which triggers when new DJ starts playing a song
bot.on('advance', function(data) {
    media = bot.getMedia();
    dj = bot.getDJ();
    waitlist = bot.getWaitList();
    var noSpaceName = media.author.toLowerCase().replace(/ +/g, "");
    var wordCheck = false;
    var authorWords = media.author.toLowerCase().split(' ');
    for (var i=0; i < authorWords.length; i++){
        //console.log(authorWords[i]);
        if (dj.username.toLowerCase().indexOf(authorWords[i]) > -1 && authorWords[i].match(/[a-zA-Z]/g)){
            wordCheck = true;
        }
    }
    //console.log("No Space Name: " + noSpaceName + ", Word Check: " + wordCheck + ", Author: " + dj.username.toLowerCase());
    if (dj.username.toLowerCase() == media.author.toLowerCase() || dj.username.toLowerCase() == noSpaceName || wordCheck){
        var link = 'http://api.soundcloud.com/users.json?q=' + media.author + '&consumer_key=apigee';
        request(link, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                if (info[0] != undefined){
                    bot.sendChat(info[0].username + ": " + info[0].permalink_url);
                }
            }
        });
    }
    //bot.sendChat("Last song: :thumbsup: " + data.lastPlay.score.positive + " :star: " + data.lastPlay.score.curates + " :thumbsdown: " + data.lastPlay.score.negative);
    //bot.sendChat(":musical_note: " + data.dj.username + " started playing \"" + data.media.title + "\" by " + data.media.author + " :musical_note:");
});

//Event which triggers when the waitlist changes
bot.on('djListUpdate', function(data) {
    waitlist = bot.getWaitList();
});

//Event which triggers when user skips his song
bot.on('skip', function(data) {
    media = bot.getMedia();
    dj = bot.getDJ();
    waitlist = bot.getWaitList();
});

//Event which triggers when a mod skips the song
bot.on('modSkip', function(data) {
    media = bot.getMedia();
    dj = bot.getDJ();
    waitlist = bot.getWaitList();
});

//Still figuring out how this works
bot.on('floodChat', function(data) {
    bot.sendChat("flood!");
});

//Event which triggers with a user joins the room
bot.on('userJoin', function(data) {
    //console.log(data);
    staff = bot.getStaff();
    users = bot.getUsers();
});

//Event which triggers when the current song receives 5 mehs, skips the song
var setmehs = false;
var mehs = 4;
bot.on('vote', function(data) {
    roomScore = bot.getRoomScore();
    if (roomScore.negative > mehs && setmehs){
        bot.sendChat("@" + dj.username + " Your tune does not fall within the established genre of the Chillout Mixer. Please type .noplay or .yesplay for more info.");
        bot.moderateForceSkip(dj.id);
    }
});

//Event which triggers when anyone chats
bot.on('chat', function(data) {
    var command=data.message.split(' ')[0];
    var firstIndex=data.message.indexOf(' ');
    var qualifier="";
    if (firstIndex!=-1){
        qualifier = data.message.substring(firstIndex+1, data.message.length);
    }
    qualifier=qualifier.replace(/&#39;/g, '\'');
    qualifier=qualifier.replace(/&#34;/g, '\"');
    qualifier=qualifier.replace(/&amp;/g, '\&');
    qualifier=qualifier.replace(/&lt;/gi, '\<');
    qualifier=qualifier.replace(/&gt;/gi, '\>');
    switch (command)
    {
        case ".commands": //Returns a list of the most important commands
            bot.sendChat("List of Commands: .about, .album, .artist, .calc, .define, .events, .facebook, .forecast, .genre, .google, .github, .props, .similar, .soundcloud, .temp, .time, .track, .translate, .twitter, and .wiki");
            break;
        case ".modcommands": //Returns a list of the most important commands
            bot.sendChat("List of Mod Commands: .autoskip, .autotranslate, .banuser, .front, .join, .leave, .meh, .move, .setmehs, .skip, .unskip, .untranslate, .warn, and .woot");
            break;
        case ".hey": //Makes the bot greet the user 
        case ".yo":
        case ".hi":
        case ".bot":
            bot.sendChat("Well hey there! @"+data.from);
            break;
        case ".yesplay": //Gives the room criteria for acceptable genres
            bot.sendChat("Types of music we encourage in the Chillout Mixer: Trip Hop, Ambient, Psybient, Dub, Liquid DnB, Acid Jazz, as well as some occasional instrumental chillwave/hip hop/trap when it fits. Think downtempo... soothing, relaxing electronica.");
            break;
        case ".noplay": //Gives the room criteria for unacceptable genres
            bot.sendChat("DO NOT PLAY: Rock genres (Indie/Post/Alt/etc), Wubs (Chillstep/Dubstep/Brostep), EDM - Dance Music (Trance/House/etc), or vocal Hip Hop/Rap/Trap. Music MUST be chill and fit the Rooms flow. Repeated failure to obey these rules may = ban.")
            break;   
        case ".warn": //Skips a user playing an off-genre song
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    bot.sendChat("@" + dj.username + " Your tune does not fall within the established genre of the Chillout Mixer. Please type .noplay or .yesplay for more info.");
                    bot.moderateForceSkip(dj.id);
                }
            }
            break;
        case ".banuser": //Bans a user from the room permanently with .banuser [givenUser]
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    for (var j=0; j<users.length; j++){
                        if (users[j].username == qualifier){
                            bot.moderateBanUser(users[j].id, 1, 'f');
                        }
                    }
                }
            }
            break;
        case ".move": //Moves a user in the waitlist with .move [givenUser], [givenSpot]
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1 && staff[i].role > 1){
                    for (var j=0; j<users.length; j++){
                        if (users[j].username == qualifier.split(' ')[0]){
                            if (Number(qualifier.split(' ')[1]) > waitlist.length){
                                bot.sendChat("Sorry, there are only " + waitlist.length + " people in the waitlist, please try again.");
                            }
                            else{
                                bot.moderateMoveDJ(users[j].id, Number(qualifier.split(' ')[1]));
                            }
                        }
                    }
                }
            }
            break;
        case ".front": //Moves a user to the front of the waitlist with .front [givenUser]
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1 && staff[i].role > 1){
                    for (var j=0; j<users.length; j++){
                        if (users[j].username == qualifier.split(' ')[0]){
                            bot.moderateMoveDJ(users[j].id, 1);
                        }
                    }
                }
            }
            break;
        case ".woot": //Makes the bot cast an upvote
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    bot.sendChat("I can dig it!");
                    bot.woot();
                }
            }
            break;
        case ".meh": //Makes the bot cast a downvote
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    bot.sendChat("Please... make it stop :unamused:");
                    bot.meh();
                }
            }
            break;
        case ".props": //Makes the bot give props to the user
        case ".propsicle":
            bot.sendChat("Nice play! @"+dj.username);
            break;
        case ".join": //Makes the bot join the waitlist
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    bot.joinBooth();
                    bot.sendChat("Joining waitlist!");
                }
            }
            break;
        case ".leave": //Makes the bot leave the waitlist
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    bot.leaveBooth();
                    bot.sendChat("Leaving waitlist.");
                }
            }
            break;
        case ".skip": //Makes the bot skip the current song
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    bot.sendChat("Skipping!");
                    bot.moderateForceSkip(dj.id);
                }
            }
            break;
        case ".github": //Returns a link to the bot's GitHub repository
            bot.sendChat("Check me out on GitHub! https://github.com/JBader89/PlugBot");
            break;
        case ".about": //Returns a description of the bot's purpose, creator, and usability
            bot.sendChat("Hey, I'm GeniusBot, your personal encyclopedic web scraper. My father, TerminallyChill, created me. For a list of my commands, type .commands");
            break;
        case ".fb":
        case ".facebook": //Returns a link to the Chillout Mixer Facebook page
            bot.sendChat("Like us on Facebook: https://www.facebook.com/ChilloutMixer");
            break;
        case ".twitter": //Returns a link to the Chillout Mixer Twitter page
            bot.sendChat("Follow us on Twitter: https://www.twitter.com/ChilloutMixer");
            break;
        case ".damnright": //Commands just for fun
            bot.sendChat("http://i.imgur.com/5Liksxa.gif");
            break;
        case ".highfive":
            bot.sendChat("http://i.imgur.com/KevhNWt.gif");
            break;
        case ".justdoit":
            bot.sendChat("http://i.imgur.com/W8GgWzh.gif");
            break;
        case ".timeforwork":
            bot.sendChat("http://i.imgur.com/LqU7LPl.gif");
            break;
        case ".saul":
            bot.sendChat("http://i.imgur.com/URNSlqT.gif");
            break;
        case ".smh":
        case ".no":
            bot.sendChat("http://i.imgur.com/93j8cA1.gif");
            break;
        case ".touche":
            bot.sendChat("http://replygif.net/i/1108.gif");
            break;
        case ".holyshit":
        case ".ohsnap":
            bot.sendChat("http://i.imgur.com/Qtcjvi4.gif");
            break;
        case ".feels":
            bot.sendChat("http://i.imgur.com/axsIhkT.gif");
            break;
        case ".pleasestop":
            bot.sendChat("http://i.imgur.com/QHfqz3L.gif");
            break;
        case ".yeah":
        case ".yeah!":
            bot.sendChat("http://i.imgur.com/jmw4OLz.gif");
            break;
        case ".jesse":
            bot.sendChat("http://i.imgur.com/34qU4qC.gif");
            break;
        case ".dontmove":
            bot.sendChat("http://i.imgur.com/bzGFChQ.gif");
            break;
        case ".hello":
            bot.sendChat("http://cdn.makeagif.com/media/8-12-2013/R7sSHU.gif");
            break;
        case ".boom":
            bot.sendChat("http://i.imgur.com/tKd5J2x.gif");
            break;
        case ".what":
            bot.sendChat("http://i.imgur.com/RcNHW.gif");
            break;
        case ".argh":
        case ".pizza":
        case ".gahhh":
            bot.sendChat("http://i53.tinypic.com/24ep2xc.gif");
            break;
        case ".eggsfortheprettylady":
            bot.sendChat("Wakey wakey :egg: and bakey, fo' the pretty lady @Rightclik");
            break;
        case ".pita":
            bot.sendChat("http://chillouttent.org/p-i-t-a/");
            break;
        case ".artist": //Returns Last.fm info about the current artist, .artist [givenArtist] returns Last.fm info about a given artist
            var artistChoice="";
            if (qualifier==""){
                artistChoice=media.author;
            }
            else{
                artistChoice=qualifier;
            }
            lastfm.getArtistInfo({
                artist: artistChoice,
                callback: function(result) { 
                    if (result.success==true){
                        if (result.artistInfo.bio.summary!=""){
                            var summary=result.artistInfo.bio.summary;
                            summary=summary.replace(/(&quot;)/g, '"');
                            summary=summary.replace(/(&amp;)/g, '&');
                            summary=summary.replace(/(&eacute;)/g, 'é');
                            summary=summary.replace(/(&aacute;)/g, 'á');
                            summary=summary.replace(/(&auml;)/g, 'ä');
                            summary=summary.replace(/(&iacute;)/g, 'í');
                            summary=summary.replace(/(&oacute;)/g, 'ó');
                            summary=summary.replace(/(&Scaron;)/g, 'Š');
                            summary=summary.replace(/<[^>]+>/g, '');
                            if (summary.indexOf(" 1) ") != -1){
                                summary=summary.substring(summary.lastIndexOf(" 1) ")+4);
                                if (summary.indexOf(" 2) ") != -1){
                                    summary=summary.substring(0, summary.lastIndexOf(" 2)"));
                                }
                            }   
                            else if (summary.indexOf(" 1. ") != -1){
                                summary=summary.substring(summary.lastIndexOf(" 1. ")+4);
                                if (summary.indexOf(" 2. ") != -1){
                                    summary=summary.substring(0, summary.lastIndexOf(" 2."));
                                }
                            }     
                            else if (summary.indexOf(" (1) ") != -1){
                                summary=summary.substring(summary.lastIndexOf(" (1) ")+4);
                                if (summary.indexOf(" (2) ") != -1){
                                    summary=summary.substring(0, summary.lastIndexOf(" (2)"));
                                }
                            }        
                            if (summary.length>250){
                                summary=summary.substring(0, 247)+"...";
                            }                           
                            bot.sendChat(summary); 
                            var lastfmArtist=artistChoice;
                            lastfmArtist=lastfmArtist.replace(/ /g, '+');
                            bot.sendChat("For more info: http://www.last.fm/music/" + lastfmArtist);
                        }
                        else {
                            bot.sendChat("No artist info found.");
                        }
                    }
                    else {
                        bot.sendChat("No artist info found.");
                    }
                }
            });
            break;
        case ".track": //Returns Last.fm info about the current song
            lastfm.getTrackInfo({
                artist: media.author,
                track: media.title,
                callback: function(result) {
                    if (result.success==true){
                        if (result.trackInfo.wiki!=undefined){
                            var summary=result.trackInfo.wiki.summary;
                            summary=summary.replace(/(&quot;)/g, '"');
                            summary=summary.replace(/(&amp;)/g, '&');
                            summary=summary.replace(/(&eacute;)/g, 'é');
                            summary=summary.replace(/(&aacute;)/g, 'á');
                            summary=summary.replace(/(&auml;)/g, 'ä');
                            summary=summary.replace(/(&iacute;)/g, 'í');
                            summary=summary.replace(/(&oacute;)/g, 'ó');
                            summary=summary.replace(/(&Scaron;)/g, 'Š');
                            summary=summary.replace(/<[^>]+>/g, '');
                            if (summary.length>250){
                                summary=summary.substring(0, 247)+"...";
                            }  
                            bot.sendChat(summary);
                        }
                        else {
                            bot.sendChat("No track info found.");
                        }
                    }
                    else {
                        bot.sendChat("No track info found.");
                    }
                }
            });
            break;
        case ".genre": //Returns the genres of the current artist, .genre [givenArtist] returns the genres of a given artist
            var artistChoice="";
            if (qualifier==""){
                artistChoice=media.author;
                trackChoice=media.title;
            }
            else{
                artistChoice=qualifier;
                trackChoice=null;
            }
            lastfm.getTags({
                artist: artistChoice,
                track: trackChoice,
                callback: function(result) {
                    var tags = "";
                    if (result.tags!=undefined){
                        for (var i=0; i<result.tags.length; i++){
                            tags+=result.tags[i].name;
                            tags+=", ";
                        }
                        tags=tags.substring(0, tags.length-2);
                    }
                    if (qualifier==""){
                        if (tags!=""){
                            bot.sendChat("Genre of "+trackChoice+" by "+artistChoice+": "+tags);
                        }
                        else{
                            bot.sendChat("No genre found.");
                        }
                    }
                    else{
                        if (tags!=""){
                            bot.sendChat("Genre of "+artistChoice+": "+tags);
                        }
                        else{
                            bot.sendChat("No genre found.");
                        }
                    }
                }
            });
            break;
        case ".album": //Returns the album of the current song
            lfm.track.getInfo({
                'artist' : media.author,
                'track' : media.title
            }, function (err, track) {
                if (track!=undefined){
                    lfm.album.getInfo({
                        'artist' : media.author,
                        'album' : track.album.title
                    }, function (err, album) {
                        var albumMessage = track.name + " is from the album " + track.album.title;
                        if (album.wiki!=undefined){
                            if (album.wiki.summary.indexOf('released on') != -1){
                                var year = album.wiki.summary.substring(album.wiki.summary.indexOf('released on')).split(' ')[4].substring(0,4);
                                albumMessage = albumMessage + " (" + year + ")";
                            }
                        }
                        bot.sendChat(albumMessage);
                        bot.sendChat("Check out the full album: " + track.album.url);
                    });
                }
                else{
                    bot.sendChat("No album found.");
                }
            });
            break;
        case ".similar": //Returns similar artists of the current artist, .similar [givenArtist] returns similar artists of a given artist
            var artistChoice="";
            if (qualifier==""){
                artistChoice=media.author;
            }
            else{
                artistChoice=qualifier;
            }
            lfm.artist.getSimilar({
                'limit' : 7,
                'artist' : artistChoice,
                'autocorrect' : 1
            }, function (err, similarArtists) {
                if (similarArtists!=undefined){
                    var artists = '';
                    for (var i=0; i<similarArtists.artist.length; i++){
                        artists = artists + similarArtists.artist[i].name + ", ";
                    }
                    artists = artists.substring(0, artists.length-2);
                    bot.sendChat("Similar artists to " + artistChoice + ": " + artists);
                }
                else{
                    bot.sendChat("No similar artists found.");
                }
            });
            break;
        case ".events": //Returns the artist's upcoming events, .events [givenArtist] returns a given artist's upcoming events
            var artistChoice="";
            if (qualifier==""){
                artistChoice=media.author;
            }
            else{
                artistChoice=qualifier;
            }
            lfm.artist.getEvents({
                'limit' : 3,
                'artist' : artistChoice
            }, function (err, events) {
                if (events!=undefined){
                    var upcomingEvents = '';
                    if (!(events.event instanceof Array)){
                        events.event = [events.event];
                    }
                    for (var i=0; i<events.event.length; i++){
                        var day = '';
                        if (events.event[i].startDate.split(/\s+/).slice(1,2).join(" ").slice(0,1) == '0'){
                            day = events.event[i].startDate.split(/\s+/).slice(1,2).join(" ").slice(1,2);
                        }
                        else{
                            day = events.event[i].startDate.split(/\s+/).slice(1,2).join(" ");
                        }
                        upcomingEvents = upcomingEvents + events.event[i].startDate.split(/\s+/).slice(2,3).join(" ") + "/" + day + "/" + events.event[i].startDate.split(/\s+/).slice(3,4).join(" ").slice(-2) + " at " + events.event[i].venue.name + " in " + events.event[i].venue.location.city + ", " + events.event[i].venue.location.country + "; ";
                    }
                    upcomingEvents = upcomingEvents.substring(0, upcomingEvents.length-2);
                    upcomingEvents=upcomingEvents.replace(/Jan/g, '1');
                    upcomingEvents=upcomingEvents.replace(/Feb/g, '2');
                    upcomingEvents=upcomingEvents.replace(/Mar/g, '3');
                    upcomingEvents=upcomingEvents.replace(/Apr/g, '4');
                    upcomingEvents=upcomingEvents.replace(/May/g, '5');
                    upcomingEvents=upcomingEvents.replace(/Jun/g, '6');
                    upcomingEvents=upcomingEvents.replace(/Jul/g, '7');
                    upcomingEvents=upcomingEvents.replace(/Aug/g, '8');
                    upcomingEvents=upcomingEvents.replace(/Sep/g, '9');
                    upcomingEvents=upcomingEvents.replace(/Oct/g, '10');
                    upcomingEvents=upcomingEvents.replace(/Nov/g, '11');
                    upcomingEvents=upcomingEvents.replace(/Dec/g, '12');
                    bot.sendChat("Upcoming events for " + artistChoice + ": " + upcomingEvents);
                }
                else{
                    bot.sendChat("No upcoming events found.");
                }
            });
            break;
        case ".sc":
        case ".soundcloud": //Returns the current artist's SC page, .soundcloud [givenArtist] returns a given artist's SC page
            var artistChoice="";
            if (qualifier==""){
                artistChoice = media.author;
            }
            else{
                artistChoice=qualifier;
            }
            var link = 'http://api.soundcloud.com/users.json?q=' + artistChoice + '&consumer_key=apigee';
            request(link, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var info = JSON.parse(body);
                    if (info[0] != undefined){
                        bot.sendChat(info[0].username + ": " + info[0].permalink_url);
                    }
                    else{
                        bot.sendChat("No soundcloud found.");
                    }
                }
            });
            break;

        case ".grab": //Makes the bot grab the current song
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    bot.getPlaylists(function(playlists) {
                        console.log(playlists);
                        for (var i=0; i<playlists.length; i++){
                            if (playlists[i].active){
                                if (playlists[i].count!=200){
                                    var selectedID=playlists[i].id;
                                    bot.sendChat("Added to my "+playlists[i].name+" playlist.");
                                }
                                else{
                                    bot.createPlaylist("Library "+playlists.length+1);
                                    bot.activatePlaylist(playlists[playlists.length-1].id);
                                    var selectedID=playlists[playlists.length-1].id;
                                    bot.sendChat("Added to "+playlists[playlists.length-1].name+" playlist.");
                                }
                            }
                        }
                        bot.addSongToPlaylist(selectedID, media.id);
                    });
                }
            }
            break;

        case ".define": //Returns the Merriam-Webster dictionary definition of a given word with .define [givenWord]
            if (qualifier!=""){
                var dict = new api.DictionaryAPI(api.COLLEGIATE, 'cf2109fd-f2d0-4451-a081-17b11c48069b');
                var linkQualifier=qualifier;
                linkQualifier=linkQualifier.replace(/ /g, '%20');
                dict.query(linkQualifier.toLowerCase(), function(err, result) {
                    result=result.replace(/<vi>(.*?)<\/vi>|<dx>(.*?)<\/dx>|<dro>(.*?)<\/dro>|<uro>(.*?)<\/uro>|<svr>(.*?)<\/svr>|<sin>(.*?)<\/sin>|<set>(.*?)<\/set>|<pl>(.*?)<\/pl>|<pt>(.*?)<\/pt>|<ss>(.*?)<\/ss>|<ca>(.*?)<\/ca>|<art>(.*?)<\/art>|<ew>(.*?)<\/ew>|<hw>(.*?)<\/hw>|<sound>(.*?)<\/sound>|<pr>(.*?)<\/pr>|<fl>(.*?)<\/fl>|<date>(.*?)<\/date>|<sxn>(.*?)<\/sxn>|<ssl>(.*?)<\/ssl>/g, '');
                    result=result.replace(/<vt>(.*?)<\/vt>/g,' ');
                    result=result.replace(/<\/sx> <sx>|<sd>/g,', ');
                    result=result.replace(/\s{1,}<sn>/g, '; ');
                    result=result.replace(/\s{1,}<un>/g, ': ');
                    result=result.replace(/<(?!\/entry\s*\/?)[^>]+>/g, '');
                    result=result.replace(/\s{1,}:/g,': ');
                    if (result.indexOf(":") != -1 && (result.indexOf(":")<result.indexOf("1:") || result.indexOf("1:") == -1) && (result.indexOf(":")<result.indexOf("1 a") || result.indexOf("1 a") == -1)) {
                        result=result.substring(result.indexOf(":")+1);
                    }
                    else if (result.indexOf("1:") != -1 || result.indexOf("1 a") != -1){
                        if ((result.indexOf("1:")<result.indexOf("1 a") && result.indexOf("1:")!=-1) || result.indexOf("1 a")==-1){
                            result=result.substring(result.indexOf("1:"));
                        }
                        else{
                            result=result.substring(result.indexOf("1 a"));
                        }
                    }
                    result=result.substring(0, result.indexOf("</entry>"));
                    result=result.replace(/\s{1,};/g, ';');
                    result=result.replace(/\s{1,},/g, ',');
                    if (result != ''){
                        if (result.length>250){
                            result=result.substring(0, 247)+"...";
                        }  
                        bot.sendChat(result);
                        //bot.sendChat("For more info: http://www.merriam-webster.com/dictionary/" + linkQualifier);
                    }
                    else{
                        bot.sendChat("No definition found.");
                    }
                });
            }
            else{
                bot.sendChat("Try .define followed by something to look up.");
            }
            break;
        case ".wiki": //Returns Wikipedia article summary of a given query with .define [givenWord]
            if (qualifier!=""){
                Wiki.page(qualifier, false, function(err, page){
                    page.summary(function(err, summary){
                        if (summary!=undefined){
                            Wiki.page(qualifier, false, function(err, page){
                                page.html(function(err, html){
                                    if (html.indexOf('<ul>')!=-1){
                                        html=html.substring(0, html.indexOf('<ul>'));
                                    }
                                    html=html.replace(/<[^>]+>/g, '');
                                    Wiki.page(qualifier, false, function(err, page){
                                        page.summary(function(err, summary){
                                            if (summary!=undefined){
                                                if (summary=="" || summary.indexOf("This is a redirect")!=-1){
                                                    summary="redirect "+html;
                                                }
                                                if (summary.indexOf('may refer to:')!=-1 || summary.indexOf('can refer to:')!=-1 || summary.indexOf('may also refer to:')!=-1 || summary.indexOf('may refer to the following:')!=-1 || summary.indexOf('may stand for:')!=-1){
                                                    bot.sendChat("This may refer to several things - please be more specific.");
                                                    var queryChoice=qualifier;
                                                    queryChoice=queryChoice.replace(/ /g, '_');
                                                    bot.sendChat("For more info: http://en.wikipedia.org/wiki/" + queryChoice);
                                                }
                                                else if (summary.substring(0,8).toLowerCase()=="redirect"){
                                                    subQuery='';
                                                    if (summary.indexOf('#')==-1){
                                                        if (summary.substring(8,9)==' '){
                                                            var query=summary.substring(9);
                                                        }
                                                        else{
                                                            var query=summary.substring(8);
                                                        }
                                                    }
                                                    else{
                                                        var query=summary.substring(9, summary.indexOf('#'));
                                                        subQuery=summary.substring(summary.indexOf('#')+1);
                                                    }
                                                    Wiki.page(query, false, function(err, page2){
                                                        page2.content(function(err, content){
                                                            if (content!=undefined){
                                                                if (content.indexOf('may refer to:')!=-1 || content.indexOf('can refer to:')!=-1 || content.indexOf('may also refer to:')!=-1 || content.indexOf('may refer to the following:')!=-1 || content.indexOf('may stand for:')!=-1){
                                                                    bot.sendChat("This may refer to several things - please be more specific.");
                                                                }
                                                                else if (subQuery!=''){
                                                                    content=content.substring(content.indexOf("=== "+subQuery+" ===")+8+subQuery.length);
                                                                    if (content.length>250){
                                                                        content=content.substring(0, 247)+"...";
                                                                    }  
                                                                    bot.sendChat(content);
                                                                }
                                                                else{
                                                                    if (content.length>250){
                                                                        content=content.substring(0, 247)+"...";
                                                                    }  
                                                                    bot.sendChat(content);
                                                                }
                                                                var queryChoice=qualifier;
                                                                queryChoice=queryChoice.replace(/ /g, '_');
                                                                bot.sendChat("For more info: http://en.wikipedia.org/wiki/" + queryChoice);
                                                            }
                                                            else{
                                                                bot.sendChat("No wiki found.");
                                                            }
                                                        });
                                                    });
                                                }
                                                else{
                                                    if (summary.length>250){
                                                        summary=summary.substring(0, 247)+"...";
                                                    }  
                                                    bot.sendChat(summary);
                                                    var queryChoice=qualifier;
                                                    queryChoice=queryChoice.replace(/ /g, '_');
                                                    bot.sendChat("For more info: http://en.wikipedia.org/wiki/" + queryChoice);
                                                }
                                            }
                                            else{
                                                bot.sendChat("No wiki found.");
                                            }    
                                        });
                                    });
                                });
                            });
                        }
                        else{
                            bot.sendChat("No wiki found.");
                        } 
                    });
                });
            }
            else{
                bot.sendChat("Try .wiki followed by something to look up.");
            }
            break;
        case ".forecast": //Returns a four day forecast of the weather in given city with .forecast [givenCity], [givenState]
        case ".weather":
            if (qualifier==""){
                bot.sendChat("Try .forecast followed by a US state, city, or zip to look up.");
            }
            else{
                google_geocoding.geocode(qualifier, function(err, location) {
                    if (location!=null){
                        weather.getWeather(location.lat, location.lng, function(err, data){
                            if (data!=null){
                                var weekForecast="Forecast for "+data.location.areaDescription+": Current: "+data.currentobservation.Temp+"°F "+data.currentobservation.Weather;
                                for (var i=0; i<7; i++){
                                    var day = data.time.startPeriodName[i].split(' ');
                                    if (day[1]!='Night'){
                                        weekForecast=weekForecast+"; "+data.time.startPeriodName[i]+": ";
                                    }
                                    else{
                                        weekForecast=weekForecast+", ";
                                    }
                                    weekForecast=weekForecast+data.time.tempLabel[i]+": "+data.data.temperature[i]+"°F";
                                } 
                                weekForecast=weekForecast.replace(/Sunday/g, 'Sun');
                                weekForecast=weekForecast.replace(/Monday/g, 'Mon');
                                weekForecast=weekForecast.replace(/Tuesday/g, 'Tues');
                                weekForecast=weekForecast.replace(/Wednesday/g, 'Wed');
                                weekForecast=weekForecast.replace(/Thursday/g, 'Thurs');
                                weekForecast=weekForecast.replace(/Friday/g, 'Fri');
                                weekForecast=weekForecast.replace(/Saturday/g, 'Sat');
                                bot.sendChat(weekForecast);
                            }
                            else{
                                bot.sendChat("No weather found.");
                            }
                        });
                    }
                    else{
                        bot.sendChat("No weather found.");
                    }
                });
            }
            break;
        case ".temp": //Returns the current temperature in given city with .temp [givenCity], [givenState]
        case ".temperature":
            if (qualifier==""){
                bot.sendChat("Try .temp followed by a US state, city, or zip to look up.");
            }
            else{
                google_geocoding.geocode(qualifier, function(err, location) {
                    if (location!=null){
                        weather.getWeather(location.lat, location.lng, function(err, data){
                            if (data!=null){
                                var temp="Current temperature in "+data.location.areaDescription+": "+data.currentobservation.Temp+"°F "+data.currentobservation.Weather;
                                bot.sendChat(temp);
                            }
                            else{
                                bot.sendChat("No temperature found.");
                            }
                        });
                    }
                    else{
                        bot.sendChat("No temperature found.");
                    }
                });
            }
            break;
        case ".time": //Returns the current time in a given city with .time [givenCity], givenState]
            if (qualifier==""){
                bot.sendChat("Try .time followed by a place to look up.");
            }
            else{
                google_geocoding.geocode(qualifier, function(err, location) {
                    if (location!=null){
                        var link = 'http://api.geonames.org/findNearbyPlaceNameJSON?lat=' + location.lat + '&lng=' + location.lng + '&username=jbader89&style=full'
                        request(link, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                var info = JSON.parse(body);
                                if (info != undefined){
                                    var timezone = info.geonames[0].timezone.timeZoneId;
                                    var currentTime = new time.Date();
                                    currentTime.setTimezone(timezone);
                                    var ampm = "";
                                    var hours = "";
                                    var mins = currentTime.toString().split(' ')[4].substring(2,5);
                                    if (currentTime.toString().split(' ')[4].substring(0,2) == "00"){
                                        hours = "12";
                                        ampm = "AM";
                                    }
                                    else if (Number(currentTime.toString().split(' ')[4].substring(0,2)) < 13){
                                        hours = currentTime.toString().split(' ')[4].substring(0,2);
                                        ampm = "AM";
                                        if (hours[0]=="0"){
                                            hours = hours[1];
                                        }
                                        else if (hours=="12"){
                                            ampm = "PM";
                                        }
                                    }
                                    else{
                                        hours = String(Number(currentTime.toString().split(' ')[4].substring(0,2)) - 12);
                                        ampm = "PM";
                                    }
                                    var stateOrCity = '';
                                    if (info.geonames[0].adminName1 != ''){
                                        stateOrCity = info.geonames[0].adminName1 + ", ";
                                    }
                                    bot.sendChat("Current time in " + stateOrCity + info.geonames[0].countryName + ": " + hours + mins + " " + ampm);
                                }
                            }
                        });
                    }
                    else{
                        bot.sendChat("No time found.");
                    }
                });
            }
            break;
        case ".calc": //Calculates the solution to a given mathematical problem with .calc [equation]
            var counter = 0;
            var counter2 = 0;
            for (var i=0; i<qualifier.length; i++) {
                if (qualifier.charAt(i)=='(') {
                    counter++;
                } 
                else if(qualifier.charAt(i)==')') {
                    counter2++;
                } 
            }
            qualifier=qualifier.replace(/x/g, '*');
            if (qualifier!="" && !(/\d\(/g.test(qualifier)) && !(/[\!\,\@\'\"\?\#\$\%\&\_\=\<\>\:\;\[\]\{\}\`\~\||log]/g.test(qualifier)) &&  !(/\^\s{0,}\d{0,}\s{0,}\^/g.test(qualifier)) && !(/\)\d/g.test(qualifier)) && !(/^[\+\*\/\^]/g.test(qualifier)) && !(/[\+\-\*\/\^]$/g.test(qualifier)) && !(/[\+\-\*\/\^]\s{0,}[\+\*\/\^]/g.test(qualifier)) && !(/\d\s{1,}\d/g.test(qualifier)) && !(/\s\.\s/g.test(qualifier)) && !(/\.\d\./g.test(qualifier)) && !(/\d\.\s{1,}\d/g.test(qualifier)) && !(/\d\s{1,}\.\d/g.test(qualifier)) && !(/\.\./g.test(qualifier)) && (!(/([a-zA-Z])/g.test(qualifier))) && counter==counter2){
                func=qualifier;
                func+=" + (0*x) + (0*y)";
                var realfunc=mlexer.parseString(func);
                var answer=(realfunc({x:0,y:0}));
                if (answer.toString()!="NaN"){
                    if (answer.toString()!="Infinity"){
                        bot.sendChat(answer.toString());
                    }
                    else{
                        bot.sendChat('http://i.imgur.com/KpAzEs8.jpg');
                    }
                }
                else{
                    bot.sendChat("/me does not compute.");
                }
            }
            else if (qualifier==""){
                bot.sendChat("Try .calc followed by something to calculate.");
            }
            else{
                bot.sendChat("/me does not compute.");
            }
            break;
        case ".tl":
        case ".translate": //Returns a translation of given words with .translate [givenWords] '([language])', English by default
            var languageCodes = ["ar","bg","ca","zh-CHS","zh-CHT","cs","da","nl","en","et","fa","fi","fr","de","el","ht","he","hi","hu","id","it","ja","ko","lv","lt","ms","mww","no","pl","pt","ro","ru","sk","sl","es","sv","th","tr","uk","ur","vi"];
            var languages = ['Arabic', 'Bulgarian', 'Catalan', 'Chinese', 'Chinese', 'Czech', 'Danish', 'Dutch', 'English', 'Estonian', 'Persian (Farsi)', 'Finnish', 'French', 'German', 'Greek', 'Haitian Creole', 'Hebrew', 'Hindi', 'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Latvian', 'Lithuanian', 'Malay', 'Hmong Daw', 'Norwegian', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Slovak', 'Slovenian', 'Spanish', 'Swedish', 'Thai', 'Turkish', 'Ukrainian', 'Urdu', 'Vietnamese'];
            if (qualifier!=""){
                var params = { 
                    text: qualifier 
                };
                var language="";
                client.initialize_token(function(keys){ 
                    client.detect(params, function(err, data) {
                        var language = data;
                        if (languageCodes.indexOf(language) > -1){
                            if (qualifier.indexOf('(')==-1){
                                var params2 = { 
                                    text: qualifier,
                                    from: language,
                                    to: 'en'
                                };
                                client.initialize_token(function(keys){ 
                                    client.translate(params2, function(err, data) {
                                        bot.sendChat(data + " (" + languages[languageCodes.indexOf(language)] + ")");
                                    });
                                });
                            }
                            else{
                                var givenLanguage='';
                                var language2 = qualifier.substring(qualifier.indexOf('(')+1, qualifier.lastIndexOf(')')).toLowerCase();
                                if (languageCodes.indexOf(language2) > -1){
                                    givenLanguage = language2;
                                }
                                else{
                                    language2 = language2.charAt(0).toUpperCase() + language2.slice(1);
                                    givenLanguage = languageCodes[languages.indexOf(language2)];
                                }
                                if (languages.indexOf(language2) > -1 || languageCodes.indexOf(language2) > -1){    
                                    var params2 = { 
                                        text: qualifier,
                                        from: language,
                                        to: givenLanguage
                                    };
                                    client.initialize_token(function(keys){ 
                                        client.translate(params2, function(err, data) {
                                            data = data.substring(0, data.indexOf('('));
                                            bot.sendChat(data);
                                        });
                                    });
                                }
                                else{
                                    bot.sendChat("Sorry, I don't speak that language.");
                                }
                            }
                        }
                        else{
                            bot.sendChat("Sorry, I don't speak that language.");
                        }
                    });
                });
            }
            else{
                bot.sendChat("Try .translate followed by something to translate.");
            }
            break;
        case '.auto':
        case '.autotranslate': //Autotranslates a given user with .autotranslate [givenUser]
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    if (qualifier!=""){
                        translateList.push(qualifier);
                        bot.sendChat("Autotranslating user " + qualifier + ".");
                    }
                    else{
                        bot.sendChat("Try .autotranslate followed by a username.");
                    }
                }
            }
            break;
        case '.undo':
        case '.untranslate': //Stops autotranslating a given user with .untranslate [givenUser]
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    if (qualifier!=""){
                        if (translateList.indexOf(qualifier) != -1) {
                            translateList.splice(translateList.indexOf(qualifier), 1);
                        }
                        bot.sendChat("Stopped autotranslating user " + qualifier + ".");
                    }
                    else{
                        bot.sendChat("Try .untranslate followed by a username.");
                    }
                }
            }
            break;
        case ".google": //Returns a lmgtfy (google) link with .google [givenWord]
            if (qualifier!=""){
                var google=qualifier;
                google=google.replace(/ /g, '+');
                bot.sendChat("http://lmgtfy.com/?q=" + google);
            }
            else{
                bot.sendChat("Try .google followed by something to look up.");
            }
            break;    
        case ".autoskip": //Turns auto-skip on
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    setmehs = true;
                    bot.sendChat("Auto-skip is now on.");
                }
            }
            break;
        case ".unskip": //Turns auto-skip off
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    setmehs = false;
                    bot.sendChat("Auto-skip is now off.");
                }
            }
            break;
        case ".setmehs": //Sets the number of mehs for auto-skipping with .setmehs [givenNumber]
            for (var i=0; i<staff.length; i++){
                if (staff[i].username == data.from && staff[i].role > 1){
                    if (qualifier!="" && !(isNaN(Number(qualifier)))){
                        mehs = qualifier - 1;
                        bot.sendChat("Auto-skip set to " + (mehs+1) + " mehs.");
                    }
                    else{
                        bot.sendChat("Try .setmehs followed a number of mehs for auto-skipping.");
                    }
                }
            }
            break;
        default: //Checks for users that are set to be autotranslated whenever they chat
            var languageCodes = ["ar","bg","ca","zh-CHS","zh-CHT","cs","da","nl","en","et","fa","fi","fr","de","el","ht","he","hi","hu","id","it","ja","ko","lv","lt","ms","mww","no","pl","pt","ro","ru","sk","sl","es","sv","th","tr","uk","ur","vi"];
            var languages = ['Arabic', 'Bulgarian', 'Catalan', 'Chinese', 'Chinese', 'Czech', 'Danish', 'Dutch', 'English', 'Estonian', 'Persian (Farsi)', 'Finnish', 'French', 'German', 'Greek', 'Haitian Creole', 'Hebrew', 'Hindi', 'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Latvian', 'Lithuanian', 'Malay', 'Hmong Daw', 'Norwegian', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Slovak', 'Slovenian', 'Spanish', 'Swedish', 'Thai', 'Turkish', 'Ukrainian', 'Urdu', 'Vietnamese'];        
            if (translateList.indexOf(data.from)!=-1){
                qualifier = data.message;
                qualifier=qualifier.replace(/&#39;/g, '\'');
                qualifier=qualifier.replace(/&#34;/g, '\"');
                qualifier=qualifier.replace(/&amp;/g, '\&');
                qualifier=qualifier.replace(/&lt;/gi, '\<');
                qualifier=qualifier.replace(/&gt;/gi, '\>');
                var user = data.from;
                var message = qualifier;
                var params = { 
                    text: message 
                };
                var language="";
                client.initialize_token(function(keys){ 
                    client.detect(params, function(err, data) {
                        var language = data;
                        if (languageCodes.indexOf(language) > -1 && language != 'en'){
                            var params2 = { 
                                text: message,
                                from: language,
                                to: 'en'
                            };
                            client.initialize_token(function(keys){ 
                                client.translate(params2, function(err, data) {
                                    bot.sendChat(user + ": " + data + " (" + languages[languageCodes.indexOf(language)] + ")");
                                });
                            });
                        }
                    });
                });
            }
            else if (command.charAt(0) == "@" && translateList.indexOf(command.slice(1)) != -1 && data.from != 'GeniusBot'){ //Autotranslates into @[givenUser]'s language when message begins with @[givenUser]
                for (var i=0; i<users.length; i++){
                    if (users[i].username == command.slice(1)){
                        var params = { 
                            text: qualifier,
                            from: 'en',
                            to: users[i].language
                        };
                        if (languageCodes.indexOf(users[i].language) > -1 && users[i].language != 'en'){
                            client.initialize_token(function(keys){ 
                                client.translate(params, function(err, data){
                                    bot.sendChat(command + " " + data);
                                });
                            });
                        }
                    }
                }
            }
            // bot.getMedia(function(currentMedia) { 
            //     media = currentMedia; 
            // });
            // bot.getDJ(function(currentDJ) { 
            //     dj = currentDJ; 
            // });
            break;
    }
});