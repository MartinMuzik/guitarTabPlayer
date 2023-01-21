const ARTIST_INPUT = document.getElementById("artist-input");
const SONG_NAME_INPUT = document.getElementById("song-name-input");
const TEMPO_INPUT = document.getElementById("tempo-input");
const OUTPUT_TEXTAREA = document.getElementById("output-textarea");
const SAVE_METADATA_BUTTON = document.getElementById("save-metadata-btn");
const PLAY_HARMONY_BUTTON = document.getElementById("play-harmony-btn");
const RESET_HARMONY_BUTTON = document.getElementById("reset-harmony-btn");
const STRING_ONE_SELECTOR = document.getElementById("string-one-selector");
const STRING_TWO_SELECTOR = document.getElementById("string-two-selector");
const STRING_THREE_SELECTOR = document.getElementById("string-three-selector");
const STRING_FOUR_SELECTOR = document.getElementById("string-four-selector");
const STRING_FIVE_SELECTOR = document.getElementById("string-five-selector");
const STRING_SIX_SELECTOR = document.getElementById("string-six-selector");
const NOTE_LENGTH_SELECTOR = document.getElementById("note-length-selector");

let output = "Blabla0\nBlabla1\nBlabla2\nBlabla3\nBlabla4\nBlabla5\n";

// replace first three rows in output data and textarea
SAVE_METADATA_BUTTON.addEventListener("click", function() {
  let lines = output.split("\n");
  lines[0] = ARTIST_INPUT.value;
  lines[1] = SONG_NAME_INPUT.value;

  if (TEMPO_INPUT.value >= 40 && TEMPO_INPUT.value <= 240) {
    lines[2] = TEMPO_INPUT.value;
  } else {
    lines[2] = "Tempo out of range.";
  }

  output = "";

  for(let i = 0; i < lines.length; i++) {
    output += lines[i] + "\n";
  }

  OUTPUT_TEXTAREA.innerHTML = output.replace("\n", "&#10");
});

// play current harmony
PLAY_HARMONY_BUTTON.addEventListener("click", function() {
  if(TEMPO_INPUT.value >= 40 && TEMPO_INPUT.value <= 240) {
    let length = ((60/TEMPO_INPUT.value)/(NOTE_LENGTH_SELECTOR.value/4))
    let audios = [];

    if (STRING_ONE_SELECTOR.value != "X") {
        audios.push(new Audio(`/sounds/1_${STRING_ONE_SELECTOR.value}.wav`));
    }
    if (STRING_TWO_SELECTOR.value != "X") {
      audios.push(new Audio(`/sounds/2_${STRING_TWO_SELECTOR.value}.wav`));
    }
    if (STRING_THREE_SELECTOR.value != "X") {
      audios.push(new Audio(`/sounds/3_${STRING_THREE_SELECTOR.value}.wav`));
    }
    if (STRING_FOUR_SELECTOR.value != "X") {
      audios.push(new Audio(`/sounds/4_${STRING_FOUR_SELECTOR.value}.wav`));
    }
    if (STRING_FIVE_SELECTOR.value != "X") {
      audios.push(new Audio(`/sounds/5_${STRING_FIVE_SELECTOR.value}.wav`));
    }
    if (STRING_SIX_SELECTOR.value != "X") {
      audios.push(new Audio(`/sounds/6_${STRING_SIX_SELECTOR.value}.wav`));
    }

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
});

RESET_HARMONY_BUTTON.addEventListener("click", function() {
  STRING_ONE_SELECTOR.value = "X";
  STRING_TWO_SELECTOR.value = "X";
  STRING_THREE_SELECTOR.value = "X";
  STRING_FOUR_SELECTOR.value = "X";
  STRING_FIVE_SELECTOR.value = "X";
  STRING_SIX_SELECTOR.value = "X";
});

// play note and update string selector
function selectNote(note) {
  //debug only
  console.log(note);

  let audio = new Audio(`/sounds/${note}.wav`);
  audio.play();
  setTimeout(function(){
    audio.pause();
    audio.currentTime = 0;
  }, 2000);

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
    
}