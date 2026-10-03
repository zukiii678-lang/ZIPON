-- Zipun Supabase Schema
-- Jalankan di Supabase SQL Editor

-- Lessons (Bab 1-25, mapping minggu 1-8)
create table if not exists lessons (
  id int primary key,
  title text not null,
  week int default 1,
  created_at timestamptz default now()
);

-- Vocab
create table if not exists vocab (
  id bigint generated always as identity primary key,
  lesson_id int references lessons(id) on delete cascade,
  jp text not null,
  kana text,
  romaji text,
  meaning text,
  audio_url text,
  created_at timestamptz default now()
);
create index if not exists idx_vocab_lesson on vocab(lesson_id);

-- Grammar patterns (Pola Kalimat)
create table if not exists grammar_patterns (
  id bigint generated always as identity primary key,
  lesson_id int references lessons(id) on delete cascade,
  pattern text not null,
  meaning text,
  structure text,
  explanation text,
  level text default 'N5'
);

create table if not exists pattern_examples (
  id bigint generated always as identity primary key,
  pattern_id bigint references grammar_patterns(id) on delete cascade,
  jp text not null,
  kana text,
  meaning text,
  audio_url text
);

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  xp_total int default 0,
  streak_days int default 0,
  last_study_date date,
  created_at timestamptz default now()
);

-- SRS progress per user per vocab (SM-2)
create table if not exists user_vocab_progress (
  user_id uuid references profiles(id) on delete cascade,
  vocab_id bigint references vocab(id) on delete cascade,
  ease double precision default 2.5,
  interval_days double precision default 0,
  reps int default 0,
  lapses int default 0,
  next_review timestamptz default now(),
  memorized boolean default false,
  updated_at timestamptz default now(),
  primary key (user_id, vocab_id)
);

-- Pattern progress
create table if not exists user_pattern_progress (
  user_id uuid references profiles(id) on delete cascade,
  pattern_id bigint references grammar_patterns(id) on delete cascade,
  xp int default 0,
  mastered boolean default false,
  updated_at timestamptz default now(),
  primary key (user_id, pattern_id)
);

-- Study logs (untuk progres mingguan + leaderboard)
create table if not exists study_logs (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date default current_date,
  xp int default 0,
  minutes int default 0,
  correct int default 0,
  total int default 0,
  created_at timestamptz default now()
);
create index if not exists idx_logs_user_date on study_logs(user_id, date);

-- Weekly goals
create table if not exists weekly_goals (
  user_id uuid references profiles(id) on delete cascade,
  week_start date default date_trunc('week', now())::date,
  target_xp int default 300,
  target_words int default 100,
  target_days int default 5,
  primary key (user_id, week_start)
);

-- Leaderboard view (XP mingguan)
create or replace view leaderboard_weekly as
select
  date_trunc('week', created_at)::date as week_start,
  user_id,
  sum(xp) as week_xp,
  sum(correct) as week_correct,
  sum(total) as week_total
from study_logs
group by 1,2;

-- RLS: aktifkan dan buat policy sederhana (anon read, auth write)
alter table lessons enable row level security;
alter table vocab enable row level security;
alter table grammar_patterns enable row level security;
alter table pattern_examples enable row level security;
alter table profiles enable row level security;
alter table user_vocab_progress enable row level security;
alter table user_pattern_progress enable row level security;
alter table study_logs enable row level security;
alter table weekly_goals enable row level security;

drop policy if exists "public read lessons" on lessons;
create policy "public read lessons" on lessons for select using (true);
drop policy if exists "public read vocab" on vocab;
create policy "public read vocab" on vocab for select using (true);
drop policy if exists "public read patterns" on grammar_patterns;
create policy "public read patterns" on grammar_patterns for select using (true);
drop policy if exists "public read examples" on pattern_examples;
create policy "public read examples" on pattern_examples for select using (true);

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "own srs" on user_vocab_progress;
create policy "own srs" on user_vocab_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own pattern progress" on user_pattern_progress;
create policy "own pattern progress" on user_pattern_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own logs" on study_logs;
create policy "own logs" on study_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own goals" on weekly_goals;
create policy "own goals" on weekly_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed lessons 1-25 (judul sesuai Minna no Nihongo I)
insert into lessons (id, title, week) values
(1,'Perkenalan Diri & Profesi',1),(2,'Benda di Sekitar & Kepemilikan',1),
(3,'Lokasi, Tempat & Toserba',1),(4,'Waktu, Hari & Kegiatan Rutin',2),
(5,'Perpindahan, Transportasi & Liburan',2),(6,'Aktivitas Harian & Objek',2),
(7,'Alat, Bahasa & Memberi-Menerima',3),(8,'Kata Sifat (Sifat & Kesan)',3),
(9,'Kesukaan, Kemampuan & Alasan',3),(10,'Keberadaan Benda & Posisi',4),
(11,'Jumlah, Frekuensi & Durasi Waktu',4),(12,'Perbandingan & Bentuk Lampau KS/KB',4),
(13,'Keinginan & Tujuan',5),(14,'Bentuk Te',5),
(15,'Izin & Larangan',5),(16,'Urutan Kegiatan & Ciri',6),
(17,'Bentuk Nai & Kewajiban',6),(18,'Bentuk Kamus & Kemampuan',6),
(19,'Bentuk Ta & Pengalaman',7),(20,'Bentuk Biasa vs Sopan',7),
(21,'Pendapat, Kutipan & Dugaan',7),(22,'Modifikasi Kata Benda',8),
(23,'Saat / Ketika & Syarat',8),(24,'Memberi & Menerima Kebaikan',8),
(25,'Pengandaian',8)
on conflict (id) do update set title=excluded.title, week=excluded.week;
