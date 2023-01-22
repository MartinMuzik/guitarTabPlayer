const ARTIST_INPUT = document.getElementById("artist-input");
const SONG_NAME_INPUT = document.getElementById("song-name-input");
const TEMPO_INPUT = document.getElementById("tempo-input");
const OUTPUT_TEXTAREA = document.getElementById("output-textarea");
const SAVE_METADATA_BUTTON = document.getElementById("save-metadata-btn");
const PLAY_HARMONY_BUTTON = document.getElementById("play-harmony-btn");
const RESET_HARMONY_BUTTON = document.getElementById("reset-harmony-btn");
const APPEND_HARMONY_BUTTON = document.getElementById("append-harmony-btn");
const REMOVE_LAST_BUTTON = document.getElementById("remove-last-btn");
const STRING_ONE_SELECTOR = document.getElementById("string-one-selector");
const STRING_TWO_SELECTOR = document.getElementById("string-two-selector");
const STRING_THREE_SELECTOR = document.getElementById("string-three-selector");
const STRING_FOUR_SELECTOR = document.getElementById("string-four-selector");
const STRING_FIVE_SELECTOR = document.getElementById("string-five-selector");
const STRING_SIX_SELECTOR = document.getElementById("string-six-selector");
const NOTE_LENGTH_SELECTOR = document.getElementById("note-length-selector");

let output = "";
let metadataExist = false;

SAVE_METADATA_BUTTON.addEventListener("click", function() {
  saveMetadata();
});

PLAY_HARMONY_BUTTON.addEventListener("click", function() {
  playHarmony();
});

RESET_HARMONY_BUTTON.addEventListener("click", function() {
  resetHarmony();
});

APPEND_HARMONY_BUTTON.addEventListener("click", function() {
  appendHarmony();
});
REMOVE_LAST_BUTTON.addEventListener("click", function() {
  removeLastHarmony();
});

// replace first three rows in output data and textarea
function saveMetadata() {
  let lines = output.split("\n");

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

  if (TEMPO_INPUT.value >= 40 && TEMPO_INPUT.value <= 240) {
    lines[2] = TEMPO_INPUT.value;
  } else {
    lines[2] = "Tempo mimo rozsah";
  }

  output = "";

  for(let i = 0; i < lines.length; i++) {
    output += lines[i] + "\n";
  }

  OUTPUT_TEXTAREA.innerHTML = output.replace("\n", "\r\n"); // HTML textarea requires \r\n for new line
  metadataExist = true;
}

// play note and update string selector
function selectNote(note) {
  if(TEMPO_INPUT.value >= 40 && TEMPO_INPUT.value <= 240) {
    let length = ((60/TEMPO_INPUT.value)/(NOTE_LENGTH_SELECTOR.value/4));
    let audio = new Audio(`/sounds/${note}.wav`);
    audio.play();

    setTimeout(function(){
      audio.pause();
      audio.currentTime = 0;
    }, length*1000);
  } else {
    console.log("Tempo out of range.");
  }

  switch (note.substring(0, 1)) {
    case "1":
      STRING_ONE_SELECTOR.value = note.substring(2);
      console.log(STRING_ONE_SELECTOR.value);
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
    let length = ((60/TEMPO_INPUT.value)/(NOTE_LENGTH_SELECTOR.value/4));
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
    console.log("Tempo out of range.");
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

function resetHarmony() {
  STRING_ONE_SELECTOR.value = "X";
  STRING_TWO_SELECTOR.value = "X";
  STRING_THREE_SELECTOR.value = "X";
  STRING_FOUR_SELECTOR.value = "X";
  STRING_FIVE_SELECTOR.value = "X";
  STRING_SIX_SELECTOR.value = "X";
}

function appendHarmony() {
  let noteList = getStringInfo();
  let notes = ":" + NOTE_LENGTH_SELECTOR.value;

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
  
  output += notes + "\n";
  OUTPUT_TEXTAREA.innerHTML = output.replace("\n", "\r\n"); // HTML textarea requires \r\n for new line
}

function removeLastHarmony() {
  let lines = output.split("\n");

  if (lines.length > 4) {
    output = "";

    for(let i = 0; i < (lines.length - 2); i++) {
      output += lines[i] + "\n";
    }

    OUTPUT_TEXTAREA.innerHTML = output.replace("\n", "\r\n"); // HTML textarea requires \r\n for new line
  }
}