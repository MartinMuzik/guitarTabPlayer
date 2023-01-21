const ARTIST_INPUT = document.getElementById("artist-input");
const SONG_NAME_INPUT = document.getElementById("song-name-input");
const TEMPO_INPUT = document.getElementById("tempo-input");
const OUTPUT_TEXTAREA = document.getElementById("output-textarea");
const SAVE_METADATA_BUTTON = document.getElementById("save-metadata-btn");
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

