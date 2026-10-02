const scenes = [...document.querySelectorAll('.scene')];
let current = 0;
let locked = false;
let forwardSign = null;   // wheel direction that means "next" (learned from his first swipe)

// ---------- go to a scene ----------
function goTo(n) {
    if (n < 0 || n >= scenes.length || n === current) return;
    current = n;
    locked = true;
    scenes.forEach((s, i) => {
        s.classList.toggle('active', i === n);
        s.classList.toggle('above', i < n);
        s.classList.toggle('below', i > n);
    });
    setTimeout(() => { locked = false; }, 1100);
}

const modalOpen = () => document.querySelector('.modal.show') !== null;

// ---------- mouse pad / mouse wheel ----------
// Windows and Mac scroll in opposite directions by default, so the first swipe
// on page 1 decides which direction means "forward". After that, the opposite
// direction goes back.
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (locked || modalOpen() || Math.abs(e.deltaY) < 8) return;
    const sign = Math.sign(e.deltaY);
    if (forwardSign === null) forwardSign = sign;
    goTo(current + (sign === forwardSign ? 1 : -1));
}, { passive: false });

// ---------- touch screens (finger moves up = next) ----------
let touchY = null;
window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
window.addEventListener('touchend', (e) => {
    if (touchY === null || locked || modalOpen()) return;
    const dy = touchY - e.changedTouches[0].clientY;
    touchY = null;
    if (Math.abs(dy) > 50) goTo(current + (dy > 0 ? 1 : -1));
}, { passive: true });

// ---------- keyboard ----------
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return closeModals();
    if (locked || modalOpen()) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goTo(current + 1); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(current - 1); }
});

// ---------- "swipe up" hint is also clickable ----------
document.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => goTo(current + 1)));

// ---------- modals ----------
function closeModals() {
    document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
    document.querySelector('.gift-card').classList.remove('opened');
    document.getElementById('bigGift').classList.remove('open');
}

document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = document.getElementById(btn.dataset.open);
        modal.classList.add('show');
        if (modal.id === 'modal-gift') {          // lid pops off, then the message appears
            setTimeout(() => {
                document.getElementById('bigGift').classList.add('open');
                modal.querySelector('.gift-card').classList.add('opened');
            }, 500);
        }
    });
});
document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', (e) => { if (e.target === m) closeModals(); });
});
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModals));

// ---------- background music (music/song.mp3, loops) ----------
// Browsers only allow sound after the first click / tap / key press, so it tries to
// start right away and, if blocked, starts on his first interaction.
const bgm = document.getElementById('bgm');
bgm.volume = 0.6;

function startMusic() {
    bgm.play().then(removeStarters).catch(() => {});
}
function removeStarters() {
    ['click', 'keydown', 'touchend', 'pointerdown'].forEach(ev => window.removeEventListener(ev, startMusic));
}
['click', 'keydown', 'touchend', 'pointerdown'].forEach(ev => window.addEventListener(ev, startMusic));
startMusic();
