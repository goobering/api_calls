window.addEventListener('load', function(){
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

    var recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    var diagnostic = document.querySelector('#output');
    var startButton = document.querySelector('#button-start-speech');

    startButton.onclick = function(){
        recognition.start();
    }

    recognition.onresult = function(event){
        var last = event.results.length - 1;
        var phrase = event.results[last][0].transcript;

        diagnostic.textContent = phrase;


    }

    recognition.onspeechend = function(){
        recognition.stop();
    }

    recognition.onerror = function(event){
        diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
    }
});

