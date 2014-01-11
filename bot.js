var PlugAPI = require('./plugapi'); 
var ROOM = 'chillout-mixer-ambient-triphop';
var UPDATECODE = '_:8s[H@*dnPe!nNerEM';

var Lastfm = require('simple-lastfm');

var lastfm = new Lastfm({
    api_key: 'd657909b19fde5ac1491b756b6869d38',
    api_secret: '571e2972ae56bd9c1c6408f13696f1f3',
    username: 'BaderBombs',
    password: 'xxx'
});

var api = require('dictionaryapi');

var Wiki = require("wikijs");

var google_geocoding = require('google-geocoding');
var weather = require('weathers');

// Instead of providing the AUTH, you can use this static method to get the AUTH cookie via twitter login credentials:
PlugAPI.getAuth({
    username: 'BaderBombs',
    password: 'xxx'
}, function(err, auth) { 
    if(err) {
        //console.log("An error occurred: " + err);
        return;
    }
    var bot = new PlugAPI(auth, UPDATECODE);
    bot.connect(ROOM);

    //Event which triggers when bot joins the room
    bot.on('roomJoin', function(data) {
        bot.sendChat("I'm live!");
    });

    //Event which triggers when anyone chats
    bot.on('chat', function(data) { //TODO: 1. .calc, 2. .urban, 3. .google, 4. .sc, 5. .translate
        //if (data.from=='TerminallyChill'){
            var command=data.message.split(' ')[0];
            var firstIndex=data.message.indexOf(' ');
            var qualifier="";
            if (firstIndex!=-1){
                qualifier = data.message.substring(firstIndex+1, data.message.length);
            }
            switch (command)
            {
                case ".commands":
                    bot.chat("List of Commands: .artist, .commands, .define, .forecast, .genre, .grab, .hey, .join, .leave, .meh, .props, .skip, .track, .wiki, and .woot");
                    break;
                case ".hey":
                    bot.chat("Well hey there! @"+data.from);
                    break;
                case ".woot":
                    bot.woot();
                    bot.chat("This is awesome! Nice play!");
                    break;
                case ".meh":
                    bot.meh();
                    bot.chat("Please... make it stop :unamused:");
                    break;
                case ".props":
                case ".propsicle":
                    console.log(bot.getDJs()[0].username, bot.getDJs(), bot.getDJs()[0])
                    bot.chat("Nice play! @"+bot.getDJs()[0].username);
                    break;
                case ".damnright":
                    bot.chat("http://i.imgur.com/5Liksxa.gif");
                    break;
                case ".join":
                    bot.waitListJoin();
                    bot.chat("Joining Waitlist!");
                    break;
                case ".leave":
                    bot.waitListLeave();
                    bot.chat("Leaving Waitlist.");
                    break;
                case ".skip":
                    bot.skipSong();
                    bot.chat("Skipping!");
                    break;
                case ".artist":
                    var artistChoice="";
                    if (qualifier==""){
                        artistChoice=bot.getMedia().author;
                    }
                    else{
                        artistChoice=qualifier;
                    }
                    lastfm.getArtistInfo({
                        artist: artistChoice,
                        callback: function(result) { 
                            //console.log(result);
                            if (result.success==true){
                                if (result.artistInfo.bio.summary!=""){
                                    var summary=result.artistInfo.bio.summary;
                                    summary=summary.replace(/(&quot;)/g, '"');
                                    summary=summary.replace(/(&amp;)/g, '&');
                                    summary=summary.replace(/(&eacute;)/g, 'é');
                                    summary=summary.replace(/(&aacute;)/g, 'á');
                                    summary=summary.replace(/(&auml;)/g, 'ä');
                                    summary=summary.replace(/<[^>]+>/g, '');
                                    if (summary.indexOf("1)") != -1){
                                        summary=summary.substring(summary.indexOf("1) ")+3);
                                        if (summary.indexOf("2)") != -1){
                                            summary=summary.substring(0, summary.indexOf("2)")-1);
                                        }
                                    }                                    
                                    bot.chat(summary); 
                                    var lastfmArtist=artistChoice;
                                    lastfmArtist=lastfmArtist.replace(/ /g, '+');
                                    bot.chat("For more info: http://www.last.fm/music/" + lastfmArtist);
                                }
                                else {
                                    bot.chat("No artist info found.")
                                }
                            }
                            else {
                                bot.chat("No artist info found.")
                            }
                        }
                    });
                    break;
                case ".track":
                    lastfm.getTrackInfo({
                        artist: bot.getMedia().author,
                        track: bot.getMedia().title,
                        callback: function(result) {
                            //console.log(result);
                            if (result.success==true){
                                if (result.trackInfo.wiki!=undefined){
                                    var summary=result.trackInfo.wiki.summary;
                                    summary=summary.replace(/(&quot;)/g, '"');
                                    summary=summary.replace(/(&amp;)/g, '&');
                                    summary=summary.replace(/(&eacute;)/g, 'é');
                                    summary=summary.replace(/(&aacute;)/g, 'á');
                                    summary=summary.replace(/(&auml;)/g, 'ä');
                                    summary=summary.replace(/<[^>]+>/g, '');
                                    bot.chat(summary);
                                }
                                else {
                                    bot.chat("No track info found.")
                                }
                            }
                            else {
                                bot.chat("No track info found.")
                            }
                        }
                    });
                    break;
                case ".genre":
                    var artistChoice="";
                    if (qualifier==""){
                        artistChoice=bot.getMedia().author;
                        trackChoice=bot.getMedia().title;
                    }
                    else{
                        artistChoice=qualifier;
                        trackChoice=null;
                    }
                    lastfm.getTags({
                        artist: artistChoice,
                        track: trackChoice,
                        callback: function(result) {
                            //console.log(result);
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
                                    bot.chat("Genre of "+trackChoice+" by "+artistChoice+": "+tags);
                                }
                                else{
                                    bot.chat("No genre found.")
                                }
                            }
                            else{
                                if (tags!=""){
                                    bot.chat("Genre of "+artistChoice+": "+tags);
                                }
                                else{
                                    bot.chat("No genre found.")
                                }
                            }
                        }
                    });
                    break;
                case ".grab":
                    if (data.from=='TerminallyChill'){
                        bot.getPlaylists(function(playlists) {
                            for (var i=0; i<playlists.length; i++){
                                if (playlists[i].selected){
                                    if (playlists[i].items.length!=200){
                                        var selectedID=playlists[i].id;
                                        bot.chat("Added to "+playlists[i].name+" playlist.");
                                    }
                                    else{
                                        bot.createPlaylist("Library "+playlists.length+1);
                                        bot.activatePlaylist(playlists[playlists.length-1].id)
                                        var selectedID=playlists[playlists.length-1].id;
                                        bot.chat("Added to "+playlists[playlists.length-1].name+" playlist.");
                                    }
                                }
                            }
                            bot.addSongToPlaylist(selectedID, bot.getMedia().id);
                        });
                    }
                    break;
                case ".define":
                    var dict = new api.DictionaryAPI(api.COLLEGIATE, 'cf2109fd-f2d0-4451-a081-17b11c48069b');
                    var linkQualifier=qualifier;
                    linkQualifier=linkQualifier.replace(/ /g, '%20');
                    dict.query(linkQualifier.toLowerCase(), function(err, result) {
                        //console.log(result);
                        result=result.replace(/<vi>(.*?)<\/vi>|<dx>(.*?)<\/dx>|<dro>(.*?)<\/dro>|<uro>(.*?)<\/uro>|<svr>(.*?)<\/svr>|<sin>(.*?)<\/sin>|<set>(.*?)<\/set>|<pl>(.*?)<\/pl>|<pt>(.*?)<\/pt>|<ss>(.*?)<\/ss>|<ca>(.*?)<\/ca>|<art>(.*?)<\/art>|<ew>(.*?)<\/ew>|<hw>(.*?)<\/hw>|<sound>(.*?)<\/sound>|<pr>(.*?)<\/pr>|<fl>(.*?)<\/fl>|<date>(.*?)<\/date>|<sxn>(.*?)<\/sxn>|<ssl>(.*?)<\/ssl>/g, '');
                        result=result.replace(/<vt>(.*?)<\/vt>/g,' ');
                        result=result.replace(/<\/sx> <sx>|<sd>/g,', ');
                        result=result.replace(/\s{1,}<sn>/g, '; ');
                        result=result.replace(/\s{1,}<un>/g, ': ');
                        result=result.replace(/<(?!\/entry\s*\/?)[^>]+>/g, '');
                        result=result.replace(/\s{1,}:/g,': ')
                        //console.log(result);
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
                        //console.log(result);
                        if (result != ''){
                            bot.chat(result);
                            //bot.chat("For more info: http://www.merriam-webster.com/dictionary/" + linkQualifier);
                        }
                        else{
                            bot.chat("No definition found.")
                        }
                    });
                    break;
                case ".wiki":
                    if (qualifier!=""){
                        Wiki.page(qualifier, false, function(err, page){
                            page.summary(function(err, summary){
                                if (summary!=undefined){
                                    if (summary.indexOf('may refer to:')!=-1 || summary.indexOf('may also refer to:')!=-1 || summary.indexOf('may refer to the following:')!=-1){
                                        bot.chat("This may refer to several things - please be more specific.");
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
                                            if (summary.indexOf("This is a redirect")!=-1){
                                                query=query.substring(0, query.indexOf("This is a redirect")-1);
                                            }
                                        }
                                        else{
                                            var query=summary.substring(9, summary.indexOf('#'));
                                            subQuery=summary.substring(summary.indexOf('#')+1);
                                        }
                                        Wiki.page(query, false, function(err, page2){
                                            page2.content(function(err, content){
                                                if (content.indexOf('may refer to:')!=-1 || content.indexOf('may also refer to:')!=-1){
                                                    bot.chat("This may refer to several things - please be more specific.");
                                                }
                                                else if (subQuery!=''){
                                                    content=content.substring(content.indexOf("=== "+subQuery+" ===")+8+subQuery.length);
                                                    bot.chat(content);
                                                }
                                                else{
                                                    bot.chat(content);
                                                }
                                            });
                                        });
                                    }
                                    else{
                                        bot.chat(summary);
                                    }
                                }
                                else{
                                    bot.chat("No wiki found.");
                                }    
                            });
                        });
                    }
                    break;
                case ".forecast":
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
                                    bot.chat(weekForecast);
                                }
                                else{
                                    bot.chat("No weather found.")
                                }
                            });
                        }
                        else{
                            bot.chat("No weather found.")
                        }
                    });
                    break;
            //}
        }
    });
});
