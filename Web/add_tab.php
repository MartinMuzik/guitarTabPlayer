<?php
$tabContent = $_POST['tab'];
$displayName = $_POST['displayName'];
$fileName = $_POST['fileName'];

$libraryfile = "library.txt";
$toWrite = "\r\n" . $fileName . "\r\n" . $displayName;

//create new tab file
if(!empty($_POST['tab'])){
$file = fopen("tabs/" . $fileName . ".txt", "w");
fwrite($file, $tabContent);
fclose($file);
}

// write values to library.txt
// flag FILE_APPEND - to append the content to the end of the file
// flag LOCK_EX -  to prevent other scripts to write to the file while we are writing
file_put_contents($libraryfile , $toWrite, FILE_APPEND | LOCK_EX);

echo "Tab byl úspěšně přidán.";
?>