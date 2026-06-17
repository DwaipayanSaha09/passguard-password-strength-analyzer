/* ── PassGuard Script ────────────────────────────────────────────────────── */

// ── DOM refs ──────────────────────────────────────────
const input         = document.getElementById('pw-input');
const toggleBtn     = document.getElementById('toggle-vis');
const eyeIcon       = document.getElementById('eye-icon');
const copyBtn       = document.getElementById('copy-btn');
const meterSection  = document.getElementById('meter-section');
const statsRow      = document.getElementById('stats-row');
const checksSection = document.getElementById('checks-section');
const tipBanner     = document.getElementById('tip-banner');
const placeholder   = document.getElementById('placeholder');
const meterFill     = document.getElementById('meter-fill');
const strengthLabel = document.getElementById('strength-label');
const strengthScore = document.getElementById('strength-score');
const statLength    = document.getElementById('stat-length');
const statEntropy   = document.getElementById('stat-entropy');
const statCrack     = document.getElementById('stat-crack');
const checksGrid    = document.getElementById('checks-grid');
const tipText       = document.getElementById('tip-text');
const toast         = document.getElementById('toast');

const checkLabels = {
  length:        '≥ 8 characters',
  length_strong: '≥ 12 characters',
  uppercase:     'Uppercase letter',
  lowercase:     'Lowercase letter',
  digit:         'Contains a number',
  special:       'Special character',
  no_spaces:     'No spaces',
  no_repeat:     'No repeating chars',
  no_common:     'Not a common password'
};

// ── Theme Toggle ──────────────────────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon      = document.getElementById('theme-icon');
const themeLabel     = document.getElementById('theme-label');

themeToggleBtn.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
  themeIcon.textContent  = isLight ? '☀️' : '🌙';
  themeLabel.textContent = isLight ? 'Light Mode' : 'Dark Mode';
});

// ── Password visibility ───────────────────────────────
toggleBtn.addEventListener('click', () => {
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  eyeIcon.innerHTML = isPassword
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
});

// ── Real-time analysis ────────────────────────────────
let debounceTimer;
input.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(analyze, 100);
  copyBtn.disabled = !input.value;
});
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') { clearTimeout(debounceTimer); analyze(); }
});

// ── Password Generator ────────────────────────────────
function generatePassword(length) {
  const lower   = 'abcdefghijklmnopqrstuvwxyz';
  const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits  = '0123456789';
  const special = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const all = lower + upper + digits + special;

  // Guarantee at least one of each type
  let pw = [
    lower  [Math.floor(Math.random() * lower.length)],
    upper  [Math.floor(Math.random() * upper.length)],
    digits [Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  for (let i = pw.length; i < length; i++) {
    pw.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Fisher-Yates shuffle
  for (let i = pw.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pw[i], pw[j]] = [pw[j], pw[i]];
  }

  input.value = pw.join('');
  input.type  = 'text';
  eyeIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
  copyBtn.disabled = false;
  analyze();
}

// ── Copy Password ─────────────────────────────────────
function copyPassword() {
  const pw = input.value;
  if (!pw) return;

  navigator.clipboard.writeText(pw).then(() => {
    showToast('✓ Password copied to clipboard!');
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
    }, 2000);
  }).catch(() => {
    // Fallback for non-https
    const ta = document.createElement('textarea');
    ta.value = pw;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('✓ Password copied!');
  });
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── Security Tips Panel ───────────────────────────────
function toggleTips() {
  document.getElementById('tips-panel').classList.toggle('open');
}

// ── Core analysis logic ───────────────────────────────
function calculateEntropy(pw) {
  let cs = 0;
  if (/[a-z]/.test(pw)) cs += 26;
  if (/[A-Z]/.test(pw)) cs += 26;
  if (/[0-9]/.test(pw)) cs += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) cs += 32;
  return cs === 0 ? 0 : Math.round(pw.length * Math.log2(cs) * 10) / 10;
}

function estimateCrackTime(entropy) {
  const s = Math.pow(2, entropy) / 1e10;
  if (s < 1)          return 'Instantly';
  if (s < 60)         return `${Math.floor(s)} seconds`;
  if (s < 3600)       return `${Math.floor(s/60)} minutes`;
  if (s < 86400)      return `${Math.floor(s/3600)} hours`;
  if (s < 31536000)   return `${Math.floor(s/86400)} days`;
  if (s < 3.154e9)    return `${Math.floor(s/31536000)} years`;
  if (s < 3.154e12)   return `${Math.floor(s/3.154e9)}K years`;
  return 'Centuries+';
}

const COMMON = new Set([
  'password','123456','password123','qwerty','letmein',
  'admin','welcome','monkey','dragon','iloveyou','sunshine',
  'princess','football','master','abc123','123456789','1234567'
]);

function checkPasswordStrength(pw) {
  const length   = pw.length;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSpec  = /[^a-zA-Z0-9]/.test(pw);
  const noSpaces = !pw.includes(' ');
  const noRepeat = !/(.)\1{2,}/.test(pw);
  const noCommon = !COMMON.has(pw.toLowerCase());

  const checks = {
    length:        { pass: length >= 8,  tip: 'Use at least 8 characters' },
    length_strong: { pass: length >= 12, tip: 'Aim for 12+ characters' },
    uppercase:     { pass: hasUpper,     tip: 'Add at least one capital letter' },
    lowercase:     { pass: hasLower,     tip: 'Include some lowercase letters' },
    digit:         { pass: hasDigit,     tip: 'Add at least one digit (0–9)' },
    special:       { pass: hasSpec,      tip: 'Use symbols like !@#$%^&*' },
    no_spaces:     { pass: noSpaces,     tip: 'Remove any spaces' },
    no_repeat:     { pass: noRepeat,     tip: 'Avoid patterns like "aaa" or "111"' },
    no_common:     { pass: noCommon,     tip: 'Avoid obvious words like "password"' },
  };

  let score = 0;
  if (checks.length.pass)        score += 1;
  if (checks.length_strong.pass) score += 1;
  if (hasUpper && hasLower)      score += 1;
  if (checks.digit.pass)         score += 1;
  if (checks.special.pass)       score += 1;
  if (checks.no_repeat.pass)     score += 0.5;
  if (checks.no_common.pass)     score += 0.5;
  const scorePct = Math.min(100, Math.round((score / 6) * 100));

  let label, color;
  if      (scorePct < 25) { label = 'Very Weak';  color = '#ff4444'; }
  else if (scorePct < 50) { label = 'Weak';        color = '#ff8800'; }
  else if (scorePct < 75) { label = 'Moderate';    color = '#ffcc00'; }
  else if (scorePct < 90) { label = 'Strong';      color = '#88cc00'; }
  else                    { label = 'Very Strong'; color = '#00cc66'; }

  const entropy = calculateEntropy(pw);
  return { score: scorePct, label, color, entropy, crack_time: estimateCrackTime(entropy), checks, length };
}

function analyze() {
  const pw = input.value;
  if (!pw) { showPlaceholder(); return; }
  render(checkPasswordStrength(pw));
}

function showPlaceholder() {
  placeholder.style.display = 'block';
  meterSection.style.display = 'none';
  statsRow.style.display = 'none';
  checksSection.style.display = 'none';
  tipBanner.style.display = 'none';
  copyBtn.disabled = true;
}

function render(data) {
  placeholder.style.display = 'none';
  meterSection.style.display = 'block';
  statsRow.style.display = 'grid';
  checksSection.style.display = 'block';
  tipBanner.style.display = 'flex';

  meterFill.style.width = data.score + '%';
  meterFill.style.background = `linear-gradient(90deg, ${data.color}aa, ${data.color})`;
  strengthLabel.textContent = data.label;
  strengthLabel.style.color = data.color;
  strengthScore.textContent = `${data.score}/100`;

  statLength.textContent  = data.length;
  statEntropy.textContent = data.entropy + ' bits';
  statCrack.textContent   = data.crack_time;
  const critical = ['Instantly','seconds','minutes'].some(w => data.crack_time.includes(w));
  statCrack.style.color = critical ? '#ff4444' : data.color;

  checksGrid.innerHTML = '';
  for (const [key, check] of Object.entries(data.checks)) {
    const el = document.createElement('div');
    el.className = `check-item ${check.pass ? 'pass' : 'fail'}`;
    el.innerHTML = `<div class="check-icon">${check.pass ? '✓' : '○'}</div><div class="check-text">${checkLabels[key]}</div>`;
    checksGrid.appendChild(el);
  }

  const failed = Object.values(data.checks).filter(c => !c.pass).map(c => c.tip);
  tipText.textContent = failed.length > 0 ? failed[0] : '✅ Excellent password — all checks passed!';
}

// ── Modal logic ───────────────────────────────────────
function openModal(id) {
  document.getElementById('modal-' + id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById('modal-' + id).classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => {
    if (e.target === o) { o.classList.remove('open'); document.body.style.overflow = ''; }
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});
