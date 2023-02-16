const TABSHEET_CANVAS = document.getElementById("tabsheet-canvas");

let tabsheetWidth = document.body.clientWidth - 40; // min width is 1200px, max width is 1920px
const rowSpacing = 200;
const singleCharNoteSpacing = 40;
const doubleCharNoteSpacing = 50;
const borderNoteSpacing = 40;
const measureNumberSpacing = 3;
const minSpacing = 32;

// list of position of each note
// format: [measure[row, x1,..xn]]
let notePositions = [];
let playerPointerElement;
let isRendered = false;

window.onresize = resizeTabsheet;

function renderTabs(parsedTab) {
  let minimumMeasureWidths = generateMinimumMeasureWidths(parsedTab);
  let optimizedMeasureWidths = generateOptimizedMeasureWidths(minimumMeasureWidths);
  renderRows(optimizedMeasureWidths);
  renderFretNumbers(optimizedMeasureWidths, parsedTab);
  renderPointer();

  isRendered = true;
}

// generate minimum required width (fraction of tabsheetWidth) for each measure
// based on singleCharNoteSpacing, doubleCharNoteSpacing
// return minimumMeasureWidths array including fractions of tabsheetWidth
function generateMinimumMeasureWidths(parsedTab) {
  let minimumMeasureWidths = [];
  let currentMeasureWidth = 0;
  let lastNoteIncludedTwoChars = false;

  for (let i = 0; i < parsedTab.length; i++) {    // for each measure
    currentMeasureWidth += borderNoteSpacing;

    for (let j = 0; j < parsedTab[i].length; j++) {     // for each harmony
      if (j != 0) {
        if (lastNoteIncludedTwoChars) {
          currentMeasureWidth += doubleCharNoteSpacing;
          lastNoteIncludedTwoChars = false;
        } else {
          currentMeasureWidth += singleCharNoteSpacing;
        }
      }

      // fret numbers are only elements on positions 1 - parsedTab[i][j].length - 2
      for (let k = 1; k < (parsedTab[i][j].length - 2); k++) {    // for each element in harmony

        // check if harmony includes 2 char note or if it is rest (XXXX) and save it for counting next note
        if (parsedTab[i][j][k].charAt(2) != "0") {
          lastNoteIncludedTwoChars = true;
        }
      }
    }

    if (lastNoteIncludedTwoChars) {
      currentMeasureWidth += doubleCharNoteSpacing;
      lastNoteIncludedTwoChars = false;
    } else {
      currentMeasureWidth += singleCharNoteSpacing;
    }


    if (currentMeasureWidth < tabsheetWidth / 4) {
      minimumMeasureWidths.push(1 / 4);
    } else if (currentMeasureWidth < tabsheetWidth / 3) {
      minimumMeasureWidths.push(1 / 3);
    } else if (currentMeasureWidth < tabsheetWidth / 2) {
      minimumMeasureWidths.push(1 / 2);
    } else if (currentMeasureWidth < (tabsheetWidth / 4) * 3) {
      minimumMeasureWidths.push((1 / 4) * 3);
    } else {
      minimumMeasureWidths.push(1);
    }

    currentMeasureWidth = 0;
  }

  return minimumMeasureWidths;
}

// edit minimumMeasureWidths so every row is wide as full page
function generateOptimizedMeasureWidths(minimumMeasureWidths) {
  let finalWidths = [];
  let currentRow = [1/4]; // first row includes tuning and beat

  for (let i = 0; i < minimumMeasureWidths.length; i ++) {
    let currentRowSum = 0;
    currentRow.forEach(element => {
      currentRowSum += element;
    });

    if (currentRowSum + minimumMeasureWidths[i] < 1) {
      currentRow.push(minimumMeasureWidths[i]);
    } else if (currentRowSum + minimumMeasureWidths[i] == 1) {
      currentRow.push(minimumMeasureWidths[i]);
      if (finalWidths.length == 0) {
        currentRow.shift() // first "metadata" measure will be generated separately
      }
      finalWidths.push(currentRow);
      currentRow = [];
    } else {   // finish row with previous measure, start new row
      let lastMeasure = currentRow.pop();
      currentRow.push(1 - currentRowSum + lastMeasure);

      if (finalWidths.length == 0) {
        currentRow.shift() // first "metadata" measure will be generated separately
      }

      finalWidths.push(currentRow);
      currentRow = [];
      currentRow.push(minimumMeasureWidths[i]);
    }
  }
  if (currentRow.length > 0) {
    finalWidths.push(currentRow);
  }

  return finalWidths;
}

// render tuning and beat info, string lines, measure separators and measure numbers
function renderRows(measureWidths) {
  let rowsAmount = measureWidths.length;
  // set canvas height if larger than fullscreen page (due to footer)
  if ((25 + rowsAmount * rowSpacing) > 625) {
    TABSHEET_CANVAS.style.height = (25 + rowsAmount * rowSpacing) + "px"; // 25 is first line top padding
  }
  
  let htmlResult = "";

  // first special row
  // tuning and beat info
  htmlResult += `
                <text x="1" y="23">e</text>
                <text x="0.5" y="45">B</text>
                <text x="0" y="65">G</text>
                <text x="0.5" y="85">D</text>
                <text x="0.2" y="105">A</text>
                <text x="1.5" y="125">E</text>
                <text x="50" y="65" style="font-size:60px;font-weight:500">4</text>
                <text x="50" y="112" style="font-size:60px;font-weight:500">4</text>
  `;

  htmlResult += `
                <polyline points="17,18 ${tabsheetWidth},18 ${tabsheetWidth},118 17,118 17,18 17,38 ${tabsheetWidth},38 ${tabsheetWidth},58 17,58 17,78 ${tabsheetWidth},78 ${tabsheetWidth},98 17,98" style="fill:none;stroke:black;stroke-width:1"/>
                <line x1="${tabsheetWidth / 4}" y1="18" x2="${tabsheetWidth / 4}" y2="118" style="stroke:rgb(0, 0, 0);stroke-width:1"/>
  `;

  // render rest of rows
  let currentRow = 1;

  for(currentRow; currentRow < rowsAmount; currentRow++) {
    htmlResult += `
      <polyline points="1,${18 + currentRow * rowSpacing} ${tabsheetWidth},${18 + currentRow * rowSpacing} ${tabsheetWidth},
      ${118 + currentRow * rowSpacing} 1,${118 + currentRow * rowSpacing} 1,${18 + currentRow * rowSpacing} 1,
      ${38 + currentRow * rowSpacing} ${tabsheetWidth},${38 + currentRow * rowSpacing} ${tabsheetWidth},${58 + currentRow * rowSpacing} 1,
      ${58 + currentRow * rowSpacing} 1,${78 + currentRow * rowSpacing} ${tabsheetWidth},${78 + currentRow * rowSpacing} ${tabsheetWidth},
      ${98 + currentRow * rowSpacing} 1,${98 + currentRow * rowSpacing}" style="fill:none;stroke:black;stroke-width:1"/>
      `;
  }

  // render measure lines and numbers
  let lastX = 1;
  let measureNumber = 0;
  for (let i = 0; i < rowsAmount; i++) {
    for (let j = 0; j < measureWidths[i].length; j++) {
      measureNumber++;
      //first row
      if (i == 0 && j == 0) {
        lastX = tabsheetWidth / 4;
      }
      htmlResult += `<text x="${lastX + measureNumberSpacing}" y="${13 + i * rowSpacing}" fill="#FF3434">${measureNumber}</text>`;
      let newX = lastX + (tabsheetWidth * measureWidths[i][j]);
      htmlResult += `<line x1="${newX}" y1="${18 + i * rowSpacing}" x2="${newX}" y2="${118 + i * rowSpacing}" style="stroke:rgb(0, 0, 0);stroke-width:1"/>`;
      lastX = newX;
    }
    lastX = 0;
  }

  TABSHEET_CANVAS.innerHTML = htmlResult;
}

// render fret numbers
function renderFretNumbers(optimizedMeasureWidths, parsedTab) {
  let lastX = 0;
  let measureNumber = 0;
  let htmlResult = "";
  

  for (let i = 0; i < optimizedMeasureWidths.length; i++) {
    lastX = 0;

    for (let j = 0; j < optimizedMeasureWidths[i].length; j++) {
      if (i == 0 && j == 0) { // skip tuning info part 
        lastX = tabsheetWidth / 4;
      }

      measureNumber++;
      let fretNumbers = getFretNumbers(measureNumber, parsedTab);
      let currentMeasureWidth = optimizedMeasureWidths[i][j] * tabsheetWidth;
      let currentNoteSpacing = generateMeasureNoteSpacing(fretNumbers, currentMeasureWidth, i, lastX);
      let currentMeasureHtml = generateMeasureFrets(fretNumbers, currentNoteSpacing, i);
      
      lastX += optimizedMeasureWidths[i][j] * tabsheetWidth
      htmlResult += currentMeasureHtml;
    }
  }

  TABSHEET_CANVAS.innerHTML += htmlResult;

}

//return fret numbers in current measure, including string number
// element at [harmony][-3] is note length
// element at [harmony][-2] is boolean isDot
// element at [harmony][-1] is note length (fraction)
function getFretNumbers(measureNumber, tab) {
  let measureContent = tab[measureNumber - 1];
  let result = [];

  for (let i = 0; i < measureContent.length; i++) {
    let currentHarmony = [];

    // fret numbers are only elements on positions 1 - measureContent[i] - 2
    for (let j = 1; j < measureContent[i].length - 2; j++) {
      currentHarmony.push(measureContent[i][j]);
    }

    // get note length
    currentHarmony.push(measureContent[i][measureContent[i].length - 1]);
    // get isDot
    currentHarmony.push(measureContent[i][measureContent[i].length - 2]);
    // get note length fraction
    if (measureContent[i][measureContent[i].length - 2] == false) {  // if include dot
      currentHarmony.push( 1 / measureContent[i][measureContent[i].length - 1]);
    } else {
      currentHarmony.push( 1 / (measureContent[i][measureContent[i].length - 1]) * 1.5);
    }

    result.push(currentHarmony);
  }

  return result;
}


// return array of note X positions and push it also to global notePositions array including row
function generateMeasureNoteSpacing(fretNumbers, measureWidth, row, startPosition) {
  let currentMeasureSpacing = [];
  let currentMeasurePositions = []; // to be pushed to notePositions array
  let position = startPosition + borderNoteSpacing;
  let realMeasureWidth = measureWidth - 2 * borderNoteSpacing;
  let currentDifference = 0;

  currentMeasureSpacing.push(position);  // first note in measure position

  currentMeasurePositions.push(row);
  currentMeasurePositions.push([position, checkHarmonyDigits(fretNumbers[0])]);

  for (let i = 1; i < fretNumbers.length; i++) {

    currentDifference = (position + realMeasureWidth * fretNumbers[i - 1][fretNumbers[i - 1].length - 1]) - position;
    
    if (currentDifference >= minSpacing) {
      position += realMeasureWidth * fretNumbers[i - 1][fretNumbers[i - 1].length - 1];
    } else {
      position += minSpacing;
    }
    currentMeasureSpacing.push(position);
    currentMeasurePositions.push([position, checkHarmonyDigits(fretNumbers[i])]);
  }

  // push current row, positions to global notePositions array
  notePositions.push(currentMeasurePositions);

  return currentMeasureSpacing;
}

// return measure fret numbers, rests and note signs as html svg
function generateMeasureFrets(fretNumbers, noteSpacing, row) {
    let htmlResult = "";
    let currentX, harmony;


    for (let i = 0; i < fretNumbers.length; i++) {
      currentX = noteSpacing[i];
      harmony = fretNumbers[i];
      let twoDigitHarmony = false;

      let dotNeeded = false;
      if (harmony[harmony.length - 2] == true) {
        dotNeeded = true;
      }

      for (let j = 0; j < harmony.length - 3; j++) {
        if (harmony[j] == "XXXX") { // rest
          twoDigitHarmony = true;

          if (harmony[harmony.length - 3] == 1) { // whole rest
            htmlResult += `
            <rect x="${currentX}" y="${58 + 200 * row}" width="20" height="8" style="fill:black;"/>
          `;
          } else if (harmony[harmony.length - 3] == 2){ // half rest
            htmlResult += `
            <rect x="${currentX}" y="${70 + 200 * row}" width="20" height="8" style="fill:black;"/>
            `;
            if (dotNeeded) {
              htmlResult += `<circle cx="${currentX + 27}" cy="${200 * row + 74.5}" r="2" style="fill:black;stroke-width:0"/>`;
            }
          } else if (harmony[harmony.length - 3] == 4) { // quarter rest
            // scale and move it to required position by transform, original position is somewhere out of page
            htmlResult += `
            <path transform="translate(${currentX - 312}, ${-983 + 200 * row}) scale(1.8)" d="M 181.69909,588.76398 C 182.47362,589.08988 182.3797,590.46481 181.42371,589.80261 C 180.70644,588.91354 179.33831,588.14481 178.34093,589.11155 C 177.5139,589.8776 177.78694,591.27023 178.71609,591.81509 C 179.37044,591.94893 179.86732,593.05704 178.79518,592.642 C 177.25015,592.11543 175.60062,590.79176 175.7257,588.99985 C 175.70261,587.7787 176.9577,587.02175 178.07209,587.106 C 178.52013,586.94555 179.75824,587.58632 179.70251,587.30253 C 178.94921,586.14553 178.08957,585.05126 177.41509,583.84762 C 177.17661,583.12078 177.69942,582.42905 177.9199,581.7502 C 178.39967,580.55313 178.93636,579.37651 179.37409,578.16438 C 179.41525,577.41801 178.75249,576.88912 178.40914,576.2772 C 178.01153,575.64334 177.49169,575.07309 177.20209,574.38225 C 177.22225,573.50455 178.13012,574.48596 178.37637,574.84393 C 179.45036,576.11832 180.57945,577.34906 181.61509,578.65383 C 182.30749,579.4973 181.66158,580.48525 181.32581,581.32734 C 180.82735,582.58309 180.19033,583.79167 179.82409,585.09323 C 179.77639,586.1646 180.5603,587.05185 181.06346,587.94062 C 181.25685,588.22883 181.47282,588.50112 181.69909,588.76398 z "
            style="fill:black;"/>
            `;
            if (dotNeeded) {
              htmlResult += `<circle cx="${currentX + 20}" cy="${200 * row + 83}" r="2" style="fill:black;stroke-width:0"/>`;
            }
          } else if (harmony[harmony.length - 3] == 8) { // eighth rest
            // scale and move it to required position by transform, original position is somewhere out of page
            htmlResult += `
            <path transform="translate(${currentX - 1240}, ${-120 + 200 * row}) scale(2.35)" d="M 531.098,74.847 C 530.578,74.945 530.18,75.304 530,75.8 C 529.961,75.96 529.961,75.999 529.961,76.218 C 529.961,76.519 529.98,76.679 530.121,76.917 C 530.32,77.316 530.738,77.636 531.215,77.753 C 531.715,77.894 532.551,77.773 533.508,77.456 L 533.746,77.374 L 532.57,80.624 L 531.414,83.87 C 531.414,83.87 531.453,83.89 531.516,83.933 C 531.633,84.011 531.832,84.07 531.973,84.07 C 532.211,84.07 532.512,83.933 532.551,83.812 C 532.551,83.773 533.109,81.878 533.785,79.628 L 534.98,75.503 L 534.941,75.445 C 534.844,75.324 534.645,75.285 534.523,75.382 C 534.484,75.421 534.422,75.503 534.383,75.562 C 534.203,75.863 533.746,76.398 533.508,76.597 C 533.289,76.777 533.168,76.796 532.969,76.718 C 532.789,76.62 532.73,76.519 532.609,75.98 C 532.492,75.445 532.352,75.202 532.051,75.003 C 531.773,74.824 531.414,74.765 531.098,74.847 z "
            style="fill:black;"/>
            `;
            if (dotNeeded) {
              htmlResult += `<circle cx="${currentX + 18}" cy="${200 * row + 75}" r="2" style="fill:black;stroke-width:0"/>`;
            }
          } else if (harmony[harmony.length - 3] == 16) { // sixteenth rest
            // scale and move it to required position by transform, original position is somewhere out of page
            htmlResult += `
            <path transform="translate(${currentX - 1270}, ${-130 + 200 * row}) scale(2.35)" d="M 544.191,74.847 C 543.672,74.945 543.273,75.304 543.098,75.8 C 543.055,75.96 543.055,75.999 543.055,76.218 C 543.055,76.519 543.074,76.679 543.215,76.917 C 543.414,77.316 543.832,77.636 544.313,77.753 C 544.809,77.894 545.605,77.792 546.563,77.476 C 546.703,77.417 546.82,77.374 546.82,77.394 C 546.82,77.417 545.926,80.324 545.887,80.425 C 545.785,80.683 545.445,81.16 545.148,81.46 C 544.871,81.738 544.73,81.8 544.512,81.699 C 544.332,81.601 544.273,81.499 544.152,80.96 C 544.051,80.562 543.973,80.343 543.813,80.187 C 543.395,79.726 542.676,79.667 542.121,80.027 C 541.859,80.206 541.66,80.484 541.543,80.785 C 541.5,80.941 541.5,80.984 541.5,81.202 C 541.5,81.499 541.523,81.66 541.66,81.898 C 541.859,82.296 542.277,82.617 542.758,82.734 C 542.977,82.796 543.535,82.796 543.914,82.734 C 544.23,82.675 544.609,82.577 544.988,82.456 C 545.148,82.398 545.289,82.359 545.289,82.378 C 545.289,82.378 543.336,88.734 543.297,88.831 C 543.297,88.851 543.453,88.972 543.613,89.011 C 543.773,89.074 543.934,89.074 544.094,89.011 C 544.25,88.972 544.41,88.874 544.41,88.812 C 544.43,88.792 545.227,85.785 546.203,82.136 L 547.977,75.503 L 547.938,75.445 C 547.859,75.324 547.699,75.304 547.559,75.363 C 547.48,75.402 547.48,75.402 547.242,75.761 C 547.043,76.081 546.762,76.417 546.602,76.577 C 546.383,76.757 546.266,76.796 546.066,76.718 C 545.887,76.62 545.824,76.519 545.707,75.98 C 545.586,75.445 545.445,75.202 545.148,75.003 C 544.871,74.824 544.512,74.765 544.191,74.847 z "
            style="fill:black;"/>
            `;
            if (dotNeeded) {
              htmlResult += `<circle cx="${currentX + 15}" cy="${200 * row + 75}" r="2" style="fill:black;stroke-width:0"/>`;
            }
          } else if (harmony[harmony.length - 3] == 32) { // thirty-second rest
            // scale and move it to required position by transform, original position is somewhere out of page
            htmlResult += `
            <path transform="translate(${currentX - 1290}, ${-130 + 200 * row}) scale(2.35)" d="M 553.789,69.863 C 553.273,69.964 552.871,70.324 552.695,70.82 C 552.652,70.98 552.652,71.019 552.652,71.238 C 552.652,71.456 552.652,71.538 552.695,71.656 C 552.832,72.097 553.113,72.433 553.551,72.632 C 553.848,72.792 553.988,72.812 554.406,72.812 C 554.926,72.812 555.363,72.734 556.063,72.515 C 556.242,72.452 556.379,72.413 556.379,72.413 C 556.398,72.413 556.219,73.113 555.98,73.949 C 555.684,75.124 555.563,75.503 555.523,75.62 C 555.363,75.921 555.023,76.378 554.805,76.577 C 554.605,76.757 554.488,76.796 554.289,76.718 C 554.109,76.62 554.047,76.519 553.93,75.98 C 553.828,75.581 553.75,75.363 553.59,75.202 C 553.172,74.745 552.453,74.687 551.898,75.046 C 551.637,75.222 551.438,75.503 551.32,75.8 C 551.277,75.96 551.277,75.999 551.277,76.218 C 551.277,76.519 551.301,76.679 551.438,76.917 C 551.637,77.316 552.055,77.636 552.535,77.753 C 552.754,77.816 553.313,77.816 553.691,77.753 C 554.008,77.695 554.387,77.593 554.766,77.476 C 554.945,77.417 555.086,77.374 555.086,77.374 C 555.086,77.394 554.289,80.425 554.246,80.484 C 554.09,80.824 553.77,81.242 553.531,81.48 C 553.273,81.738 553.133,81.781 552.914,81.699 C 552.734,81.601 552.672,81.499 552.555,80.96 C 552.453,80.562 552.375,80.343 552.215,80.187 C 551.797,79.726 551.078,79.667 550.523,80.027 C 550.262,80.206 550.063,80.484 549.945,80.785 C 549.902,80.941 549.902,80.984 549.902,81.202 C 549.902,81.421 549.902,81.499 549.945,81.62 C 550.082,82.058 550.363,82.398 550.801,82.597 C 551.121,82.757 551.238,82.777 551.676,82.777 C 551.996,82.777 552.098,82.777 552.355,82.734 C 552.715,82.675 553.094,82.558 553.512,82.437 L 553.77,82.335 L 553.77,82.398 C 553.75,82.476 552.074,88.773 552.055,88.812 C 552.035,88.894 552.395,89.05 552.613,89.05 C 552.832,89.05 553.152,88.913 553.172,88.812 C 553.191,88.792 554.148,84.667 555.344,79.648 C 557.477,70.562 557.477,70.542 557.438,70.48 C 557.375,70.402 557.277,70.363 557.156,70.363 C 557.016,70.382 556.957,70.441 556.816,70.679 C 556.539,71.16 556.219,71.577 556.043,71.718 C 555.922,71.796 555.82,71.796 555.664,71.738 C 555.484,71.636 555.422,71.538 555.305,70.999 C 555.184,70.46 555.043,70.222 554.746,70.023 C 554.469,69.843 554.109,69.785 553.789,69.863 z "
            style="fill:black;"/>
            `;
            if (dotNeeded) {
              htmlResult += `<circle cx="${currentX + 15}" cy="${200 * row + 75}" r="2" style="fill:black;stroke-width:0"/>`;
            }
          }

        } else if (harmony[j].charAt(2) != "0") {
          twoDigitHarmony = true;
          htmlResult += `
            <rect x="${currentX - 3}" y="${(harmony[j].charAt(0) - 1) * 20 + 25 + 200 * row - 11}" width="26" height="10" style="fill:white;"/>
            <text x="${currentX}" y="${(harmony[j].charAt(0) - 1) * 20 + 25 + 200 * row}">${harmony[j].charAt(2) + harmony[j].charAt(3)}</text>
          `;
        } else {
          htmlResult += `
          <rect x="${currentX - 3}" y="${(harmony[j].charAt(0) - 1) * 20 + 25 + 200 * row - 11}" width="18" height="10" style="fill:white;"/>
          <text x="${currentX}" y="${(harmony[j].charAt(0) - 1) * 20 + 25 + 200 * row}">${harmony[j].charAt(3)}</text>
        `;
        }
      }

      let digitIncrement = 6;
      if (twoDigitHarmony) {
        digitIncrement = 12;
      }

      // add dot if needed
      if (dotNeeded) {
        htmlResult += `<circle cx="${currentX + digitIncrement + 8}" cy="${200 * row + 168}" r="2" style="fill:black;stroke-width:0"/>`;
      }

      // whole note has no sign, half note has half line sign, quarter note has full line sign
      // eighth note has 1 rect, sexteenth note has 2 rects, thirty-second has 3 rects
      // if is next note same -> connect signs
      if (harmony[harmony.length - 3] == 2) {
        htmlResult += `<line x1="${currentX + digitIncrement}" y1="${200 * row + 155}" x2="${currentX + digitIncrement}" y2="${200 * row + 170}" style="stroke:black;stroke-width:1"/>`;
      } else if (harmony[harmony.length - 3] == 4) {
        htmlResult += `<line x1="${currentX + digitIncrement}" y1="${200 * row + 140}" x2="${currentX + digitIncrement}" y2="${200 * row + 170}" style="stroke:black;stroke-width:1"/>`;
      } else if (harmony[harmony.length - 3] == 8) {
        htmlResult += `<line x1="${currentX + digitIncrement}" y1="${200 * row + 140}" x2="${currentX + digitIncrement}" y2="${200 * row + 170}" style="stroke:black;stroke-width:1"/>`;
        if (i < fretNumbers.length - 1 && fretNumbers[i + 1][fretNumbers[i + 1].length - 3] == 8 && !dotNeeded && fretNumbers[i + 1][fretNumbers[i + 1].length - 2] == false) { // right neighbour same
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 166}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          if (i - 1 >= 0 && fretNumbers[i - 1][fretNumbers[i - 1].length - 3] == 8 && !dotNeeded) { // left neighbour also same
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
          }
        } else {  // right neighbour different
          htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
        }
      } else if (harmony[harmony.length - 3] == 16) {
        htmlResult += `<line x1="${currentX + digitIncrement}" y1="${200 * row + 140}" x2="${currentX + digitIncrement}" y2="${200 * row + 170}" style="stroke:black;stroke-width:1"/>`;
        if (i < fretNumbers.length - 1 && fretNumbers[i + 1][fretNumbers[i + 1].length - 3] == 16 && !dotNeeded && fretNumbers[i + 1][fretNumbers[i + 1].length - 2] == false) { // right neighbour same
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 166}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 160}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          if (i - 1 >= 0 && fretNumbers[i - 1][fretNumbers[i - 1].length - 3] == 16 && !dotNeeded) { // left neighbour also same
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 160}" width="10" height="4" style="fill:black;"/>`;
          }
        } else {  // right neighbour different
          htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
          htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 160}" width="10" height="4" style="fill:black;"/>`;
        }
      } else if (harmony[harmony.length - 3] == 32) {
        htmlResult += `<line x1="${currentX + digitIncrement}" y1="${200 * row + 140}" x2="${currentX + digitIncrement}" y2="${200 * row + 170}" style="stroke:black;stroke-width:1"/>`;
        if (i < fretNumbers.length - 1 && fretNumbers[i + 1][fretNumbers[i + 1].length - 3] == 32 && !dotNeeded && fretNumbers[i + 1][fretNumbers[i + 1].length - 2] == false) { // right neighbour same
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 166}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 160}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 154}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          if (i - 1 >= 0 && fretNumbers[i - 1][fretNumbers[i - 1].length - 3] == 32 && !dotNeeded) { // left neighbour also same
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 160}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 154}" width="10" height="4" style="fill:black;"/>`;
          }
        } else {  // right neighbour different
          htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
          htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 160}" width="10" height="4" style="fill:black;"/>`;
          htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 154}" width="10" height="4" style="fill:black;"/>`;
        }
      }
    }

    return htmlResult;
}

function renderPointer() {
  // pointer at start
  if (notePositions[0][1][1] == false) {
    TABSHEET_CANVAS.innerHTML += `<rect x="${tabsheetWidth / 4 + borderNoteSpacing + 4}" y="5" width="3" height="126" id="player-pointer" style="fill:#FF3434"/>`;
  } else {
    TABSHEET_CANVAS.innerHTML += `<rect x="${tabsheetWidth / 4 + borderNoteSpacing + 10}" y="5" width="3" height="126" id="player-pointer" opacity="0.75" style="fill:#FF3434"/>`;
  }

  playerPointerElement = document.getElementById("player-pointer");
}
function movePointer(measure, harmony) {
  let newX;
  let newY = notePositions[measure][0] * 200 + 5;

  if (notePositions[measure][harmony + 1][1] == false) {
    newX = notePositions[measure][harmony + 1][0] + 4;
  } else {
    newX = notePositions[measure][harmony + 1][0] + 10;
  }

  playerPointerElement.setAttribute("x", newX);
  playerPointerElement.setAttribute("y", newY);
}

function checkHarmonyDigits(harmony) {
  for(let i = 0; i < harmony.length - 3; i++) {
    if (harmony[i].charAt(2) != "0") {
      return true;
    }
  }

  return false;
}

function resizeTabsheet() {
  if (isRendered && !isPlaying) {
    notePositions = [];
    tabsheetWidth = document.body.clientWidth - 40;
    renderTabs(parsedTab);
  }
}