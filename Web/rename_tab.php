<?php
$tabName = $_POST['tabName'];
$newName = $_POST['newName'];

if(!empty($tabName) && !empty($newName)) {
    $libraryFile = fopen("library.txt", "r") or die("Unable to open file!");
    $fileContent = fread($libraryFile, filesize("library.txt"));
    fclose($libraryFile);

    $lines = explode("\r\n", $fileContent);
    $isFound = false;
    $i = 0;
    
    while ($isFound == false || $i > count($lines)) {
        if ($lines[$i] == $tabName) {
            $isFound = true;
            $lines[$i] = $newName;
        }
        $i++;
    }

    $newLibrary = "";
    for ($i = 0; $i < count($lines); $i++) {
        if ($i < count($lines) - 1) {
            $newLibrary .= $lines[$i] . "\r\n";
        } else {
            $newLibrary .= $lines[$i];
        }
    }

    $libraryFile = fopen("library.txt", "w") or die("Unable to open file!");
    fwrite($libraryFile, $newLibrary);
    fclose($libraryFile);
}
?>