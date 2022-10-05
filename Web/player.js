const playBtnEl = document.getElementById("play-btn");
const stopBtnEl = document.getElementById("stop-btn");
const errorTextEl = document.getElementById("error-text");
const tempoSliderEl = document.getElementById("tempo-slider");
const tempoTextEl = document.getElementById("tempo-text");

// TODO: pak odstranit a volat funkci rovnou s nazvem skladby z jineho souboru
//const tabSource = "tabs/test.txt";
//const tabSource = "tabs/aMollPentatonic.txt";
//const tabSource = "tabs/allNotes.txt";
//const tabSource = "tabs/furElise.txt";
const tabSource = "tabs/arcticMonkeys.txt";
const noteRegExp = new RegExp(/^[1-6]_(([01][0-9])|20)$/);
const noteLengthRegExp = new RegExp(/^:((0[1248])|16|32)$/);

let artist;
let songName;
let originalTempo;
let tempo;
let beat;


let tabsArray = [];
let isFileCorrect = true;
let parsed = false;

let audioCtx;
let source;
let stopRequest = false;
let isPlaying = false;

try {
    parseTabs(tabSource);
    // Debug
    console.log(tabsArray);
    console.log(artist);
    console.log(songName);
    console.log(tempo);
    console.log(beat);
}
catch(e) {
    errorTextEl.textContent = e;
}

/*
    Parameters:  file - url to text file with tabs
    Description: It calls readTabsFile() function to read file, parse the text to tabsArray
                 and check if the file content is valid.
*/
function parseTabs(file) {
    let tabsString = readTabsFile(tabSource);
    let lines = tabsString.split("\r\n");
    let currentBar = [];
    let currentStringQuantity;

    for (let i = 0; i < lines.length; i++) {
        if (!isFileCorrect) {
            throw "Soubor s taby je neplatný nebo poškozený.";
        }
        if (lines[i] == "|") {
            tabsArray.push(currentBar);
            currentBar = [];
        }
        else if(i < 4) {
            switch(i) {
                case 0:
                    artist = lines[i];
                    break;
                case 1:
                    songName = lines[i];
                    break;
                case 2:
                    if (!isNaN(lines[i]) && parseInt(lines[i]) >= 40 && parseInt(lines[i]) <= 240) {
                        originalTempo = parseInt(lines[i]);
                        tempo = parseInt(lines[i]);
                        setTempo();
                    }
                    else {
                        isFileCorrect = false;
                    }
                    break;
                case 3:
                    if (!isNaN(lines[i]) && parseInt(lines[i]) > 0 && parseInt(lines[i]) < 40) {
                        beat = parseInt(lines[i]);
                    }
                    else {
                        isFileCorrect = false;
                    }
                    break;
            }
        }
        else {
            currentHarmony = []; // current note(s) 
            
            //Select how many notes (strings) are played at once (max 6)
            switch(lines[i].length) {
                // 1 string
                case 8:
                    currentStringQuantity = 1;
                    break;
                // 2 strings
                case 13:
                    currentStringQuantity = 2;
                    break;
                // 3 strings
                case 18:
                    currentStringQuantity = 3;
                    break;
                // 4 strings
                case 23:
                    currentStringQuantity = 4;
                    break;
                // 5 strings
                case 28:
                    currentStringQuantity = 5;
                    break;
                // 6 strings
                case 33:
                    currentStringQuantity = 6;
                    break;
                default:
                  isFileCorrect = false;
            }
            if (isFileCorrect) {
                let currentHarmony = parseHarmony(currentStringQuantity, lines, i);
                if (currentHarmony != null) {
                    currentBar.push(currentHarmony);
                }
            }
        }
    }
    if (isFileCorrect) {
        parsed = true;
    }
}
// TODO: Zjistit jak to funguje, pripadne nahradit lepsi
function readTabsFile(file) {
    let text;
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                text = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    if (text) {
        return text;
    }
    isFileCorrect = false;
    throw "Soubor s taby nebyl nalezen.";
}

function parseHarmony(stringQuantity, lines, i) {
    let currentHarmony = [];
    let currentNoteLength;
    let currentNoteDuration;

    if (noteLengthRegExp.test(lines[i].substring(0, 3))) {
        /*
            Set note length in seconds
            tempo/beat = How many bars are played in 1 minute (60 seconds)
            60/(tempo/beat) = How many seconds is played 1 bar
            (60/(tempo/beat))/toneLength = How many seconds is played the note
        */
        currentNoteLength = parseInt(lines[i].substring(1, 3));
        currentNoteDuration = ((60/(tempo/beat))/currentNoteLength);
        currentHarmony.push(currentNoteDuration);
        // Check fret numbers
        for (let j = 0; j < stringQuantity; j++) {
            let substringIndex = (4 + 5 * (j));
            if (noteRegExp.test(lines[i].substring(substringIndex, substringIndex + 4))) {
                currentHarmony.push(lines[i].substring(substringIndex, substringIndex + 4));
            }
        }
        currentHarmony.push(parseInt(lines[i].substring(1, 3)));  // for tempo change feature
        if (currentHarmony.length == stringQuantity + 2) {
            return currentHarmony;
        } 
    }
    isFileCorrect = false;
    return null;
}

playBtnEl.addEventListener("click", function() {
    try {
        playAudio();
    } catch(e) {
        errorTextEl.textContent = e;
    }
})

stopBtnEl.addEventListener("click", function() {
    if (isPlaying) {
        stopRequest = true;
    }
})

tempoSliderEl.addEventListener("input", function() {
    tempo = tempoSliderEl.value;
    setTempo();
})

function setTempo() {
    tempoTextEl.innerHTML = `Tempo: ${tempo}`;
}

const timer = ms => new Promise(res => setTimeout(res, ms));

async function playAudio () {
    //let currentNoteUrl;
    //const audioCtx = new AudioContext();
    //const request = new XMLHttpRequest();

    isPlaying = true;
    
    if (parsed) {
        if (originalTempo != tempo) {
            let currentNoteLength;
            let newNoteDuration;
            // change note duration according to the new tempo
            for (let i = 0; i < tabsArray.length; i++) {
                for (let j = 0; j < tabsArray[i].length; j++) {
                    currentNoteLength = tabsArray[i][j][tabsArray[i][j].length - 1];
                    newNoteDuration = ((60/(tempo/beat))/currentNoteLength);
                    tabsArray[i][j][0] = newNoteDuration;
                }
            }
        }
        for (let bar = 0; bar < tabsArray.length; bar++) {
            for (let harmony = 0; harmony < tabsArray[bar].length; harmony++) {
                if (!stopRequest) {
                    switch (tabsArray[bar][harmony].length - 1) {
                        // TODO: vice strun zaraz
                        // 1 string played at once
                        case 2:
                            //let currentNoteAudio = new Audio();
                            //currentNoteAudio.src = `sounds/${tabsArray[bar][harmony][1]}.wav`;
                            
                            
                            /*
                            currentNoteAudio.play();
                            wait(currentNoteDuration);
    
                            function wait(ms){
                                let start = new Date().getTime();
                                let end = start;
                                while(end < start + ms) {
                                  end = new Date().getTime();
                               }
                             }
                            */
                            /*
                            play();
                            async function play() {
                                currentNoteAudio.play();
                                const delay = ms => new Promise(res => setTimeout(res, ms));
                                await delay(currentNoteDuration);
                                //await setTimeout(currentNoteDuration)
                                currentNoteAudio.pause();
                            }
                            */
                            
                            /*
                            currentNoteUrl = `sounds/${tabsArray[bar][harmony][1]}.wav`;
    
                            const request = new XMLHttpRequest();
                            request.open("GET", currentNoteUrl, true);
                            request.responseType = "arraybuffer";
                            request.onload = function() {
                                //console.log("I am here", bar, harmony)
                                let undecodedAudio = request.response;
                                audioCtx.decodeAudioData(undecodedAudio, onDecoded);
                            };
                            
                            function onDecoded(buffer) {
                                const source = audioCtx.createBufferSource();
                                source.buffer = buffer;
                                
                                source.connect(audioCtx.destination);
                                source.start(0, 0, tabsArray[bar][harmony][0]);
                            }
                            request.send();
                            */
    
                            // Returns a Promise that resolves after "ms" Milliseconds
                            
                            console.log(tabsArray[bar][harmony][1]);
                            
                            // use XHR to load an audio track, and
                            // decodeAudioData to decode it and stick it in a buffer.
                            // Then we put the buffer into the source
    
                            getAudioData(`sounds/${tabsArray[bar][harmony][1]}.wav`);
                            source.start(0, 0, tabsArray[bar][harmony][0]);
                            playBtnEl.setAttribute("disabled", "disabled");
                            await timer(tabsArray[bar][harmony][0]*1000);
                            break;
                    }
                }
            }
        }
    }
    else {
        throw "Soubor s taby ještě nebyl zpracován nebo je poškozený. Zkuste obnovit stránku.";
    }
    isPlaying = false;
    stopRequest = false;
    playBtnEl.removeAttribute("disabled");
}

function getAudioData(path) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    source = audioCtx.createBufferSource();
    const request = new XMLHttpRequest();

    request.open("GET", path, true);

    request.responseType = "arraybuffer";

    request.onload = () => {
    const audioData = request.response;

    audioCtx.decodeAudioData(
        audioData,
        (buffer) => {
            
        // may throw error (probably when audio not loaded in time)
        source.buffer = buffer;

        source.connect(audioCtx.destination);
        },

        (err) => console.error(`Error with decoding audio data: ${err.err}`)
    );
    };

    request.send();
}