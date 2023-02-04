const LIBRARY_TABLE = document.getElementById("library-table");

let libraryContent;

loadLibrary();

function loadLibrary() {
  libraryContent = readFile("library.txt?date=" + Date.now()); // disable caching this file (by parameter date)

  if (libraryContent) {
    let displayNames = getDisplayNames(libraryContent);
    let fileNames = getFileNames(libraryContent);
    let htmlLibrary = generateHtmlLibrary(displayNames, fileNames);
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

function getFileNames(library) {
  let lines = library.split("\r\n");
  let fileNames = [];

  for (let i = 0; i < lines.length ; i += 2) {
    fileNames.push(lines[i]);
  }

  return fileNames;
}

function generateHtmlLibrary(displayNames, fileNames) {
  let result = `
               <tr>
                 <th id="display-name-column"></th>
                 <th></th>
                 <th></th>
                 <th></th>
               </tr>
               `;

  for (let i = 0; i < displayNames.length; i++) {
    result += `<tr class="library-tab">`;
    result += `<td>${displayNames[i]}</td>`;
    result += `<td><button class="library-btn" title="Přejmenovat" onclick="rename('${displayNames[i]}')"><i class="fa fa-pencil"></i></td>`;
    result += `<td><a class="library-download-tab" href="tabs/${fileNames[i]}.txt" download="${fileNames[i]}"><button class="library-btn" title="Stáhnout"><i class="fa fa-download"></i></a></td>`;
    result += `<td><button class="library-btn" title="Smazat" onclick="remove('${displayNames[i]}')"><i class="fa fa-times"></i></td>`;
    result += `</tr>`;
  }

  return result;
}


function rename(tabName) {
  let input = prompt("Zvolte nový název tabu: ");
  if (input != null) {
    if (input == "") {
      alert("Název nesmí zůstat prázdný!");
    } else if (checkNewDisplayName(input.trim())) {
      renameDisplayName(tabName, input.trim());

      if (confirm("Název byl úspěšně změněn.")) {
        document.location.reload();
      }

    } else {
      alert("Tento název již existuje!");
    }
  }
}

function checkNewDisplayName(input) {
  displayNames = getDisplayNames(libraryContent);
  let isUnique = true;

  for (let i = 0; i < displayNames.length; i++) {
    if (displayNames[i] == input) {
      isUnique = false;
    }
  }

  return isUnique;
}

function renameDisplayName(tabName, newName) {
  $.ajax({
    method: "POST",
    url: "rename_tab.php",
    data: { tabName: tabName,
            newName: newName
          }
  })
}

function remove(tabName) {
  let fileNames = getFileNames(libraryContent);
  let displayNames = getDisplayNames(libraryContent);
  let tabFileName;

  for (let i = 0; i < displayNames.length; i++) {
    if (displayNames[i] == tabName) {
      tabFileName = fileNames[i];
    }
  }

  if (tabFileName) {
    removeTab(tabFileName, tabName);
    if (confirm("Tab byl úspěšně odstraněn.")) {
      document.location.reload();
    }
  }
}

function removeTab(tabFileName, tabName) {
  $.ajax({
    method: "POST",
    url: "remove_tab.php",
    data: { tabFileName: tabFileName,
            tabName: tabName
          }
  })
}
