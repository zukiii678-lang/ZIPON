<?php
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) session_start();

function current_user(): ?array {
    if (empty($_SESSION['user_id'])) return null;
    return ['id' => (int)$_SESSION['user_id'], 'username' => (string)($_SESSION['username'] ?? '')];
}

function require_auth_page(): array {
    $user = current_user();
    if (!$user) {
        header('Location: login.php');
        exit;
    }
    return $user;
}
