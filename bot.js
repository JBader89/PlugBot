var PlugAPI = require('./plugapi'); 
var ROOM = 'terminally-chillin';
var UPDATECODE = 'p9R*';

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
var mlexer = require('math-lexer');

var MsTranslator = require('mstranslator');
var client = new MsTranslator({client_id:"PlugBot", client_secret: "uScbNIl2RHW15tIQJC7EsocKJsnACzxFbh2GqdpHfog="});

// Instead of providing the AUTH, you can use this static method to get the AUTH cookie via twitter login credentials:
PlugAPI.getAuth({
    username: 'BaderBombs',
    password: 'xxx'
}, function(err, auth) { 
    if(err) {
        console.log("An error occurred: " + err);
        return;
    }
    var bot = new PlugAPI(auth, UPDATECODE);
    bot.connect(ROOM);

    //Event which triggers when bot joins the room
    bot.on('roomJoin', function(data) {
        //bot.sendChat("I'm live!");
        console.log("I'm live!");
    });

    var reconnect = function() { 
        bot.connect(ROOM);
    };

    bot.on('close', reconnect);
    bot.on('error', reconnect);

    bot.on('djAdvance', function(data) {
        //console.log(data, bot.getUser(data.currentDJ));
        console.log(bot.getDJs()[0].username);//, bot.getDJs());
    });

    //Event which triggers when anyone chats
    bot.on('chat', function(data) { //TODO: 1. Fix .translate, 2. Comments, 3. .sc, 4. album, 5. .urban, 6. .google
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
                    bot.chat("List of Commands: .about, .artist, .calc, .commands, .damnright, .define, .facebook, .forecast, .genre, .github, .hey, .meh, .props, .track, .translate, .wiki, and .woot");
                    break;
                case ".hey":
                    bot.chat("Well hey there! @"+data.from);
                    break;
                case ".woot":
                    bot.woot();
                    bot.chat("I can dig it!");
                    break;
                case ".meh":
                    bot.meh();
                    bot.chat("Please... make it stop :unamused:");
                    break;
                case ".props":
                case ".propsicle":
                    bot.chat("Nice play! @"+bot.getDJs()[0].username);
                    break;
                case ".join":
                    bot.waitListJoin();
                    bot.chat("Joining waitlist!");
                    break;
                case ".leave":
                    bot.waitListLeave();
                    bot.chat("Leaving waitlist.");
                    break;
                case ".skip":
                    bot.skipSong();
                    bot.chat("Skipping!");
                    break;
                case ".damnright":
                    bot.chat("http://i.imgur.com/5Liksxa.gif");
                    break;
                case ".eggsfortheprettylady":
                    bot.chat("Wakey wakey :egg: and bakey, fo' the pretty lady @Rightclik");
                    break;
                case ".github":
                    bot.chat("Check me out on GitHub! https://github.com/JBader89/PlugBot");
                    break;
                case ".about":
                    bot.chat("Hey, I'm GeniusBot, your personal encyclopedic web scraper. My father, TerminallyChill, created me. For a list of my commands, type .commands");
                    break;
                case ".facebook":
                    bot.chat("Like us on Facebook: https://www.facebook.com/ChilloutMixer");
                    break;
                case ".pita":
                    bot.chat("http://chillouttent.org/p-i-t-a/");
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
                                    summary=summary.replace(/(&iacute;)/g, 'í');
                                    summary=summary.replace(/(&oacute;)/g, 'ó');
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
                                    if (summary.length>250){
                                        summary=summary.substring(0, 247)+"...";
                                    }  
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
                                        bot.chat("Added to my "+playlists[i].name+" playlist.");
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
                        result=result.replace(/<vi>(.*?)<\/vi>|<dx>(.*?)<\/dx>|<dro>(.*?)<\/dro>|<uro>(.*?)<\/uro>|<svr>(.*?)<\/svr>|<sin>(.*?)<\/sin>|<set>(.*?)<\/set>|<pl>(.*?)<\/pl>|<pt>(.*?)<\/pt>|<ss>(.*?)<\/ss>|<ca>(.*?)<\/ca>|<art>(.*?)<\/art>|<ew>(.*?)<\/ew>|<hw>(.*?)<\/hw>|<sound>(.*?)<\/sound>|<pr>(.*?)<\/pr>|<fl>(.*?)<\/fl>|<date>(.*?)<\/date>|<sxn>(.*?)<\/sxn>|<ssl>(.*?)<\/ssl>/g, '');
                        result=result.replace(/<vt>(.*?)<\/vt>/g,' ');
                        result=result.replace(/<\/sx> <sx>|<sd>/g,', ');
                        result=result.replace(/\s{1,}<sn>/g, '; ');
                        result=result.replace(/\s{1,}<un>/g, ': ');
                        result=result.replace(/<(?!\/entry\s*\/?)[^>]+>/g, '');
                        result=result.replace(/\s{1,}:/g,': ')
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
                                                        if (summary.indexOf('may refer to:')!=-1 || summary.indexOf('may also refer to:')!=-1 || summary.indexOf('may refer to the following:')!=-1){
                                                            bot.chat("This may refer to several things - please be more specific.");
                                                            var queryChoice=qualifier;
                                                            queryChoice=queryChoice.replace(/ /g, '_');
                                                            bot.chat("For more info: http://en.wikipedia.org/wiki/" + queryChoice);
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
                                                                        if (content.indexOf('may refer to:')!=-1 || content.indexOf('may also refer to:')!=-1 || summary.indexOf('may refer to the following:')!=-1){
                                                                            bot.chat("This may refer to several things - please be more specific.");
                                                                        }
                                                                        else if (subQuery!=''){
                                                                            content=content.substring(content.indexOf("=== "+subQuery+" ===")+8+subQuery.length);
                                                                            if (content.length>250){
                                                                                content=content.substring(0, 247)+"...";
                                                                            }  
                                                                            bot.chat(content);
                                                                        }
                                                                        else{
                                                                            if (content.length>250){
                                                                                content=content.substring(0, 247)+"...";
                                                                            }  
                                                                            bot.chat(content);
                                                                        }
                                                                        var queryChoice=qualifier;
                                                                        queryChoice=queryChoice.replace(/ /g, '_');
                                                                        bot.chat("For more info: http://en.wikipedia.org/wiki/" + queryChoice);
                                                                    }
                                                                    else{
                                                                        bot.chat("No wiki found.");
                                                                    }
                                                                });
                                                            });
                                                        }
                                                        else{
                                                            if (summary.length>250){
                                                                summary=summary.substring(0, 247)+"...";
                                                            }  
                                                            bot.chat(summary);
                                                            var queryChoice=qualifier;
                                                            queryChoice=queryChoice.replace(/ /g, '_');
                                                            bot.chat("For more info: http://en.wikipedia.org/wiki/" + queryChoice);
                                                        }
                                                    }
                                                    else{
                                                        bot.chat("No wiki found.");
                                                    }    
                                                });
                                            });
                                        });
                                    });
                                }
                                else{
                                    bot.chat("No wiki found.");
                                } 
                            });
                        });
                    }
                    else{
                        bot.chat("Try .wiki followed by something to look up.");
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
                case ".calc":
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
                    if (qualifier!="" && !(/\d\(/g.test(qualifier)) && !(/[\!\,\@\'\"\?\#\$\%\&\_\=\<\>\:\;\[\]\{\}\`\~\||log]/g.test(qualifier)) &&  !(/\^\s{0,}\d{0,}\s{0,}\^/g.test(qualifier)) && !(/\)\d/g.test(qualifier)) && !(/^[\+\-\*\/\^]/g.test(qualifier)) && !(/[\+\-\*\/\^]$/g.test(qualifier)) && !(/[\+\-\*\/\^]\s{0,}[\+\-\*\/\^]/g.test(qualifier)) && (!(/([a-zA-Z])\d/g.test(qualifier))) && !(/\d([a-zA-Z])/g.test(qualifier)) && !(/\d\s{1,}\d/g.test(qualifier)) && !(/\s\.\s/g.test(qualifier)) && !(/\.\d\./g.test(qualifier)) && !(/\d\.\s{1,}\d/g.test(qualifier)) && !(/\d\s{1,}\.\d/g.test(qualifier)) && !(/\.\./g.test(qualifier)) && counter==counter2){
                        func=qualifier;
                        func+=" + (0*x) + (0*y)";
                        var realfunc=mlexer.parseString(func);
                        var answer=(realfunc({x:0,y:0}));
                        if (answer.toString()!="NaN"){
                            bot.chat(answer.toString());
                        }
                        else{
                            bot.chat("/me does not compute.");
                        }
                    }
                    else{
                        bot.chat("/me does not compute.");
                    }
                    break;
                case ".translate":
                    if (qualifier!=""){
                        var params = { 
                            text: qualifier 
                        };
                        var language="";
                        client.initialize_token(function(keys){ 
                            client.detect(params, function(err, data) {
                                console.log(data);
                                language = data;
                            });
                            var params2 = { 
                                text: qualifier,
                                from: language,
                                to: 'en'
                            };
                            client.initialize_token(function(keys){ 
                                client.translate(params2, function(err, data) {
                                    console.log(params2.text+" "+language+" "+data);
                                    bot.chat(data);
                                });
                            });
                        });
                    }
                    else{
                        bot.chat("Try .translate followed by something to translate.");
                    }
                    break;    
            //}
        }
    });
});
