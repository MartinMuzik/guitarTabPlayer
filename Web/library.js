const LIBRARY_TABLE = document.getElementById("library-table");

let libraryContent;

loadLibrary();

function loadLibrary() {
  libraryContent = readFile("library.txt?date=" + Date.now()); // disable caching this file (by parameter date)

  if (libraryContent) {
    let displayNames = getDisplayNames(libraryContent);
    let htmlLibrary = generateHtmlLibrary(displayNames);
    LIBRARY_TABLE.innerHTML += htmlLibrary;
  } else {
    alert("Soubor s knihovnou tabulatur nebyl nalezen nebo je poškozen.");
  }
}

// Read text file with XHR
function readFile(file) {
  let fileContent;
  let rawFile = new XMLHttpRequest();

  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if(rawFile.readyState === 4) {
      if(rawFile.status === 200 || rawFile.status == 0) {
        fileContent = rawFile.responseText;
      }
    }
  }

  rawFile.send(null);
  return fileContent;
}

function getDisplayNames(library) {
  let lines = library.split("\r\n");
  let displayNames = [];

  for (let i = 1; i < lines.length; i += 2) {
    displayNames.push(lines[i]);
  }

  return displayNames;
}

function generateHtmlLibrary(library) {
  let result = "";

  for (let i = 0; i < library.length; i++) {
    result += `<tr class="library-tab">`;
    result += `<td>${library[i]}</td>`;
    result += `<td><button class="library-btn" title="Přejmenovat" onclick="rename('${library[i]}')"><i class="fa fa-pencil"></i></td>`;
    result += `<td><button class="library-btn" title="Nahrát nový tab" onclick="uploadNew('${library[i]}')"><i class="fa fa-upload"></i></td>`;
    result += `<td><button class="library-btn" title="Smazat" onclick="remove('${library[i]}')"><i class="fa fa-times"></i></td>`;
    result += `</tr>`;
  }

  return result;
}


function rename(tabName) {
  console.log("rename " + tabName);
  console.log(libraryContent);
}

function uploadNew(tabName) {
  console.log("uploadNew " + tabName);
}

function remove(tabName) {
  console.log("remove " + tabName);
}