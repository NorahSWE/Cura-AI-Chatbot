<?php

function sanitize($s){
  $s = trim((string)$s);
  $s = strip_tags($s);                
  $s = preg_replace('/\s+/u', ' ', $s); 
  return $s;
}

function is_arabic($s){
  return preg_match('/\p{Arabic}/u', $s) === 1;
}

function tr($ar, $en, $lang){
  return $lang === 'ar' ? $ar : $en;
}

function json_response($arr){
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}
?>
