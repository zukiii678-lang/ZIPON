<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/db.php';

if (!empty($_SESSION['user_id'])) { header('Location: index.php'); exit; }
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $username = trim((string)($_POST['username'] ?? ''));
        $password = (string)($_POST['password'] ?? '');
        $q = db()->prepare('SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1');
        $q->execute([$username]);
        $user = $q->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) {
            $error = 'Username atau password salah.';
        } else {
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int)$user['id'];
            $_SESSION['username'] = $user['username'];
            header('Location: index.php');
            exit;
        }
    } catch (Throwable $e) {
        $error = 'Database belum siap. Jalankan mysql-schema.sql dan install.php terlebih dahulu.';
    }
}
?><!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Masuk — Zipun</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0c0f1a;color:#e2e8f0;font:16px Arial,sans-serif}.box{width:min(380px,calc(100% - 32px));padding:32px;background:#161b2e;border:1px solid #303858;border-radius:20px;box-sizing:border-box}h1{text-align:center;margin:0 0 8px}p{color:#94a3b8;font-size:13px;text-align:center}label{display:block;color:#94a3b8;font-size:13px;margin-top:18px}input{width:100%;box-sizing:border-box;margin-top:7px;padding:13px;border-radius:11px;border:1px solid #303858;background:#111628;color:white;font-size:15px}button{width:100%;margin-top:22px;padding:13px;border:0;border-radius:11px;background:#6366f1;color:#fff;font-weight:bold;font-size:15px;cursor:pointer}.error{color:#f87171;font-size:13px;text-align:center;margin-top:14px}
</style></head><body><main class="box"><div style="text-align:center;font-size:42px">🇯🇵</div><h1>Masuk ke Zipun</h1><p>Progres SRS tersimpan di MySQL</p><form method="post"><label>Username<input name="username" required autofocus autocomplete="username"></label><label>Password<input name="password" type="password" required autocomplete="current-password"></label><button type="submit">Masuk</button></form><?php if ($error): ?><div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?></main></body></html>
