<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/db.php';
$action = $_GET['action'] ?? '';
$pdo = db();
try {
    if ($action === 'login') {
        $in = request_json(); $username = trim((string)($in['username'] ?? '')); $password = (string)($in['password'] ?? '');
        $q = $pdo->prepare('SELECT id,username,password_hash FROM users WHERE username=? LIMIT 1'); $q->execute([$username]); $u = $q->fetch();
        if (!$u || !password_verify($password, $u['password_hash'])) json_response(['ok'=>false,'error'=>'Username atau password salah.'], 401);
        session_regenerate_id(true); $_SESSION['user_id']=(int)$u['id']; $_SESSION['username']=$u['username'];
        json_response(['ok'=>true,'user'=>['id'=>(int)$u['id'],'username'=>$u['username']]]);
    }
    if ($action === 'logout') { $_SESSION=[]; session_destroy(); json_response(['ok'=>true]); }
    if ($action === 'me') json_response(['ok'=>true,'user'=>empty($_SESSION['user_id']) ? null : ['id'=>(int)$_SESSION['user_id'],'username'=>$_SESSION['username']]]);
    $uid = require_login();
    if ($action === 'data') {
        $lessons=$pdo->query('SELECT id,title,week FROM lessons ORDER BY id')->fetchAll(); $vocab=$pdo->query('SELECT id,lesson_id,jp,kana,romaji,meaning FROM vocab ORDER BY lesson_id,id')->fetchAll();
        $q=$pdo->prepare('SELECT vocab_id,ease,interval_days,reps,lapses,next_review,memorized FROM user_vocab_progress WHERE user_id=?'); $q->execute([$uid]);
        json_response(['ok'=>true,'lessons'=>$lessons,'vocab'=>$vocab,'progress'=>$q->fetchAll()]);
    }
    if ($action === 'progress') { $i=request_json(); $q=$pdo->prepare('INSERT INTO user_vocab_progress (user_id,vocab_id,ease,interval_days,reps,lapses,next_review,memorized) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE ease=VALUES(ease),interval_days=VALUES(interval_days),reps=VALUES(reps),lapses=VALUES(lapses),next_review=VALUES(next_review),memorized=VALUES(memorized)'); $q->execute([$uid,(int)$i['vocab_id'],(float)$i['ease'],(float)$i['interval_days'],(int)$i['reps'],(int)$i['lapses'],$i['next_review'],!empty($i['memorized'])?1:0]); json_response(['ok'=>true]); }
    if ($action === 'log') { $i=request_json(); $q=$pdo->prepare('INSERT INTO study_logs (user_id,study_date,xp,minutes,correct,total) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE xp=xp+VALUES(xp),minutes=minutes+VALUES(minutes),correct=correct+VALUES(correct),total=total+VALUES(total)'); $q->execute([$uid,$i['date'],(int)$i['xp'],(int)$i['minutes'],(int)$i['correct'],(int)$i['total']]); json_response(['ok'=>true]); }
    json_response(['ok'=>false,'error'=>'Aksi tidak dikenal.'],404);
} catch (Throwable $e) { error_log($e->getMessage()); json_response(['ok'=>false,'error'=>'Kesalahan server. Pastikan MySQL dan database sudah disiapkan.'],500); }
