const TABSHEET_CANVAS = document.getElementById("tabsheet-canvas");
// TODO: responzivni na zaklade tabsheetWidth

let tabsheetWidth = 1870;
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

function renderTabs(parsedTab) {
  let minimumMeasureWidths = generateMinimumMeasureWidths(parsedTab);
  let optimizedMeasureWidths = generateOptimizedMeasureWidths(minimumMeasureWidths);
  renderRows(optimizedMeasureWidths);
  renderFretNumbers(optimizedMeasureWidths, parsedTab);
  renderPointer();
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
  if ((25 + rowsAmount * rowSpacing) > 620) {
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
                <polyline points="17,18 1870,18 1870,118 17,118 17,18 17,38 1870,38 1870,58 17,58 17,78 1870,78 1870,98 17,98" style="fill:none;stroke:black;stroke-width:1"/>
                <line x1="467.5" y1="18" x2="467.5" y2="118" style="stroke:rgb(0, 0, 0);stroke-width:1"/>
  `;

  // render rest of rows
  let currentRow = 1;

  for(currentRow; currentRow < rowsAmount; currentRow++) {
    htmlResult += `
      <polyline points="1,${18 + currentRow * rowSpacing} 1870,${18 + currentRow * rowSpacing} 1870,
      ${118 + currentRow * rowSpacing} 1,${118 + currentRow * rowSpacing} 1,${18 + currentRow * rowSpacing} 1,
      ${38 + currentRow * rowSpacing} 1870,${38 + currentRow * rowSpacing} 1870,${58 + currentRow * rowSpacing} 1,
      ${58 + currentRow * rowSpacing} 1,${78 + currentRow * rowSpacing} 1870,${78 + currentRow * rowSpacing} 1870,
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
        lastX = 467.5;
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
        lastX = 467.5;
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

// return measure fret numbers and note signs as html svg
function generateMeasureFrets(fretNumbers, noteSpacing, row) {
    let htmlResult = "";
    let currentX, harmony;


    for (let i = 0; i < fretNumbers.length; i++) {
      currentX = noteSpacing[i];
      harmony = fretNumbers[i];
      let twoDigitHarmony = false;

      for (let j = 0; j < harmony.length - 3; j++) {
        if (harmony[j] == "XXXX") {
          // TODO finish
          twoDigitHarmony = true;
          htmlResult += `
            <rect x="${currentX - 3}" y="${58 + 200 * row}" width="20" height="8" style="fill:black;"/>
          `;
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
      let dotNeeded = false;
      if (harmony[harmony.length - 2] == true) {
        dotNeeded = true;
        htmlResult += `<circle cx="${currentX + digitIncrement + 8}" cy="${200 * row + 168}" r="2" style="fill:black;stroke-width:0"/>`;
      }

      // TODO odstranit redundanci

      // whole note has no sign, half note has half line sign, quarter note has full line sign
      // eighth note has 1 rect, sexteenth note has 2 rects, thirty-second has 3 rects
      // if is next note same -> connect signs
      if (harmony[harmony.length - 3] == 2) {
        htmlResult += `<line x1="${currentX + digitIncrement}" y1="${200 * row + 155}" x2="${currentX + digitIncrement}" y2="${200 * row + 170}" style="stroke:black;stroke-width:1"/>`;
      } else if (harmony[harmony.length - 3] == 4) {
        htmlResult += `<line x1="${currentX + digitIncrement}" y1="${200 * row + 140}" x2="${currentX + digitIncrement}" y2="${200 * row + 170}" style="stroke:black;stroke-width:1"/>`;
      } else if (harmony[harmony.length - 3] == 8) {
        htmlResult += `<line x1="${currentX + digitIncrement}" y1="${200 * row + 140}" x2="${currentX + digitIncrement}" y2="${200 * row + 170}" style="stroke:black;stroke-width:1"/>`;
        if (i < fretNumbers.length - 1 && fretNumbers[i + 1][fretNumbers[i + 1].length - 3] == 8 && !dotNeeded) { // right neighbour same
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 166}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          if (i - 1 >= 0 && fretNumbers[i - 1][fretNumbers[i - 1].length - 3] == 8 && !dotNeeded) { // left neighbour also same
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
          }
        } else {
          if (i - 1 >= 0 && fretNumbers[i - 1][fretNumbers[i - 1].length - 3] == 8 && !dotNeeded) { // same only left neighbour
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
          } else { // no same neighbour
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
          }
        }
      } else if (harmony[harmony.length - 3] == 16) {
        htmlResult += `<line x1="${currentX + digitIncrement}" y1="${200 * row + 140}" x2="${currentX + digitIncrement}" y2="${200 * row + 170}" style="stroke:black;stroke-width:1"/>`;
        if (i < fretNumbers.length - 1 && fretNumbers[i + 1][fretNumbers[i + 1].length - 3] == 16 && !dotNeeded) { // right neighbour same
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 166}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 160}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          if (i - 1 >= 0 && fretNumbers[i - 1][fretNumbers[i - 1].length - 3] == 16 && !dotNeeded) { // left neighbour also same
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 160}" width="10" height="4" style="fill:black;"/>`;
          }
        } else {
          if (i - 1 >= 0 && fretNumbers[i - 1][fretNumbers[i - 1].length - 3] == 16 && !dotNeeded) { // same only left neighbour
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 160}" width="10" height="4" style="fill:black;"/>`;
          } else { // no same neighbour
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 160}" width="10" height="4" style="fill:black;"/>`;
          }
        }
      } else if (harmony[harmony.length - 3] == 32) {
        htmlResult += `<line x1="${currentX + digitIncrement}" y1="${200 * row + 140}" x2="${currentX + digitIncrement}" y2="${200 * row + 170}" style="stroke:black;stroke-width:1"/>`;
        if (i < fretNumbers.length - 1 && fretNumbers[i + 1][fretNumbers[i + 1].length - 3] == 32 && !dotNeeded) { // right neighbour same
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 166}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 160}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          htmlResult += `<rect x="${currentX + digitIncrement}" y="${200 * row + 154}" width="${noteSpacing[i + 1] + - (currentX + digitIncrement) + 2}" height="4" style="fill:black;"/>`;
          if (i - 1 >= 0 && fretNumbers[i - 1][fretNumbers[i - 1].length - 3] == 32 && !dotNeeded) { // left neighbour also same
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 160}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 154}" width="10" height="4" style="fill:black;"/>`;
          }
        } else {
          if (i - 1 >= 0 && fretNumbers[i - 1][fretNumbers[i - 1].length - 3] == 32 && !dotNeeded) { // same only left neighbour
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 160}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 154}" width="10" height="4" style="fill:black;"/>`;
          } else { // no same neighbour
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 166}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 160}" width="10" height="4" style="fill:black;"/>`;
            htmlResult += `<rect x="${currentX + digitIncrement - 10}" y="${200 * row + 154}" width="10" height="4" style="fill:black;"/>`;
          }
        }
      }
    }

    return htmlResult;
}

function renderPointer() {
  // pointer at start
  //TABSHEET_CANVAS.innerHTML += `<rect x="502.5" y="5" width="20" height="126" rx="10" opacity="0.5" style="fill:#b50000;"/>`;
  if (notePositions[0][1][1] == false) {
    TABSHEET_CANVAS.innerHTML += `<rect x="${tabsheetWidth / 4 + borderNoteSpacing + 4}" y="5" width="3" height="126" id="player-pointer" style="fill:#FF3434"/>`;
  } else {
    TABSHEET_CANVAS.innerHTML += `<rect x="${tabsheetWidth / 4 + borderNoteSpacing + 10}" y="5" width="3" height="126" id="player-pointer" style="fill:#FF3434"/>`;
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