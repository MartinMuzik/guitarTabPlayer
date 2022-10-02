const playBtnEl = document.getElementById("play-btn");
const errorTextEl = document.getElementById("error-text");

// TODO: pak odstranit a volat funkci rovnou s nazvem skladby z jineho souboru
//const tabSource = "tabs/test.txt";
const tabSource = "tabs/test.txt";
let artist;
let songName;
let author;
let tempo;
let beat;

let tabsArray = [];
let isFileCorrect = true;
let parsed = false;

try {
    parseTabs(tabSource);
    // Debug
    console.log(tabsArray);
    console.log(artist);
    console.log(songName);
    console.log(author);
    console.log(tempo);
    console.log(beat);
}
catch(e) {
    errorTextEl.textContent = e;
}

/*
    Parameters:  file - url to text file with tabs
    Description: It calls readTabsFile() function to read file, parse the text to tabsArray
                 and check if the file content is valid.
*/
function parseTabs(file) {
    let tabsString = readTabsFile(tabSource);
    let lines = tabsString.split("\r\n");
    let currentBar = [];

    for (let i = 0; i < lines.length; i++) {
        if (!isFileCorrect) {
            throw "Omlouváme se, soubor s taby je neplatný.";
        }
        if (lines[i] == "|") {
            tabsArray.push(currentBar);
            currentBar = [];
        }
        else if(i < 5) {
            switch(i) {
                case 0:
                    artist = lines[i];
                    break;
                case 1:
                    songName = lines[i];
                    break;
                case 2:
                    author = lines[i];
                    break;
                case 3:
                    if (!isNaN(lines[i]) && parseInt(lines[i]) > 0 && parseInt(lines[i]) < 1000) {
                        tempo = parseInt(lines[i]);
                    }
                    else {
                        isFileCorrect = false;
                    }
                    break;
                case 4:
                    if (!isNaN(lines[i]) && parseInt(lines[i]) > 0 && parseInt(lines[i]) < 40) {
                        beat = parseInt(lines[i]);
                    }
                    else {
                        isFileCorrect = false;
                    }
                    break;
            }
        }
        else {
            let currentHarmony = []; // current note(s) 
            
            //TODO: Nahradit podminky regularnimi vyrazy, vcetne : na zacatku, cisla struny a _
            //Select how many notes (strings) are played at once (max 6)
            switch(lines[i].length) {
                // 1 string
                case 8:
                    // Check note length
                    if (!isNaN(lines[i].substring(1, 3)) && parseInt(lines[i].substring(1, 3)) > 0) {
                        currentHarmony.push(lines[i].substring(0, 3));
                        // Check fret number
                        if (!isNaN(lines[i].substring(6, 8)) && parseInt(lines[i].substring(6, 8)) >= 0 && parseInt(lines[i].substring(6, 8)) < 21) {
                            currentHarmony.push(lines[i].substring(4, 8));
                        }
                        else {
                            isFileCorrect = false;
                        }
                    }
                    else {
                        isFileCorrect = false;
                    }
                    break;
                // 2 strings
                case 13:
                    // Check note length
                    if (!isNaN(lines[i].substring(1, 3)) && parseInt(lines[i].substring(1, 3)) > 0) {
                        currentHarmony.push(lines[i].substring(0, 3));
                        // Check fret numbers
                        if (!isNaN(lines[i].substring(6, 8)) && parseInt(lines[i].substring(6, 8)) >= 0 && parseInt(lines[i].substring(6, 8)) < 21) {
                            currentHarmony.push(lines[i].substring(4, 8));
                            if (!isNaN(lines[i].substring(11, 13)) && parseInt(lines[i].substring(11, 13)) >= 0 && parseInt(lines[i].substring(11, 13)) < 21) {
                                currentHarmony.push(lines[i].substring(9, 13));
                            }
                            else {
                                isFileCorrect = false;
                            }
                        }
                        else {
                            isFileCorrect = false;
                        }
                    }
                    else {
                        isFileCorrect = false;
                    }
                    break;
                // 3 strings
                case 18:
                    // Check note length
                    if (!isNaN(lines[i].substring(1, 3)) && parseInt(lines[i].substring(1, 3)) > 0) {
                        currentHarmony.push(lines[i].substring(0, 3));
                        // Check fret numbers
                        if (!isNaN(lines[i].substring(6, 8)) && parseInt(lines[i].substring(6, 8)) >= 0 && parseInt(lines[i].substring(6, 8)) < 21) {
                            currentHarmony.push(lines[i].substring(4, 8));
                            if (!isNaN(lines[i].substring(11, 13)) && parseInt(lines[i].substring(11, 13)) >= 0 && parseInt(lines[i].substring(11, 13)) < 21) {
                                currentHarmony.push(lines[i].substring(9, 13));
                                if (!isNaN(lines[i].substring(16, 18)) && parseInt(lines[i].substring(16, 18)) >= 0 && parseInt(lines[i].substring(16, 18)) < 21) {
                                    currentHarmony.push(lines[i].substring(14, 18));
                                }
                                else {
                                    isFileCorrect = false;
                                }
                            }
                            else {
                                isFileCorrect = false;
                            }
                        }
                        else {
                            isFileCorrect = false;
                        }
                    }
                    else {
                        isFileCorrect = false;
                    }
                    break;
                // 4 strings
                case 23:
                    // Check note length
                    if (!isNaN(lines[i].substring(1, 3)) && parseInt(lines[i].substring(1, 3)) > 0) {
                        currentHarmony.push(lines[i].substring(0, 3));
                        // Check fret numbers
                        if (!isNaN(lines[i].substring(6, 8)) && parseInt(lines[i].substring(6, 8)) >= 0 && parseInt(lines[i].substring(6, 8)) < 21) {
                            currentHarmony.push(lines[i].substring(4, 8));
                            if (!isNaN(lines[i].substring(11, 13)) && parseInt(lines[i].substring(11, 13)) >= 0 && parseInt(lines[i].substring(11, 13)) < 21) {
                                currentHarmony.push(lines[i].substring(9, 13));
                                if (!isNaN(lines[i].substring(16, 18)) && parseInt(lines[i].substring(16, 18)) >= 0 && parseInt(lines[i].substring(16, 18)) < 21) {
                                    currentHarmony.push(lines[i].substring(14, 18));
                                    if (!isNaN(lines[i].substring(21, 23)) && parseInt(lines[i].substring(21, 23)) >= 0 && parseInt(lines[i].substring(21, 23)) < 21) {
                                        currentHarmony.push(lines[i].substring(19, 23));
                                    }
                                    else {
                                        isFileCorrect = false;
                                    }
                                }
                                else {
                                    isFileCorrect = false;
                                }
                            }
                            else {
                                isFileCorrect = false;
                            }
                        }
                        else {
                            isFileCorrect = false;
                        }
                    }
                    else {
                        isFileCorrect = false;
                    }
                    break;
                // 5 strings
                case 28:
                    // Check note length
                    if (!isNaN(lines[i].substring(1, 3)) && parseInt(lines[i].substring(1, 3)) > 0) {
                        currentHarmony.push(lines[i].substring(0, 3));
                        // Check fret numbers
                        if (!isNaN(lines[i].substring(6, 8)) && parseInt(lines[i].substring(6, 8)) >= 0 && parseInt(lines[i].substring(6, 8)) < 21) {
                            currentHarmony.push(lines[i].substring(4, 8));
                            if (!isNaN(lines[i].substring(11, 13)) && parseInt(lines[i].substring(11, 13)) >= 0 && parseInt(lines[i].substring(11, 13)) < 21) {
                                currentHarmony.push(lines[i].substring(9, 13));
                                if (!isNaN(lines[i].substring(16, 18)) && parseInt(lines[i].substring(16, 18)) >= 0 && parseInt(lines[i].substring(16, 18)) < 21) {
                                    currentHarmony.push(lines[i].substring(14, 18));
                                    if (!isNaN(lines[i].substring(21, 23)) && parseInt(lines[i].substring(21, 23)) >= 0 && parseInt(lines[i].substring(21, 23)) < 21) {
                                        currentHarmony.push(lines[i].substring(19, 23));
                                        if (!isNaN(lines[i].substring(26, 28)) && parseInt(lines[i].substring(26, 28)) >= 0 && parseInt(lines[i].substring(26, 28)) < 21) {
                                            currentHarmony.push(lines[i].substring(24, 28));
                                        }
                                        else {
                                            isFileCorrect = false;
                                        }
                                    }
                                    else {
                                        isFileCorrect = false;
                                    }
                                }
                                else {
                                    isFileCorrect = false;
                                }
                            }
                            else {
                                isFileCorrect = false;
                            }
                        }
                        else {
                            isFileCorrect = false;
                        }
                    }
                    else {
                        isFileCorrect = false;
                    }
                    break;
                // 6 strings
                case 33:
                    // Check note length
                    if (!isNaN(lines[i].substring(1, 3)) && parseInt(lines[i].substring(1, 3)) > 0) {
                        currentHarmony.push(lines[i].substring(0, 3));
                        // Check fret numbers
                        if (!isNaN(lines[i].substring(6, 8)) && parseInt(lines[i].substring(6, 8)) >= 0 && parseInt(lines[i].substring(6, 8)) < 21) {
                            currentHarmony.push(lines[i].substring(4, 8));
                            if (!isNaN(lines[i].substring(11, 13)) && parseInt(lines[i].substring(11, 13)) >= 0 && parseInt(lines[i].substring(11, 13)) < 21) {
                                currentHarmony.push(lines[i].substring(9, 13));
                                if (!isNaN(lines[i].substring(16, 18)) && parseInt(lines[i].substring(16, 18)) >= 0 && parseInt(lines[i].substring(16, 18)) < 21) {
                                    currentHarmony.push(lines[i].substring(14, 18));
                                    if (!isNaN(lines[i].substring(21, 23)) && parseInt(lines[i].substring(21, 23)) >= 0 && parseInt(lines[i].substring(21, 23)) < 21) {
                                        currentHarmony.push(lines[i].substring(19, 23));
                                        if (!isNaN(lines[i].substring(26, 28)) && parseInt(lines[i].substring(26, 28)) >= 0 && parseInt(lines[i].substring(26, 28)) < 21) {
                                            currentHarmony.push(lines[i].substring(24, 28));
                                            if (!isNaN(lines[i].substring(31, 33)) && parseInt(lines[i].substring(31, 33)) >= 0 && parseInt(lines[i].substring(31, 33)) < 21) {
                                                currentHarmony.push(lines[i].substring(29, 33));
                                            }
                                            else {
                                                isFileCorrect = false;
                                            }
                                        }
                                        else {
                                            isFileCorrect = false;
                                        }
                                    }
                                    else {
                                        isFileCorrect = false;
                                    }
                                }
                                else {
                                    isFileCorrect = false;
                                }
                            }
                            else {
                                isFileCorrect = false;
                            }
                        }
                        else {
                            isFileCorrect = false;
                        }
                    }
                    else {
                        isFileCorrect = false;
                    }
                    break;
                default:
                  isFileCorrect = false;
            }
            currentBar.push(currentHarmony);
        }
    }
    if (isFileCorrect) {
        parsed = true;
    }
}
// TODO: Zjistit jak to funguje, pripadne nahradit lepsi
function readTabsFile(file) {
    let text;
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                text = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    if (text) {
        return text;
    }
    isFileCorrect = false;
    throw "Soubor s taby nebyl nalezen.";
}

playBtnEl.addEventListener("click", function() {
    playAudio();
})

function playAudio () {
    let currentNoteAudio = new Audio();
    let currentNoteLength;
    let currentNoteTime;
    if (parsed) {
        for (let bar = 0; bar < tabsArray.length; bar++) {
            for (let harmony = 0; harmony < tabsArray[bar].length; harmony++) {
                switch (tabsArray[bar][harmony].length) {
                    // 1 string played at once
                    case 2:
                        currentNoteAudio.src = `sounds/${tabsArray[bar][harmony][1]}.wav`;
                        /*
                            Set note length in seconds
                            tempo/beat = How many bars are played in 1 minute (60 seconds)
                            60/(tempo/beat) = How many seconds is played 1 bar
                            (60/(tempo/beat))/toneLength = How many seconds is played the note
                        */
                        currentNoteLength = parseInt(tabsArray[bar][harmony][0].substring(1));
                        currentNoteTime = ((60/(tempo/beat))/currentNoteLength)*1000;
                        setTimeout(function() {
                            currentNoteAudio.play();

                            setTimeout(function(){
                                currentNoteAudio.pause();
                                currentNoteAudio.currentTime = 0;
                            }, currentNoteTime);
                        }, 0);
                        break;

                }
            }
        }
    }
}