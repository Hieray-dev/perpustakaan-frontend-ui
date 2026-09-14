import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

/* ── Palet earth-tone: terracotta, mustard, sage, cream, slate blue, burgundy ── */
const EARTH = [
  '#C96F4A', // terracotta
  '#D9A441', // mustard
  '#8FA97C', // sage
  '#E8DCC3', // cream
  '#6C7F93', // slate blue
  '#7A2E2E', // burgundy
  '#A67C52', // tan
  '#3D405B', // slate navy
];

/* ── Judul katalog (hanya dipakai sebagai data, tidak ditampilkan) ── */
const DUMMY_TITLES = [
  'Laskar Pelangi', 'Bumi Manusia', 'Sang Pemimpi', 'Filosofi Teras',
  'Negeri 5 Menara', 'Pulang', 'Hati Suhita', 'Atomic Habits',
  'Madilog', 'Sapiens', 'Dunia Sophie', 'Zero to One',
];

/* Ukuran deterministik per posisi di rak */
const B_HEIGHTS = [132, 150, 168, 186, 204, 222, 240];
const W_MIN = 16;

function hAt(i) {
  return B_HEIGHTS[(i * 5) % B_HEIGHTS.length];
}
function wAt(i) {
  return W_MIN + ((i * 3) % 5) * 3; // 16–28
}
function tiltAt(i) {
  if (i % 7 === 0) return -6;
  if (i % 5 === 0) return 4;
  return 0;
}
function colorAt(i) {
  return EARTH[i % EARTH.length];
}

/* Hitung berapa book per rak (dari API, fallback 20; clamp 14–24) */
function pershelf(total) {
  if (!total) return 20;
  return Math.max(14, Math.min(24, Math.ceil(total / 2)));
}

/* ── Bangun satu rak berisi buku berdiri + tumpukan horizontal ────── */
function buildShelf(count, seed) {
  const row = [];
  for (let i = 0; i < count; i++) {
    const idx = seed + i;
    // tiap buku ke-9 → tumpukan horizontal
    if (i % 9 === 4) {
      row.push({
        type: 'stack',
        width: 66 + ((idx * 7) % 3) * 6, // 66–78
        color: colorAt(idx),
        alt: colorAt(idx + 3),
        slabs: 2 + (idx % 2), // 2–3 lapis
        slabH: 15 + ((idx >> 3) % 5), // 15–19
        special: idx === SPECIAL[1],
      });
    } else {
      row.push({
        type: 'book',
        title: DUMMY_TITLES[(idx * 3) % DUMMY_TITLES.length],
        height: hAt(idx),
        width: wAt(idx),
        tilt: tiltAt(idx),
        color: colorAt(idx),
        special: idx === SPECIAL[0] || idx === SPECIAL[1],
      });
    }
  }
  return row;
}

// Dua buku khusus yang interaktif (menuju /login)
const SPECIAL = [6, 30];

/* ── Buku dekoratif (bukan tombol, tanpa hover apa pun) ───────────── */
function DecoBook({ unit }) {
  return (
    <span
      aria-hidden
      className="relative flex-none select-none"
      style={{
        height: unit.height,
        width: unit.width,
        background: unit.color,
        transform: `rotate(${unit.tilt}deg)`,
        borderRadius: 3,
        boxShadow: '1px 3px 5px rgba(76,55,35,0.26)',
      }}
    >
      <span className="absolute inset-y-0 left-0 w-[2px] bg-white/25" />
      <span className="absolute inset-y-0 right-0 w-[2px] bg-black/25" />
      <span className="absolute inset-x-0 bottom-0 h-[8%] bg-black/15" />
    </span>
  );
}

function DecoStack({ unit }) {
  return (
    <span aria-hidden className="relative flex-none select-none" style={{ width: unit.width }}>
      <span className="flex flex-col">
        {Array.from({ length: unit.slabs }).map((_, i) => (
          <span
            key={i}
            style={{
              height: unit.slabH,
              background: i % 2 ? unit.alt : unit.color,
              marginTop: i === 0 ? 0 : -1,
              transform: `translateX(${i % 2 ? 2 : -1}px)`,
              boxShadow: '1px 2px 4px rgba(76,55,35,0.2)',
              borderRadius: 2,
            }}
          />
        ))}
      </span>
    </span>
  );
}

/* ── Buku khusus interaktif: hover → badge putih; klik → /login ───── */
function SpecialBook({ unit, onNavigateVisible }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onClick={onNavigateVisible}
      aria-label="Masuk ke Perpustakaan"
      className="relative flex-none outline-none"
      style={{
        height: unit.height,
        width: unit.width,
        background: unit.color,
        transform: `rotate(${unit.tilt}deg) translateY(${hover ? -8 : 0}px)`,
        transition: 'transform 250ms cubic-bezier(.22,1,.36,1), box-shadow 250ms',
        zIndex: hover ? 40 : 10,
        borderRadius: 3,
        boxShadow: hover
          ? '0 18px 28px -8px rgba(76,55,35,0.45)'
          : '1px 3px 5px rgba(76,55,35,0.26)',
      }}
    >
      <span className="absolute inset-y-0 left-0 w-[2px] bg-white/25" />
      <span className="absolute inset-y-0 right-0 w-[2px] bg-black/25" />
      <span className="absolute inset-x-0 bottom-0 h-[8%] bg-black/15" />

      {hover && (
        <span className="pointer-events-none absolute -top-12 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-4 py-1.5 shadow-xl backdrop-blur">
          <span className="block font-serif text-sm font-light text-slate-700">
            Masuk ke Perpustakaan
          </span>
          <span className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white/95" />
        </span>
      )}
    </button>
  );
}

/* ── Rak kayu tebal dengan bayangan 3D tegas ──────────────────────── */
function WoodBoard() {
  return (
    <div className="relative h-5 w-full">
      <div className="absolute inset-0 rounded-[4px] bg-gradient-to-b from-[#A67C52] to-[#8B5A2B] shadow-[inset_0_2px_0_rgba(255,255,255,0.25)]" />
      <div className="absolute inset-x-1 top-1 h-px bg-white/15" />
      <div className="absolute -bottom-2 left-0 right-0 h-3 rounded-[4px] bg-black/25 blur-[2px]" />
    </div>
  );
}

/* ── Halaman: rak buku editorial 2 tingkat ─────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [perShelf, setPerShelf] = useState(20);

  useEffect(() => {
    let active = true;
    api
      .get('/buku')
      .then((res) => {
        if (!active) return;
        const real = (Array.isArray(res.data) ? res.data : [])
          .map((b) => b.judul || b.title)
          .filter(Boolean);
        setPerShelf(pershelf(real.length));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const rowTop = buildShelf(perShelf, 0);
  const rowBottom = buildShelf(perShelf, 40);

  const openLogin = () => navigate('/login');

  const renderRow = (row) =>
    row.map((unit, i) => {
      const key = `u-${i}`;
      if (unit.special) {
        return <SpecialBook key={key} unit={unit} onNavigateVisible={openLogin} />;
      }
      return unit.type === 'stack' ? (
        <DecoStack key={key} unit={unit} />
      ) : (
        <DecoBook key={key} unit={unit} />
      );
    });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] px-6 py-16">
      <div className="w-full max-w-4xl">
        {/* Tingkat atas */}
        <div className="flex items-end justify-center gap-px px-1">
          {renderRow(rowTop)}
        </div>
        <WoodBoard />

        {/* Tingkat bawah */}
        <div className="mt-16 flex items-end justify-center gap-px px-1">
          {renderRow(rowBottom)}
        </div>
        <WoodBoard />
      </div>
    </div>
  );
}