<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

$raw = file_get_contents("php://input");
$body = json_decode($raw, true) ?: [];
$action = $body["action"] ?? "";
$DEMO_USER = "admin";
$DEMO_PASS = "admin";

function ok($arr=[]){ echo json_encode(array_merge(["ok"=>true], $arr)); exit; }
function err($msg, $code=400){ http_response_code($code); echo json_encode(["ok"=>false, "error"=>$msg]); exit; }

if ($action === "status"){
  ok(["logged_in" => !empty($_SESSION["logged_in"])]);
}

if ($action === "login"){
  $u = trim($body["username"] ?? "");
  $p = trim($body["password"] ?? "");
  if ($u === "" || $p === "") err("Missing username/password");

  global $DEMO_USER, $DEMO_PASS;
  if ($u === $DEMO_USER && $p === $DEMO_PASS){
    $_SESSION["logged_in"] = true;
    ok(["logged_in"=>true]);
  }
  err("Invalid credentials", 401);
}

if ($action === "logout"){
  $_SESSION = [];
  if (ini_get("session.use_cookies")){
    $params = session_get_cookie_params();
    setcookie(session_name(), "", time()-42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
  }
  session_destroy();
  ok(["logged_in"=>false]);
}

err("Unknown action");