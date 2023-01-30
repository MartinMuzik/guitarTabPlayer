const UPLOAD_TAB_ELEMENT = document.getElementById("upload-tab-btn");
const UPLOAD_TAB_LABEL = document.getElementById("upload-tab-label");
const DISPLAY_NAME_ELEMENT = document.getElementById("display-name-input");
const FILE_NAME_ELEMENT = document.getElementById("file-name-input");
const ADD_BTN = document.getElementById("add-btn");
const CHECK_BTN = document.getElementById("check-tab-btn");
//const ADD_ERROR_LABEL = document.getElementById("tab-adding-error");

let tabContent;
let artist;
let songName; 
let usedDisplayNames = [];
let usedFileNames = [];
let isError = false;

ADD_BTN.setAttribute("disabled", "disabled");
CHECK_BTN.setAttribute("disabled", "disabled");
getUsedNames();


UPLOAD_TAB_ELEMENT.addEventListener("change", handleFile, false);
function handleFile() {
  UPLOAD_TAB_LABEL.innerText = "Změnit soubor";
  isError = false;
  parseUploadedFile(this.files[0]);
  ADD_BTN.removeAttribute("disabled");
  CHECK_BTN.removeAttribute("disabled");
}

ADD_BTN.addEventListener("click", function() {
  addTab();
});

CHECK_BTN.addEventListener("click", function() {
  validateTabFile();
  console.log("Is error: " + isError);
  setNames();
});

function addTab() {
  validateTabFile();
  validateDisplayName();
  validateFileName();

  if(!isError) {
    $.ajax({
      method: "POST",
      url: "add_tab.php",
      data: { tab: tabContent,
              displayName: DISPLAY_NAME_ELEMENT.value,
              fileName: FILE_NAME_ELEMENT.value
            }
    })
      .done(function( response ) {
        //$(ADD_ERROR_LABEL).html(response);
        alert(response);
      });
  }
}

function validateFileName() {
  let isFound = false;

  for (let i = 0; i < usedFileNames.length; i++) {
    if (FILE_NAME_ELEMENT.value == usedFileNames[i]) {
      isFound = true;
      isError = true;
    }
  }

  if (isFound) {
    alert("Soubor se stejným názvem již existuje");
  }
}

function validateDisplayName() {
  let isFound = false;
  
  for (let i = 0; i < usedDisplayNames.length; i++) {
    if (DISPLAY_NAME_ELEMENT.value == usedDisplayNames[i]) {
        isFound = true;
        isError = true;
    }
  }

  if (isFound) {
    alert("Tab se stejným názvem již existuje");
  }
}

// check tab validity by some conditions, not 100% accurate
function validateTabFile() {
  let tabs = tabContent.split("\r\n");
  let isValid = true;

  if (tabs.length < 4) {
    isValid = false;
  }

  for (let i = 0; i < tabs.length; i++) {
    if(i < 3) {
      if(i == 2) {
        if (isNaN(tabs[i]) || parseInt(tabs[i]) < 40 || parseInt(tabs[i]) > 240) {
          isValid = false;
        }
      }
    } else {
      // Check validity by each line length
      switch(tabs[i].length) {
        case 1:
          if (tabs[i] != "|") isValid = false;
          break;
        case 8: // 1 string
          break;
        case 13: // 2 strings
          break;
        case 18: // 3 strings
          break;
        case 23: // 4 strings
          break;
        case 28: // 5 strings
          break;
        case 33: // 6 strings
          break;
        default:
          isValid = false;
          break;
      }
    }
  }
  if (!isValid) {
    isError = true;
  }
}

function getUsedNames() {
  let library;

  try {
    library = readLibraryFileAdmin();
  } catch(e) {
    alert(e);
  }

  usedDisplayNames = getDisplayNames(library);
  usedFileNames = getFileNames(library);
}

function readLibraryFileAdmin() {
  let fileContent = readFile("library.txt");

  if (fileContent) {
    return fileContent;
  }

  throw "Soubor s knihovnou tabulatur nebyl nalezen nebo je poškozen.";
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

function getDisplayNames(fileContent) {
  let lines = fileContent.split("\r\n");
  let displayNames = [];

  for (let i = 1; i < lines.length; i += 2) {
    displayNames.push(lines[i]);
  }

  return displayNames;
}
  
function getFileNames(fileContent) {
  let lines = fileContent.split("\r\n");
  let fileNames = [];

  for (let i = 0; i < lines.length - 1; i += 2) {
    fileNames.push(lines[i]);
  }

  return fileNames;
}

function parseUploadedFile(file) {
  // Check if the file is an text.
  if (file.type && !file.type.startsWith('text/plain')) {
    alert("Nahraný soubor je špatného formátu");
    isError = true;
  } else {
    let fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
      tabContent = fileLoadedEvent.target.result;
    };
    fileReader.readAsText(file, "UTF-8");
  }
}

// set recommended unique display and file name 
function setNames() {
  let isSet = false;
  let tabs = tabContent.split("\r\n");
  let currentDisplayName = tabs[0] + " - " + tabs[1];
  let currentFileName;
  let displaySuffix = 0;
  let fileSuffix = 0;

  // set display name
  while (!isSet) {
    let exists = false;

    for (let i = 0; i < usedDisplayNames.length; i++) {
      if (currentDisplayName == usedDisplayNames[i]) {
          exists = true;
      }
    }

    if (exists) {
      if (displaySuffix < 0) {
        currentDisplayName = currentDisplayName.slice(0, -1) + displaySuffix;
        displaySuffix++;
      } else {
        currentDisplayName += " #2";
        displaySuffix = 2;
      }
    } else {
      DISPLAY_NAME_ELEMENT.value = currentDisplayName;
      isSet = true;
    }
  }

  // set file name
  isSet = false;

  currentFileName = (tabs[0].replaceAll(" ", "_") + "-" + tabs[1].replaceAll(" ", "_")).toLowerCase();

  while (!isSet) {
    let exists = false;

    if (displaySuffix > 0) {
      currentFileName += "_" + displaySuffix;
    }

    for (let i = 0; i < usedFileNames.length; i++) {
      if (currentFileName == usedFileNames[i]) {
          exists = true;
      }
    }

    if (exists) {
      if (fileSuffix < 0) {
        currentFileName = currentFileName.slice(0, -1) + fileSuffix;
        fileSuffix++;
      } else {
        currentFileName += "_2";
        fileSuffix = 2;
      }
    } else {
      FILE_NAME_ELEMENT.value = currentFileName;
      isSet = true;
    }
  }


}