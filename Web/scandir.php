<?php
$dirContent = scandir("tabs/");
if ($dirContent === false) {
    echo "false";
} else {
    $result = implode($dirContent);
    echo $result;
}
?>