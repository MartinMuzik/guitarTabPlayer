<?php
session_start();
if($_SESSION["loggedAs"] == "admin") {
    echo 1;
} else {
    echo 0;
}
?>