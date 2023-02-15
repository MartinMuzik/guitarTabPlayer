const URL = window.location.href;
const SONG_LIST_CONTENT = document.getElementById("song-list-content");
const SONG_LIST_BTN = document.getElementById("song-list-btn");
const LOAD_BUTTON_ELEMENT = document.getElementById("load-btn");
const PLAY_BUTTON_ELEMENT = document.getElementById("play-btn");
const SONG_NAME_TEXT_ELEMENT = document.getElementById("song-name-text");
const ARTIST_TEXT_ELEMENT = document.getElementById("artist-text");
const ERROR_TEXT_ELEMENT = document.getElementById("error-text");
const TEMPO_SLIDER_ELEMENT = document.getElementById("tempo-slider");
const TEMPO_TEXT_ELEMENT = document.getElementById("tempo-text");
const START_INPUT_ELEMENT = document.getElementById("start-input");
const NOTE_REG_EXP = new RegExp(/^([1-6]_(([01][0-9])|20))|XXXX$/);
const NOTE_LENGTH_REG_EXP = new RegExp(/^(:|.)((0[1248])|16|32)$/);
// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms));
// Should represent time (in ms) of processing code between playing each note
// This devation is then substracted from waiting period
// before playing next note 
const DEVIATION = 3.4;

let tabSource;
let artist;
let songName;
let originalTempo;
let currentTempo;

// Array containing parsed tab data
// Format: [measure][note/harmony][note duration, note,..., include dot, note length]
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
// used when calculating new note lengths after changing the tempo
// condition: originalTempo != currentTempo won't work correctly when changing
// different tempo back to the value of originalTempo; 
let isTempoChanged = false;


//Page loading starts here
logout(); //remove session cookie (tab selector would not work with that cookie set)
PLAY_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
TEMPO_SLIDER_ELEMENT.setAttribute("disabled", "disabled");
START_INPUT_ELEMENT.setAttribute("disabled", "disabled");
loadLibrary();
getCookie();

// AudioContext would not work without some interaction with a user
LOAD_BUTTON_ELEMENT.addEventListener("click", function() {
  if (document.cookie != "") {
    audioContext = new AudioContext;
    LOAD_BUTTON_ELEMENT.remove();
    loadSong();
  } else {
    ERROR_TEXT_ELEMENT.textContent = "Nejprve musíte vybrat skladbu.";
  }
});

PLAY_BUTTON_ELEMENT.addEventListener("click", function() {
  if (isPlaying) {
    stopRequest = true;
    PLAY_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
  } else {
    if (START_INPUT_ELEMENT.value <= parsedTab.length) {
      ERROR_TEXT_ELEMENT.textContent = "";
      playSong();
    } else {
      ERROR_TEXT_ELEMENT.textContent = "Zvolený začáteční takt přesahuje délku skladby.";
    }
  }
});
  
TEMPO_SLIDER_ELEMENT.addEventListener("input", function() {
  currentTempo = TEMPO_SLIDER_ELEMENT.value;
  setTempo();
  isTempoChanged = true;
});

// Load song - call this method first to start
function loadSong() {
  try {
    parseTabs();
    renderTabs(parsedTab);
  } catch(e) {
    ERROR_TEXT_ELEMENT.textContent = e;
  }

  if(isParsed) {
    ERROR_TEXT_ELEMENT.innerText = "Načítá se";
    TEMPO_SLIDER_ELEMENT.value = currentTempo;
    ARTIST_TEXT_ELEMENT.innerText = artist;
    SONG_NAME_TEXT_ELEMENT.innerText = songName;
    // load all required audio sources
    getAllUsedNotes();
    setupAudioFiles(usedNotes).then((response) => {
      audioBuffers = response;
      PLAY_BUTTON_ELEMENT.removeAttribute("disabled");
      TEMPO_SLIDER_ELEMENT.removeAttribute("disabled");
      START_INPUT_ELEMENT.removeAttribute("disabled");
      ERROR_TEXT_ELEMENT.innerText = "";
    });
  }
}

// Parameter file: url of the text file containing tabs
// Parse the file content to tabsArray and check if the file content is valid.
function parseTabs() {
  parsedTab = [] // clear from previous loaded tab
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
    else if(i < 3) {
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
      } else {
        throw "Soubor s taby je neplatný nebo poškozený."; // throw error if last line of tab is incorrect
      }
    }
  }
  if (isFileCorrect) {
    isParsed = true;
    START_INPUT_ELEMENT.max = parsedTab.length;
  }
}

// Parse 1 note or harmony of more notes played at once
function parseHarmony(stringQuantity, tabs, i) {
  let currentHarmony = [];
  let currentNoteLength;
  let currentNoteDuration;
  let isDot;

  if (NOTE_LENGTH_REG_EXP.test(tabs[i].substring(0, 3))) {
    // Set note length in seconds
    // 60/currentTempo = duration of 1 quarter note in seconds
    // (60/currentTempo)/(currentNoteLength/4) = duration of current note in seconds
    currentNoteLength = parseInt(tabs[i].substring(1, 3));
    // note with dot multiples its duration 1.5x
    if (tabs[i].substring(0, 1) == ":") {
      currentNoteDuration = ((60/currentTempo)/(currentNoteLength/4));
      isDot = false;
    } else if (tabs[i].substring(0, 1) == ".") {
      currentNoteDuration = ((60/currentTempo)/(currentNoteLength/4)) * 1.5;
      isDot = true;
    }
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
    currentHarmony.push(isDot);
    currentHarmony.push(parseInt(tabs[i].substring(1, 3)));

    if (currentHarmony.length == stringQuantity + 3) {
      return currentHarmony;
    } 
  }

  isFileCorrect = false;
  return null;
}

// Read text file cointaing tabs
function readTabsFile(file) {
  let fileContent = readFile(file);

  if (fileContent) {
    return fileContent;
  }

  isFileCorrect = false;
  throw "Soubor s taby nebyl nalezen.";
}

// Read library.txt file
function readLibraryFile() {
  let fileContent = readFile("library.txt?date=" + Date.now()); // disable caching this file (by parameter date)

  if (fileContent) {
    return fileContent;
  }

  isFileCorrect = false;
  throw "Soubor s knihovnou tabulatur nebyl nalezen nebo je poškozen.";
}

// Read text file with XHR
function readFile(file) {
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
  return fileContent;
}

// set currentTempo
function setTempo() {
  TEMPO_TEXT_ELEMENT.innerText = `${currentTempo} BPM (original: ${originalTempo} BPM)`;
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
        // first and last two elements aren't note
        if (element != 0 &&
            element != parsedTab[measure][harmony].length - 1 &&
            element != parsedTab[measure][harmony].length - 2) {
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
  startFrom = START_INPUT_ELEMENT.value - 1;
  PLAY_BUTTON_ELEMENT.innerText = "■";
  PLAY_BUTTON_ELEMENT.style.padding = "0px 13.89px 11px 13px";
  PLAY_BUTTON_ELEMENT.style.fontSize = "30px";
  TEMPO_SLIDER_ELEMENT.setAttribute("disabled", "disabled");
  START_INPUT_ELEMENT.setAttribute("disabled", "disabled");
 
  if (isParsed) {
    // Change note duration according to the new tempo
    if (isTempoChanged) {
      changeTempo();
    }

    for (let measure = startFrom; measure < parsedTab.length; measure++) {
      for (let harmony = 0; harmony < parsedTab[measure].length; harmony++) {
        if (!stopRequest) {
          movePointer(measure, harmony);
          
          for (let string = 0; string < parsedTab[measure][harmony].length - 2; string ++) {
            // play current note (get audioBuffer by note name, note length)
            playAudio(audioBuffers[parsedTab[measure][harmony][string + 1]],
              parsedTab[measure][harmony][0]);
          }
          // wait till the audio stops playing
          await timer(parsedTab[measure][harmony][0]*1000 - DEVIATION);
        }
      }
      // window.scrollBy(0, 30); // autoscroll
    }
  } else {
    ERROR_TEXT_ELEMENT.textContent = "Soubor s taby ještě nebyl zpracován " +
    "nebo je poškozený. Zkuste obnovit stránku.";
  }

  isPlaying = false;
  if (stopRequest) {
    stopRequest = false;
    PLAY_BUTTON_ELEMENT.removeAttribute("disabled");
  }
  PLAY_BUTTON_ELEMENT.innerText = "►";
  PLAY_BUTTON_ELEMENT.style.padding = "9px 11px 13px 14.21px";
  PLAY_BUTTON_ELEMENT.style.fontSize = "20px";
  TEMPO_SLIDER_ELEMENT.removeAttribute("disabled");
  START_INPUT_ELEMENT.removeAttribute("disabled");
  movePointer(startFrom, 0);
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

function changeTempo() {
  let currentNoteLength;
  let newNoteDuration;

  for (let i = 0; i < parsedTab.length; i++) {
    for (let j = 0; j < parsedTab[i].length; j++) {
      currentNoteLength = parsedTab[i][j][parsedTab[i][j].length - 1];
      // note with dot multiples its duration 1.5x
      if (parsedTab[i][j][parsedTab[i][j].length - 2] == false) {
        newNoteDuration = ((60/currentTempo)/(currentNoteLength/4));
      } else if (parsedTab[i][j][parsedTab[i][j].length - 2] == true) {
        newNoteDuration = ((60/currentTempo)/(currentNoteLength/4)) * 1.5;
      } 

      parsedTab[i][j][0] = newNoteDuration;
    }
  }
}

// Load cookie "currentTabSource" and set tabSource
// Use to switch between songs and don't fill cache with audio sources
function getCookie() {
  if (document.cookie != "") {
    SONG_LIST_BTN.innerHTML = getDisplayName(document.cookie.substring(17));
    tabSource = `tabs/${document.cookie.substring(17)}.txt`;
    ERROR_TEXT_ELEMENT.textContent = "Klikněte na tlačítko Načíst.";
  }
}

// set cookie "currentTabSource" value to newly selected song
function setCookie(newTabSource) {
  document.cookie = "currentTabSource=" + newTabSource;
}

function getDisplayName(fileName) {
  try {
    let fileContent = readLibraryFile();
    let displayNames = getDisplayNames(fileContent);
    let fileNames = getFileNames(fileContent);
    let foundIndex = -1;

    for (let i = 0; i < displayNames.length; i++) {
      if (fileNames[i] == fileName) {
        foundIndex = i;
      }
    }

    if (foundIndex >= 0) {
      return displayNames[foundIndex];
    } else {
      throw "Tab nenalezen";
    }
  } catch(e) {
    ERROR_TEXT_ELEMENT.textContent = e;
  }
}

// Load library content to song list
function loadLibrary() {
  try {
    let fileContent = readLibraryFile();
    let libraryHTML = prepareLibrary(fileContent);
    SONG_LIST_CONTENT.innerHTML = libraryHTML;
  } catch(e) {
    ERROR_TEXT_ELEMENT.textContent = e;
  }
}

function prepareLibrary(fileContent) {
  let result = "";
  let displayNames = getDisplayNames(fileContent);
  let fileNames = getFileNames(fileContent);

  for (let i = 0; i < displayNames.length; i++) {
    result += `<a onclick="selectTab('${fileNames[i]}')">${displayNames[i]}</a>`;
  }
  
  return result;
}

function selectTab(newTabSource) {
  setCookie(newTabSource);
  document.location.reload();
}

function getDisplayNames(fileContent) {
  let lines = fileContent.split("\r\n");
  let displayNames = [];

  for (let i = 1; i < lines.length; i += 2) {
    displayNames.push(lines[i]);
  }

  return displayNames;
}

function getFileNames(fileContent) {
  let lines = fileContent.split("\r\n");
  let fileNames = [];

  for (let i = 0; i < lines.length - 1; i += 2) {
    fileNames.push(lines[i]);
  }

  return fileNames;
}

function logout() {
  readFile("logout.php");
}