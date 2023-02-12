const TABSHEET_CANVAS = document.getElementById("tabsheet-canvas");
// TODO: nastavit height, prvni radek special - prvni takt az po jedne ctvrtine (nejdriv ladeni, takt 4/4)

let tabsheetWidth = 1870;
let rowSpacing = 200;
let singleCharNoteSpacing = 40;
let doubleCharNoteSpacing = 50;
let borderNoteSpacing = 40;
let measureNumberSpacing = 3;

function renderTabs(parsedTab) {
  let minimumMeasureWidths = generateMinimumMeasureWidths(parsedTab);
  let optimizedMeasureWidths = generateOptimizedMeasureWidths(minimumMeasureWidths);

  renderRows(optimizedMeasureWidths);

  console.log(parsedTab);
  console.log(minimumMeasureWidths);
  console.log(optimizedMeasureWidths);
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
      console.log("Measure: " + i + " <");
      currentRow.push(minimumMeasureWidths[i]);
    } else if (currentRowSum + minimumMeasureWidths[i] == 1) {
      currentRow.push(minimumMeasureWidths[i]);
      console.log("Measure: " + i + " ==");
      if (finalWidths.length == 0) {
        currentRow.shift() // first "metadata" measure will be generated separately
      }
      finalWidths.push(currentRow);
      currentRow = [];
    } else {   // finish row with previous measure, start new row
      console.log("Measure: " + i + " >");
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