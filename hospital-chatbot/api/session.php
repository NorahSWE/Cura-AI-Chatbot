<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
  'logged_in' => isset($_SESSION['user_id']) || isset($_SESSION['username'])
], JSON_UNESCAPED_UNICODE);