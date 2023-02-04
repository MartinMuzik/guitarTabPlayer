<?php
$tabFileName = $_POST['tabFileName'];
$tabName = $_POST['tabName'];

if(!empty($tabName) && !empty($tabFileName)) {
    //remove tab file
    unlink("tabs/" . $tabFileName . ".txt");

    // remove tab reference from library.txt

    $libraryFile = fopen("library.txt", "r") or die("Unable to open file!");
    $fileContent = fread($libraryFile, filesize("library.txt"));
    fclose($libraryFile);

    $lines = explode("\r\n", $fileContent);
    $isFound = false;
    $i = 0;
    
    while ($isFound == false || $i >= count($lines)) {
        if ($lines[$i] == $tabFileName) {
            $isFound = true;
            $lines[$i] = "";
            $lines[$i + 1] = ""; // remove tabName also
        }
        $i++;
    }

    $newArray = [];
    foreach ($lines as $line) {
        if ($line != "") {
            array_push($newArray, $line);
        }
    }

    $newLibrary = "";
    for ($i = 0; $i < count($newArray); $i++) {
        if ($i < count($newArray) - 1) {
            $newLibrary .= $newArray[$i] . "\r\n";
        } else {
            $newLibrary .= $newArray[$i];
        }
    }

    $libraryFile = fopen("library.txt", "w") or die("Unable to open file!");
    fwrite($libraryFile, $newLibrary);
    fclose($libraryFile);
}
?>