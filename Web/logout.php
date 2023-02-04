<?php
if(isset($_COOKIE['PHPSESSID'])) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', 0, $params['path'], $params['domain'], $params['secure'], isset($params['httponly']));
    session_destroy();
}
header("Location: index.html");
exit();
?>