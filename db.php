<?php
declare(strict_types=1);
function db(): PDO {
    static $pdo;
    if ($pdo instanceof PDO) return $pdo;
    $host = getenv('ZIPUN_DB_HOST') ?: '127.0.0.1';
    $name = getenv('ZIPUN_DB_NAME') ?: 'zipun';
    $user = getenv('ZIPUN_DB_USER') ?: 'root';
    $pass = getenv('ZIPUN_DB_PASS') ?: '';
    $pdo = new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    return $pdo;
}
function json_response(array $data, int $status = 200): never { http_response_code($status); header('Content-Type: application/json; charset=utf-8'); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function request_json(): array { $data = json_decode(file_get_contents('php://input') ?: '{}', true); return is_array($data) ? $data : []; }
function require_login(): int { if (empty($_SESSION['user_id'])) json_response(['ok'=>false,'error'=>'Silakan login terlebih dahulu.'], 401); return (int)$_SESSION['user_id']; }
