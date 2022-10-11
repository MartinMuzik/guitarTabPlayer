const URL = window.location.href;
const LOAD_BUTTON_ELEMENT = document.getElementById("load-btn");
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

let tabSource = SONG_SELECTOR_ELEMENT.value;
let artist;
let songName;
let originalTempo;
let currentTempo;
let beat;
// debug only (execute time measurement)
let songDuration = 0;

// Array containing parsed tab data
// Format: [measure][note/harmony][note duration, note,..., note length]
let parsedTab = [];
// Array containing names of all notes used
// in current song (without repetition) 
let usedNotes = [];
// Dictionary containing loaded audio buffers which current song needs
let audioBuffers;
// AudioContext object
let audioContext;

let isFileCorrect = true;
let isParsed = false;
let stopRequest = false;
let isPlaying = false;

PLAY_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
getCookie();


LOAD_BUTTON_ELEMENT.addEventListener("click", function() {
  audioContext = new AudioContext;
  SONG_SELECTOR_ELEMENT.setAttribute("disabled", "disabled");
  PLAY_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
  LOAD_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
  loadSong();
});

PLAY_BUTTON_ELEMENT.addEventListener("click", function() {
  try {
    playSong();
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
  setCookie();
  // refresh page (to clear cache)
  document.location.reload();
});


// Load song - call this method first to start
function loadSong() {
  try {
    tabSource = SONG_SELECTOR_ELEMENT.value;
    parseTabs(tabSource);
    // only debug (time measure)
    console.log("Song duration: " + songDuration*1000 + "ms");

    TEMPO_SLIDER_ELEMENT.value = currentTempo;
    SONG_INFO_TEXT_ELEMENT.innerHTML = `${artist} - ${songName} 
                                    (original: ${originalTempo} BPM)`;
    // load all required audio sources
    getAllUsedNotes();
    setupAudioFiles(usedNotes).then((response) => {
      audioBuffers = response;
      SONG_SELECTOR_ELEMENT.removeAttribute("disabled");
      PLAY_BUTTON_ELEMENT.removeAttribute("disabled");
    });
  } catch(e) {
    ERROR_TEXT_ELEMENT.textContent = e;
    LOAD_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
    PLAY_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
    STOP_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
    TEMPO_SLIDER_ELEMENT.setAttribute("disabled", "disabled");
    SONG_SELECTOR_ELEMENT.setAttribute("disabled", "disabled");
  }
  }

// Parameter file: url of text file containing tabs
// Parse the file content to tabsArray and check if the file content is valid.
function parseTabs(file) {
  parsedTab = [] // clear from previous tab
  let tabs = readTabsFile(tabSource).split("\r\n");
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
// Read text file cointaing tabs with XHR
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
    // for debug
    songDuration += currentNoteDuration;

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

// set currentTempo
function setTempo() {
  TEMPO_TEXT_ELEMENT.innerHTML = `Tempo: ${currentTempo} BPM`;
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
          if (!usedNotes.includes("sounds/"+
              parsedTab[measure][harmony][element] + ".wav")
            ) {
            usedNotes.push("sounds/"+
                            parsedTab[measure][harmony][element] + ".wav");
          }
        }
      }
    }
  }
}

// Play audio sources asynchronously according to parsedTab array
// Each note (audio source) plays for specific time according to note length
async function playSong () {  
  isPlaying = true;
  stopRequest = false;
  PLAY_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
  TEMPO_SLIDER_ELEMENT.setAttribute("disabled", "disabled");
  SONG_SELECTOR_ELEMENT.setAttribute("disabled", "disabled");
  LOAD_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
 
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

    // debug only (execute time measurement)
    const start = Date.now();

    for (let measure = 0; measure < parsedTab.length; measure++) {
      for (let harmony = 0; harmony < parsedTab[measure].length; harmony++) {
        if (!stopRequest) {
          switch (parsedTab[measure][harmony].length - 1) {
            // TODO: Add cases for more strings in harmony
            case 2: // 1 string played at once
              console.log("Current note: " + parsedTab[measure][harmony][1]);
              // play current note (get audioBuffer by note name, note length)
              playAudio(audioBuffers[parsedTab[measure][harmony][1]], parsedTab[measure][harmony][0]);
              // wait till the audio stops playing
              await timer(parsedTab[measure][harmony][0]*1000);
              break;
          }
        }
      }
    }

    // debug only (execute time measurement)
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
    console.log("Delay: " + ((end - start) - songDuration*1000) + "ms");
    
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

// Fetch audio file, decode it and stick it in a audioBuffer.
// return audioBuffer
async function getAudioFile(path) {
  const response = await fetch(path);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

// setup all audio files from paths array
async function setupAudioFiles(paths) {
  console.log("Loading audio...");
  const audioBuffers = {};

  for (const path of paths) {
    const currentAudio = await getAudioFile(path);
    audioBuffers[path.substring(7, 11)] = currentAudio;
  }
  console.log("Audio loaded.");
  return audioBuffers;
}

// Create audioSource node, stick it to its buffer
// play it for time duration
function playAudio(audioBuffer, time) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.connect(audioContext.destination);
  audioSource.start(0, 0, time);
}

// Load cookie "currentTabSource" and set tabSource
// Used to switch between songs and don't fill cache with audio sources
function getCookie() {
  if (document.cookie != "") {
    SONG_SELECTOR_ELEMENT.value = document.cookie.substring(17);
    tabSource = SONG_SELECTOR_ELEMENT.value;
  }
}

// set cookie "currentTabSource" value to newly selected song
function setCookie() {
  document.cookie = "currentTabSource=" + SONG_SELECTOR_ELEMENT.value;
}