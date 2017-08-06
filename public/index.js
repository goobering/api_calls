var windowLoaded = function(){
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

    var recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    var diagnostic = document.querySelector('#output');
    var startTag = document.querySelector('#start-speech');
    var startLabel = document.querySelector('#start-label');

    startTag.onclick = function(){
        // Clear out Wikipedia extract
        var wikiDiv = document.querySelector('#wiki-extract');
        wikiDiv.innerHTML = '';

        // Start speech recognition
        recognition.start();
    }

    // Called when the user has stopped speaking and parsed result returned
    recognition.onresult = function(event){
        var last = event.results.length - 1;
        var phrase = event.results[last][0].transcript;

        // Send the parsed string to an interface element
        diagnostic.textContent = phrase;

        var jsonPhrase = {"phrase": phrase};
        getYoutubeResult(jsonPhrase);
        getWikipediaResult(jsonPhrase);
    };

    recognition.onaudiostart = function() {
        console.log('Audio capturing started');
        
        startTag.style.backgroundColor = 'red';
        startTag.style.color = 'white';
        startLabel.textContent  = 'Recording';
    };

    recognition.onaudioend = function() {
        console.log('Audio capturing ended');

        startTag.style.backgroundColor = 'gold';
        startTag.style.color = 'lightslategrey';
        startLabel.textContent  = 'Start';
    };

    recognition.onspeechend = function(){
        recognition.stop();
    };

    recognition.onerror = function(event){
        diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
    };
};

window.addEventListener('load', windowLoaded);

//searchTerm needs to be an object with a value representing the desired search
var getYoutubeResult = function(searchTerm){
    var stringTerm = searchTerm.phrase;
    var url = 'http://localhost:3000/youtube/' + stringTerm;
    makeRequest(url, youtubeRequestComplete);
};

var getWikipediaResult = function(searchTerm){
    var stringTerm = encodeURIComponent(searchTerm.phrase.trim());
    var url = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=' + stringTerm + '&origin=*';

    var xhr = createCORSRequest('GET', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    // Response handlers.
    xhr.onload = function(){
        if(this.status !== 200)
        return;

        var responseText = xhr.responseText;
        var jsonText = JSON.parse(responseText);
        buildWiki(jsonText);
    }

    xhr.onerror = function() {
        alert('Woops, there was an error making the request.');
    };

    xhr.send();
}

// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

var makeRequest = function(url, callback){
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.addEventListener('load', callback);
    request.send();
};

var youtubeRequestComplete = function(){
    if(this.status !== 200) 
        return;

    var jsonString = this.responseText;
    var wtf = JSON.parse(jsonString);
    var result = JSON.parse(wtf);
    
    buildYoutube(result.items[0].id.videoId);
};

var buildYoutube = function(videoId){
    console.log('videoId: ' + videoId);
    console.log('this.YT: ' + this.YT);
    if(this.YT){
         this.YT.get('ytplayer').loadVideoById(videoId);
         return;
    }

    // Load the IFrame Player API code asynchronously.
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('ytplayer', {
            attr: { type: 'text/css', href: 'main.css', rel: 'stylesheet' },
            videoId: videoId,
            events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
            }
        });
    };

    function onPlayerReady(event) {
        console.log('player: ' + player);
        console.log('player.videoId: ' + player.b.c.videoId);
        event.target.playVideo();
    };

    var done = false;
    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.ENDED) {
            //Get rid of the player
            event.target.destroy();
        };
    };

    function stopVideo() {
        player.stopVideo();
    };
}

var buildWiki = function(wikiExtract){
    if(Object.entries(wikiExtract.query.pages)[0][1].extract){
        var wikiDiv = document.querySelector('#wiki-extract');

        var wikiTag = document.createElement('p');
        var text = Object.entries(wikiExtract.query.pages)[0][1].extract.replace(/<[^>]+>/gi,"");
        wikiTag.innerText = text;

        wikiDiv.appendChild(wikiTag);
    };
};