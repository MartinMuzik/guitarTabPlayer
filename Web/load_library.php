<?php
$libraryFile = "library.txt?date=" . date("His"); // disable caching this file (by parameter date)
echo $libraryFile;
?>