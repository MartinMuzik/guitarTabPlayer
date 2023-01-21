const ARTIST_INPUT = document.getElementById("artist-input");
const SONG_NAME_INPUT = document.getElementById("song-name-input");
const TEMPO_INPUT = document.getElementById("tempo-input");
const OUTPUT_TEXTAREA = document.getElementById("output-textarea");
const SAVE_METADATA_BUTTON = document.getElementById("save-metadata-btn");

// currentFret[1-6] where 1-6 is string number (from e to E)
let currentFret6, currentFret5, currentFret4, currentFret3, currentFret2, currentFret1;
let output = "Blabla0\nBlabla1\nBlabla2\nBlabla3\nBlabla4\nBlabla5\n";


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

function playNote(note) {
  //debug only
  console.log(note);

  let audio = new Audio(`/sounds/${note}.wav`);
  audio.play();
  setTimeout(function(){
    audio.pause();
    audio.currentTime = 0;
  }, 2000);
}