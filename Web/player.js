const PLAY_BUTTON_ELEMENT = document.getElementById("play-btn");
const STOP_BUTTON_ELEMENT = document.getElementById("stop-btn");
const ERROR_TEXT_ELEMENT = document.getElementById("error-text");
const TEMPO_SLIDER_ELEMENT = document.getElementById("tempo-slider");
const TEMPO_TEXT_ELEMENT = document.getElementById("tempo-text");

// TODO: remove and call from the specific file with source url
//const TAB_SOURCE = "tabs/test.txt";
//const TAB_SOURCE = "tabs/a_moll_pentatonic.txt";
//const TAB_SOURCE = "tabs/all_notes.txt";
//const TAB_SOURCE = "tabs/fur_elise.txt";
const TAB_SOURCE = "tabs/arctic_monkeys.txt";
const NOTE_REG_EXP = new RegExp(/^[1-6]_(([01][0-9])|20)$/);
const NOTE_LENGTH_REG_EXP = new RegExp(/^:((0[1248])|16|32)$/);
// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms));

let artist;
let songName;
let originalTempo;
let currentTempo;
let beat;

let tabsArray = []; // Array containing parsed tab data
let isFileCorrect = true;
let isParsed = false;

let audioCtx;
let audioSource;
let stopRequest = false;
let isPlaying = false;

try {
  parseTabs(TAB_SOURCE);
  // Debug outputs
  console.log(tabsArray);
  console.log(artist);
  console.log(songName);
  console.log(currentTempo);
  console.log(beat);
} catch(e) {
  ERROR_TEXT_ELEMENT.textContent = e;
}

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

// Parameter file: url of text file containing tabs
// Parse the file content to tabsArray and check if the file content is valid.
function parseTabs(file) {
  let tabs = readTabsFile(TAB_SOURCE).split("\r\n");
  let currentBar = [];
  let currentStringQuantity;

  for (let i = 0; i < tabs.length; i++) {
    if (!isFileCorrect) {
      throw "Soubor s taby je neplatný nebo poškozený.";
    }

    if (tabs[i] == "|") {
      tabsArray.push(currentBar);
      currentBar = [];
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
          currentBar.push(currentHarmony);
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
    // tempo/beat = number of bars in 60 seconds
    // 60/(tempo/beat) = duration of 1 bar in seconds
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

// TODO: Enhance, add comments
async function playAudio () {
  //let currentNoteUrl;
  //const audioCtx = new AudioContext();
  //const request = new XMLHttpRequest();

  isPlaying = true;
  PLAY_BUTTON_ELEMENT.setAttribute("disabled", "disabled");
  TEMPO_SLIDER_ELEMENT.setAttribute("disabled", "disabled");
 
  if (isParsed) {
    // Change note duration according to the new tempo
    if (originalTempo != currentTempo) {
      let currentNoteLength;
      let newNoteDuration;

      for (let i = 0; i < tabsArray.length; i++) {
        for (let j = 0; j < tabsArray[i].length; j++) {
          currentNoteLength = tabsArray[i][j][tabsArray[i][j].length - 1];
          newNoteDuration = ((60/(currentTempo/beat))/currentNoteLength);
          tabsArray[i][j][0] = newNoteDuration;
        }
      }
    }

    for (let bar = 0; bar < tabsArray.length; bar++) {
      for (let harmony = 0; harmony < tabsArray[bar].length; harmony++) {
        if (!stopRequest) {
          switch (tabsArray[bar][harmony].length - 1) {
            // TODO: Add cases for more strings in harmony
            case 2: // 1 string played at once
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
                            
              console.log(tabsArray[bar][harmony][1]);     
              getAudioData(`sounds/${tabsArray[bar][harmony][1]}.wav`);
              audioSource.start(0, 0, tabsArray[bar][harmony][0]);
              await timer(tabsArray[bar][harmony][0]*1000);
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