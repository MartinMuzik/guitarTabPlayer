<?php
$enteredName = test_input($_POST['name']);
$enteredPassword = test_input($_POST['password']);

$correctNameHash = '$2y$10$BLuwnB5cH3lYDU9ivnEN2O3skwu8klZjr2./b/zsflZwG/wqAjHuK';
$correctPasswordHash = '$2y$10$DDe4iUFSo77LmO5xHr2AI.CKPnaDLUzz7JrppTop.RfP0Ln9w0BBK';

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
    // href to login page after closing confirm window (by OK or Cancel)
    echo '<script>
    if (confirm("Neplatné přihlašovací údaje.")) {
        window.location.href = "login.html";
    } else {
        window.location.href = "login.html";
    }
    </script>';
}
?>