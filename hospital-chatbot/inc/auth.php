<?php
function login(PDO $pdo, string $username, string $password): bool {
  $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE username=?");
  $stmt->execute([$username]);
  $u = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$u) return false;

  $db = (string)$u['password_hash'];

  // مؤقت: لو مخزن نص مثل admin123
  if ($password === $db || password_verify($password, $db)) {
    $_SESSION['user_id'] = $u['id'];
    $_SESSION['username'] = $username;
    return true;
  }
  return false;
}