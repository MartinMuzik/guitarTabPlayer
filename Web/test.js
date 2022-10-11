/*

// define variables

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let source;
const play = document.querySelector("#test-play");
const stop = document.querySelector("#test-stop");

let audioArray = ["sounds/5_00.wav", "sounds/5_02.wav", "sounds/5_04.wav", "sounds/5_07.wav", "sounds/5_12.wav"];

// use XHR to load an audio track, and
// decodeAudioData to decode it and stick it in a buffer.
// Then we put the buffer into the source

function getData() {
  source = audioCtx.createBufferSource();
  const request = new XMLHttpRequest();

  request.open("GET", "sounds/5_00.wav", true);

  request.responseType = "arraybuffer";

  request.onload = () => {
    const audioData = request.response;

    audioCtx.decodeAudioData(
      audioData,
      (buffer) => {
        source.buffer = buffer;

        source.connect(audioCtx.destination);
        source.loop = true;
      },

      (err) => console.error(`Error with decoding audio data: ${err.err}`)
    );
  };

  request.send();
}

// wire up buttons to stop and play audio

play.onclick = () => {
  getData();
  source.start(0, 0, 0.2);
  play.setAttribute("disabled", "disabled");
};

stop.onclick = () => {
  source.stop(0);
  play.removeAttribute("disabled");
};


*/

/*
const noteRegExp = new RegExp(/^[1-6]_(([01][0-9])|20)$/);
let someString = "6_00";
if (noteRegExp.test(someString)) {
  console.log("Yeah");
}
else {
  console.log("Nah");
}

const noteLengthRegExp = new RegExp(/^:((0[1248])|16|32)$/);
let someString2 = ":08";
if (noteLengthRegExp.test(someString2)) {
  console.log("Yeah");
}
else {
  console.log("Nah");
}
*/



/* Backup

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

/* tento radek odstranit
                            
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

*/





/* funkcni bez opakovani:
// TODO: Enhance, add comments
async function playAudio () {  
  let audioSource;
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
              console.log(parsedTab[measure][harmony][1]);
              //console.log(audioSource);

              // audioSource = audioCtx.createBufferSource();
              // audioSource.buffer = usedAudio[parsedTab[measure][harmony][1]];
              // audioSource.connect(audioCtx.destination);
              audioSource = usedAudio[parsedTab[measure][harmony][1]];
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
  let audioSource = audioCtx.createBufferSource();
  const request = new XMLHttpRequest();

  request.open("GET", path, true);
  request.responseType = "arraybuffer";
  request.onload = () => {
    const audioData = request.response;

    audioCtx.decodeAudioData(
      audioData,
      (buffer) => {
        audioSource.buffer = buffer;
        audioSource.connect(audioCtx.destination);
      },
      (err) => console.error(`Error with decoding audio data: ${err.err}`)
    );
  };
  request.send();
  return audioSource;
}
*/