const ARTIST_INPUT = document.getElementById("artist-input");
const SONG_NAME_INPUT = document.getElementById("song-name-input");
const TEMPO_INPUT = document.getElementById("tempo-input");
const OUTPUT_TEXTAREA = document.getElementById("output-textarea");
const ERROR_MESSAGE = document.getElementById("error-message");
const SAVE_METADATA_BUTTON = document.getElementById("save-metadata-btn");
const PLAY_HARMONY_BUTTON = document.getElementById("play-harmony-btn");
const LOAD_HARMONY_BUTTON = document.getElementById("load-harmony-btn");
const APPEND_HARMONY_BUTTON = document.getElementById("append-harmony-btn");
const REMOVE_LAST_BUTTON = document.getElementById("remove-last-btn");
const DOWNLOAD_BUTTON = document.getElementById("download-btn");
const ADD_TO_LIBRARY_BUTTON = document.getElementById("add-to-library-btn");
const STRING_ONE_SELECTOR = document.getElementById("string-one-selector");
const STRING_TWO_SELECTOR = document.getElementById("string-two-selector");
const STRING_THREE_SELECTOR = document.getElementById("string-three-selector");
const STRING_FOUR_SELECTOR = document.getElementById("string-four-selector");
const STRING_FIVE_SELECTOR = document.getElementById("string-five-selector");
const STRING_SIX_SELECTOR = document.getElementById("string-six-selector");
const NOTE_LENGTH_SELECTOR = document.getElementById("note-length-selector");
const DOT_RADIO = document.getElementsByName("dot-radio");

let output = "";
let metadataExist = false;
let currentMeasureLength = 0;
// array containing previous harmony, elements 0-5 are strings 1-6,
// element 6 is note length, elements 7,8 are dot_radio flags
let previousHarmony = ["X", "X", "X", "X", "X", "X", "01", "0"];

SAVE_METADATA_BUTTON.addEventListener("click", function() {
  saveMetadata();
});

PLAY_HARMONY_BUTTON.addEventListener("click", function() {
  playHarmony();
});

LOAD_HARMONY_BUTTON.addEventListener("click", function() {
  loadLastHarmony();
});

APPEND_HARMONY_BUTTON.addEventListener("click", function() {
  appendHarmony();
});
REMOVE_LAST_BUTTON.addEventListener("click", function() {
  removeLastHarmony();
});
DOWNLOAD_BUTTON.addEventListener("click", function() {
  downloadTab();
});
ADD_TO_LIBRARY_BUTTON.addEventListener("click", function() {
  addToLibrary();
});

// replace first three rows in output data and textarea
function saveMetadata() {
  if (TEMPO_INPUT.value >= 40 && TEMPO_INPUT.value <= 240) {
    ERROR_MESSAGE.innerText = "";
    let lines = output.split("\r\n");

    if (ARTIST_INPUT.value != "") {
      lines[0] = ARTIST_INPUT.value;
    } else {
      lines[0] = "Umělec neuveden";
    }

    if (SONG_NAME_INPUT.value != "") {
      lines[1] = SONG_NAME_INPUT.value;
    } else {
      lines[1] = "Název skladby neuveden";
    }

    lines[2] = TEMPO_INPUT.value;

    output = "";
    
    // Append data back to output, if metadataExist last line doesn't include \r\n
    if (!metadataExist) {
      for(let i = 0; i < lines.length; i++) {
        output += lines[i] + "\r\n";
      }
    } else {
      for(let i = 0; i < lines.length; i++) {
        if (i < lines.length - 1) {
          output += lines[i] + "\r\n";
        } else {
          output += lines[i];
        }
      }
    }

    OUTPUT_TEXTAREA.innerHTML = output
    metadataExist = true;
  } else {
    ERROR_MESSAGE.innerText = "Error: Tempo mimo rozsah.";
  }
}

// play note and update string selector
function selectNote(note) {
  if(TEMPO_INPUT.value >= 40 && TEMPO_INPUT.value <= 240) {
    ERROR_MESSAGE.innerText = "";
    let length;

    if (DOT_RADIO[0].checked) {
      length = ((60/TEMPO_INPUT.value)/(NOTE_LENGTH_SELECTOR.value/4));
    } else {
      length = ((60/TEMPO_INPUT.value)/(NOTE_LENGTH_SELECTOR.value/4)) * 1.5;
    }
    
    let audio = new Audio(`/sounds/${note}.wav`);
    audio.play();

    setTimeout(function(){
      audio.pause();
      audio.currentTime = 0;
    }, length*1000);
  } else {
    ERROR_MESSAGE.innerText = "Error: Tempo mimo rozsah.";
  }

  switch (note.substring(0, 1)) {
    case "1":
      STRING_ONE_SELECTOR.value = note.substring(2);
      break;
    case "2":
      STRING_TWO_SELECTOR.value = note.substring(2);
      break;
    case "3":
      STRING_THREE_SELECTOR.value = note.substring(2);
      break;
    case "4":
      STRING_FOUR_SELECTOR.value = note.substring(2);
      break;
    case "5":
      STRING_FIVE_SELECTOR.value = note.substring(2);
      break;
    case "6":
      STRING_SIX_SELECTOR.value = note.substring(2);
      break;
  }
}

function playHarmony() {
  if(TEMPO_INPUT.value >= 40 && TEMPO_INPUT.value <= 240) {
    ERROR_MESSAGE.innerText = "";
    let length;
    
    if (DOT_RADIO[0].checked) {
      length = ((60/TEMPO_INPUT.value)/(NOTE_LENGTH_SELECTOR.value/4));
    } else {
      length = ((60/TEMPO_INPUT.value)/(NOTE_LENGTH_SELECTOR.value/4)) * 1.5;
    }

    let audios = getAudioFiles();
    audios.forEach(audio => {
        audio.play();
    });
    setTimeout(function(){
        audios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
        });
    }, length*1000);
  } else {
    ERROR_MESSAGE.innerText = "Error: Tempo mimo rozsah.";
  }
}

function getAudioFiles() {
  let notes = getStringInfo();
  let audios = [];

  notes.forEach(note => {
    audios.push(new Audio(`/sounds/${note}.wav`));
  });

  return audios;
}

function getStringInfo() {
  let notes = [];
  if (STRING_ONE_SELECTOR.value != "X") {
    notes.push("1_" + STRING_ONE_SELECTOR.value);
  }
  if (STRING_TWO_SELECTOR.value != "X") {
    notes.push("2_" + STRING_TWO_SELECTOR.value);
  }
  if (STRING_THREE_SELECTOR.value != "X") {
    notes.push("3_" + STRING_THREE_SELECTOR.value);
  }
  if (STRING_FOUR_SELECTOR.value != "X") {
    notes.push("4_" + STRING_FOUR_SELECTOR.value);
  }
  if (STRING_FIVE_SELECTOR.value != "X") {
    notes.push("5_" + STRING_FIVE_SELECTOR.value);
  }
  if (STRING_SIX_SELECTOR.value != "X") {
    notes.push("6_" + STRING_SIX_SELECTOR.value);
  }
  return notes;
}

// reset harmony selectors
function resetHarmony() {
  STRING_ONE_SELECTOR.value = "X";
  STRING_TWO_SELECTOR.value = "X";
  STRING_THREE_SELECTOR.value = "X";
  STRING_FOUR_SELECTOR.value = "X";
  STRING_FIVE_SELECTOR.value = "X";
  STRING_SIX_SELECTOR.value = "X";
}

// check if measurement length is not too long or append | symbol if it equals 1
function measureManagement() {
  if (currentMeasureLength == 1) {
    currentMeasureLength = 0;
    output += "|\r\n"; 
    OUTPUT_TEXTAREA.innerHTML += "|\r\n";
    return 1;
  } else if (DOT_RADIO[0].checked && 
    currentMeasureLength + (1 / NOTE_LENGTH_SELECTOR.value) <= 1) {
    return 1;
  } else if (DOT_RADIO[1].checked && 
             currentMeasureLength + ((1 / NOTE_LENGTH_SELECTOR.value) * 1.5) <= 1) {
    return 1;
  } else {
    return 0;
  }
}

function appendHarmony() {
  if (measureManagement()) {
    ERROR_MESSAGE.innerText = "";
    if (DOT_RADIO[0].checked) {
      currentMeasureLength += 1 / NOTE_LENGTH_SELECTOR.value;
    } else {
      currentMeasureLength += (1 / NOTE_LENGTH_SELECTOR.value) * 1.5;
    }

    let noteList = getStringInfo();
    let notes;
    if (DOT_RADIO[0].checked) {
      notes = ":" + NOTE_LENGTH_SELECTOR.value;
    } else {
      notes = "." + NOTE_LENGTH_SELECTOR.value;
    }

    if (!metadataExist) {
      saveMetadata();
    }

    if(noteList.length == 0) {
      notes += " XXXX";
    } else {
      noteList.forEach(note => {
        notes += " " + note;
      });
    }
    
    output += notes + "\r\n";
    OUTPUT_TEXTAREA.innerHTML = output
  } else {
    ERROR_MESSAGE.innerText = "Délka not v tomto taktu neodpovídá 4/4 taktu.";
  }
  saveHarmony();
  resetHarmony();
}

// remove last row
function removeLastHarmony() {
  let lines = output.split("\r\n");

  if (lines.length > 4) {
    output = "";
    if (lines[lines.length - 2].length > 7) { // if the row includes harmony
      if (DOT_RADIO[0].checked) {
        currentMeasureLength -= 1 / lines[lines.length - 2].substring(1,3);
      } else {
        currentMeasureLength -= (1 / lines[lines.length - 2].substring(1,3)) * 1.5;
      }
    } else { // reset measure length when removing | symbol
      currentMeasureLength = 1;
    }

    for(let i = 0; i < (lines.length - 2); i++) {
      output += lines[i] + "\r\n";
    }

    OUTPUT_TEXTAREA.innerHTML = output
  }
}

function saveHarmony() {
  previousHarmony[0] = STRING_ONE_SELECTOR.value;
  previousHarmony[1] = STRING_TWO_SELECTOR.value;
  previousHarmony[2] = STRING_THREE_SELECTOR.value;
  previousHarmony[3] = STRING_FOUR_SELECTOR.value;
  previousHarmony[4] = STRING_FIVE_SELECTOR.value;
  previousHarmony[5] = STRING_SIX_SELECTOR.value;
  previousHarmony[6] = NOTE_LENGTH_SELECTOR.value;
  previousHarmony[7] = DOT_RADIO[0].checked;
  previousHarmony[8] = DOT_RADIO[1].checked;
}

function loadLastHarmony() {
  STRING_ONE_SELECTOR.value = previousHarmony[0];
  STRING_TWO_SELECTOR.value = previousHarmony[1];
  STRING_THREE_SELECTOR.value = previousHarmony[2];
  STRING_FOUR_SELECTOR.value = previousHarmony[3];
  STRING_FIVE_SELECTOR.value = previousHarmony[4];
  STRING_SIX_SELECTOR.value = previousHarmony[5];
  NOTE_LENGTH_SELECTOR.value = previousHarmony[6];
  DOT_RADIO[0].checked = previousHarmony[7];
  DOT_RADIO[1].checked = previousHarmony[8];
}

// prepare output data for export without affecting the current data
function prepareForExport() {
  let lines = output.split("\r\n");
  let realOutput = "";

  if (lines[lines.length - 2] != "|") {
    realOutput = output + "|";
  }
  else {
    for(let i = 0; i < lines.length; i++) {
      if (i < lines.length - 2) {
        realOutput += lines[i] + "\r\n";
      } else {
        realOutput += lines[i];
      }
    }
  }
  return realOutput;
}

function downloadTab() {
  let realOutput = prepareForExport();

  let filename = "tab.txt";
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(realOutput));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// TODO: finish this
function addToLibrary() {
  let realOutput = prepareForExport();

  console.log(realOutput);
}