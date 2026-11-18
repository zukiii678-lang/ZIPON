<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
require_auth_page();
// Antarmuka belajar tetap satu aplikasi, tetapi sekarang dibuka melalui front controller PHP.
readfile(__DIR__ . '/index.html');
