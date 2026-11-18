<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
$pdo = db();
$raw = file_get_contents(__DIR__ . '/mnn-data.js');
$json = preg_replace('/^\s*const\s+LESSON_DATA_FALLBACK\s*=\s*/', '', $raw);
$json = preg_replace('/;\s*$/', '', (string)$json);
$lessons = json_decode((string)$json, true, 512, JSON_THROW_ON_ERROR);
$pdo->beginTransaction();
$ls = $pdo->prepare('INSERT INTO lessons (id,title,week) VALUES (?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title),week=VALUES(week)');
$vs = $pdo->prepare('INSERT INTO vocab (lesson_id,jp,kana,romaji,meaning) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE romaji=VALUES(romaji),meaning=VALUES(meaning)');
$count = 0;
foreach ($lessons as $lesson) {
    $ls->execute([(int)$lesson['id'], $lesson['title'], (int)ceil((int)$lesson['id'] / 3.2)]);
    foreach (($lesson['vocab'] ?? []) as $v) { $vs->execute([(int)$lesson['id'], $v[0] ?? '', $v[1] ?? '', $v[2] ?? '', $v[3] ?? '']); $count++; }
}
$u = $pdo->prepare('INSERT INTO users (username,password_hash) VALUES (?,?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)');
$u->execute(['xyez', password_hash('W6sndtvi', PASSWORD_DEFAULT)]);
$pdo->commit();
header('Content-Type: text/plain; charset=utf-8');
echo "Instalasi selesai. $count kosakata dimasukkan. Akun awal: xyez\nHapus atau rename install.php setelah selesai.\n";
