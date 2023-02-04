<?php
$enteredName = test_input($_POST['name']);
$enteredPassword = test_input($_POST['password']);

$correctNameHash = '$2y$10$BLuwnB5cH3lYDU9ivnEN2O3skwu8klZjr2./b/zsflZwG/wqAjHuK';
$correctPasswordHash = '$2y$10$VYjcnl2TWN7KhC7SvTmbtuhxcQgMCoMG6m8YNB0fP4DPsEbRY98Ma';

// remove whitespaces, strip slashes, secure from entering script
function test_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

if (password_verify($enteredName, $correctNameHash) && password_verify($enteredPassword, $correctPasswordHash)) {
    session_start();
    $_SESSION["loggedAs"] = "admin";
    header("Location: library.html");
    exit();
} else {
    echo '<script>
    if (confirm("Neplatné přihlašovací údaje.")) {
        window.location.href = "login.html";
    }
    </script>';
}
?>