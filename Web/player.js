const PLAY_BUTTON_ELEMENT = document.getElementById("play-btn");
const STOP_BUTTON_ELEMENT = document.getElementById("stop-btn");
const SONG_INFO_TEXT_ELEMENT = document.getElementById("song-info-text");
const ERROR_TEXT_ELEMENT = document.getElementById("error-text");
const TEMPO_SLIDER_ELEMENT = document.getElementById("tempo-slider");
const TEMPO_TEXT_ELEMENT = document.getElementById("tempo-text");
const SONG_SELECTOR_ELEMENT = document.getElementById("song-selector");
const NOTE_REG_EXP = new RegExp(/^[1-6]_(([01][0-9])|20)$/);
const NOTE_LENGTH_REG_EXP = new RegExp(/^:((0[1248])|16|32)$/);
// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms));

let tab_source = SONG_SELECTOR_ELEMENT.value;
let artist;
let songName;
let originalTempo;
let currentTempo;
let beat;

// Array containing parsed tab data
// Format: [measure][note/harmony][note duration, note,..., note length]
let parsedTab = [];
// Array containing names of all notes used
// in current song (without repetition) 
let usedNotes = [];
let isFileCorrect = true;
let isParsed = false;
let stopRequest = false;
let isPlaying = false;

let audioCtx;
let audioSource;

loadSong();

PLAY_BUTTON_ELEMENT.addEventListener("click", function() {
  try {
    playAudio();
  } catch(e) {
    ERROR_TEXT_ELEMENT.textContent = e;
  }
});
  
STOP_BUTTON_ELEMENT.addEventListener("click", function() {
  if (isPlaying) {
    stopRequest = true;
  }
});
  
TEMPO_SLIDER_ELEMENT.addEventListener("input", function() {
  currentTempo = TEMPO_SLIDER_ELEMENT.value;
  setTempo();
});

SONG_SELECTOR_ELEMENT.addEventListener("input", function() {
  SONG_SELECTOR_ELEMENT.setAttribute("disabled", "disabled");
  loadSong();
});

// Load song - call this method first to start
function loadSong() {
  try {
    tab_source = SONG_SELECTOR_ELEMENT.value;
    parseTabs(tab_source);
    TEMPO_SLIDER_ELEMENT.value = currentTempo;
    SONG_INFO_TEXT_ELEMENT.innerHTML = `${artist} - ${songName} 
                                    (original: ${originalTempo} BPM)`;
    SONG_SELECTOR_ELEMENT.removeAttribute("disabled");
    // Debug outputs
    // console.log(parsedTab);
    // console.log(artist);
    // console.log(songName);
    // console.log(currentTempo);
    // console.log(beat);
  } catch(e) {
    ERROR_TEXT_ELEMENT.textContent = e;
    PLAY_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
    STOP_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
    TEMPO_SLIDER_ELEMENT.setAttribute("disabled", "disabled");
    SONG_SELECTOR_ELEMENT.setAttribute("disabled", "disabled");
  }
  
  getAllUsedNotes();
  console.log(usedNotes);
  }

// Parameter file: url of text file containing tabs
// Parse the file content to tabsArray and check if the file content is valid.
function parseTabs(file) {
  parsedTab = [] // clear from previous tab
  let tabs = readTabsFile(tab_source).split("\r\n");
  let currentMeasure = [];
  let currentStringQuantity;

  for (let i = 0; i < tabs.length; i++) {
    if (!isFileCorrect) {
      throw "Soubor s taby je neplatný nebo poškozený.";
    }

    if (tabs[i] == "|") {
      parsedTab.push(currentMeasure);
      currentMeasure = [];
    }
    else if(i < 4) {
      switch(i) {
        case 0:
          artist = tabs[i];
          break;
        case 1:
          songName = tabs[i];
          break;
        case 2:
          if (!isNaN(tabs[i]) && parseInt(tabs[i]) >= 40 &&
              parseInt(tabs[i]) <= 240) {
            originalTempo = parseInt(tabs[i]);
            currentTempo = parseInt(tabs[i]);
            setTempo();
          } else {
            isFileCorrect = false;
          }
          break;
        case 3:
          if (!isNaN(tabs[i]) && parseInt(tabs[i]) > 0 &&
              parseInt(tabs[i]) < 40) {
            beat = parseInt(tabs[i]);
          } else {
            isFileCorrect = false;
          }
          break;
      }
    } else {
      currentHarmony = []; // current note(s) 

      // Select how many notes (strings) are played at once (max 6)
      switch(tabs[i].length) {
        case 8: // 1 string
          currentStringQuantity = 1;
          break;
        case 13: // 2 strings
          currentStringQuantity = 2;
          break;
        case 18: // 3 strings
          currentStringQuantity = 3;
          break;
        case 23: // 4 strings
          currentStringQuantity = 4;
          break;
        case 28: // 5 strings
          currentStringQuantity = 5;
          break;
        case 33: // 6 strings
          currentStringQuantity = 6;
          break;
        default:
          isFileCorrect = false;
          break;
      }

      if (isFileCorrect) {
        let currentHarmony = parseHarmony(currentStringQuantity, tabs, i);

        if (currentHarmony != null) {
          currentMeasure.push(currentHarmony);
        }
      }
    }
  }
  if (isFileCorrect) {
    isParsed = true;
  }
}

// TODO: Find out how it works, or replace it
function readTabsFile(file) {
  let fileContent;
  let rawFile = new XMLHttpRequest();

  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if(rawFile.readyState === 4) {
      if(rawFile.status === 200 || rawFile.status == 0) {
        fileContent = rawFile.responseText;
      }
    }
  }

  rawFile.send(null);
  if (fileContent) {
    return fileContent;
  }

  isFileCorrect = false;
  throw "Soubor s taby nebyl nalezen.";
}

// Parse 1 note or harmony of more notes played at once
function parseHarmony(stringQuantity, tabs, i) {
  let currentHarmony = [];
  let currentNoteLength;
  let currentNoteDuration;

  if (NOTE_LENGTH_REG_EXP.test(tabs[i].substring(0, 3))) {
    // Set note length in seconds
    // tempo/beat = number of measures in 60 seconds
    // 60/(tempo/beat) = duration of 1 measure in seconds
    // (60/(tempo/beat))/toneLength = duration of the note in seconds
    currentNoteLength = parseInt(tabs[i].substring(1, 3));
    currentNoteDuration = ((60/(currentTempo/beat))/currentNoteLength);
    currentHarmony.push(currentNoteDuration);

    // Check fret numbers
    for (let j = 0; j < stringQuantity; j++) {
      let substringIndex = (4 + 5 * (j));
      let currentNote = tabs[i].substring(substringIndex, substringIndex + 4);
      if (NOTE_REG_EXP.test(currentNote)) {
        currentHarmony.push(currentNote);
      }
    }
    // Push current note length (for tempo change feature)
    currentHarmony.push(parseInt(tabs[i].substring(1, 3)));
    if (currentHarmony.length == stringQuantity + 2) {
      return currentHarmony;
    } 
  }

  isFileCorrect = false;
  return null;
}

function setTempo() {
  TEMPO_TEXT_ELEMENT.innerHTML = `Tempo: ${currentTempo}`;
}

// Create an array including all used notes
// in current tab (without repetition)
function getAllUsedNotes() {
  usedNotes = []; // clear from previous tab
  for (let measure = 0; measure < parsedTab.length; measure++) {
    for (let harmony = 0; harmony < parsedTab[measure].length; harmony++) {
      for (let element = 0;
           element < parsedTab[measure][harmony].length;
           element++) {
        // first and last element isn't note
        if (element != 0 &&
            element != parsedTab[measure][harmony].length - 1) {
          if (!usedNotes.includes(parsedTab[measure][harmony][element])) {
            usedNotes.push(parsedTab[measure][harmony][element]);
          }
        }
      }
    }
  }
}

// TODO: Enhance, add comments
async function playAudio () {
  //let currentNoteUrl;
  //const audioCtx = new AudioContext();
  //const request = new XMLHttpRequest();

  isPlaying = true;
  PLAY_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
  TEMPO_SLIDER_ELEMENT.setAttribute("disabled", "disabled");
  SONG_SELECTOR_ELEMENT.setAttribute("disabled", "disabled");
 
  if (isParsed) {
    // Change note duration according to the new tempo
    if (originalTempo != currentTempo) {
      let currentNoteLength;
      let newNoteDuration;

      for (let i = 0; i < parsedTab.length; i++) {
        for (let j = 0; j < parsedTab[i].length; j++) {
          currentNoteLength = parsedTab[i][j][parsedTab[i][j].length - 1];
          newNoteDuration = ((60/(currentTempo/beat))/currentNoteLength);
          parsedTab[i][j][0] = newNoteDuration;
        }
      }
    }

    for (let measure = 0; measure < parsedTab.length; measure++) {
      for (let harmony = 0; harmony < parsedTab[measure].length; harmony++) {
        if (!stopRequest) {
          switch (parsedTab[measure][harmony].length - 1) {
            // TODO: Add cases for more strings in harmony
            case 2: // 1 string played at once
              //let currentNoteAudio = new Audio();
              //currentNoteAudio.src = `sounds/${tabsArray[measure][harmony][1]}.wav`;
                            
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
                currentNoteUrl = `sounds/${tabsArray[measure][harmony][1]}.wav`;

                const request = new XMLHttpRequest();
                request.open("GET", currentNoteUrl, true);
                request.responseType = "arraybuffer";
                request.onload = function() {
                  let undecodedAudio = request.response;
                  audioCtx.decodeAudioData(undecodedAudio, onDecoded);
                };
                            
                function onDecoded(buffer) {
                  const source = audioCtx.createBufferSource();
                  source.buffer = buffer;
                  source.connect(audioCtx.destination);
                  source.start(0, 0, tabsArray[measure][harmony][0]);
                }

                request.send();
              */
                            
              console.log(parsedTab[measure][harmony][1]);     
              getAudioData(`sounds/${parsedTab[measure][harmony][1]}.wav`);
              audioSource.start(0, 0, parsedTab[measure][harmony][0]);
              await timer(parsedTab[measure][harmony][0]*1000);
              break;
          }
        }
      }
    }
  } else {
    throw ("Soubor s taby ještě nebyl zpracován nebo je poškozený." +
          " Zkuste obnovit stránku.");
  }

  isPlaying = false;
  stopRequest = false;
  PLAY_BUTTON_ELEMENT.removeAttribute("disabled");
  TEMPO_SLIDER_ELEMENT.removeAttribute("disabled");
  SONG_SELECTOR_ELEMENT.removeAttribute("disabled");
}

// Use XHR to load an audio track, and
// decodeAudioData to decode it and stick it in a buffer.
// Then we put the buffer into the source.
function getAudioData(path) {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioSource = audioCtx.createBufferSource();
  const request = new XMLHttpRequest();

  request.open("GET", path, true);
  request.responseType = "arraybuffer";
  request.onload = () => {
    const audioData = request.response;

    audioCtx.decodeAudioData(
      audioData,
      (buffer) => {  
        // May throw error (probably when audio not loaded in time)
        audioSource.buffer = buffer;
        audioSource.connect(audioCtx.destination);
      },
      (err) => console.error(`Error with decoding audio data: ${err.err}`)
    );
  };
  request.send();
}