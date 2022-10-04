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