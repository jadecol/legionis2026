/* ============================================================
   PROYECTO 2026 — main.js
   Lógica de interacción, contadores, formularios y animaciones
   ============================================================ */

'use strict';

/* ── 1. NAVBAR ────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    // Cierra menú al hacer clic en un enlace
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();


/* ── 2. CONTADORES ANIMADOS ───────────────────────────────── */
const COUNTER_DATA = {
  'cnt-apoyo':      { target: 147823, suffix: '' },
  'cnt-testigos':   { target: 34210,  suffix: '' },
  'cnt-municipios': { target: 862,    suffix: '' },
  'cnt-propuestas': { target: 52340,  suffix: '' },
};

function animateCounter(el, target, duration = 2000) {
  const start = performance.now();
  const formatter = new Intl.NumberFormat('es-CO');

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatter.format(Math.round(eased * target));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters() {
  Object.entries(COUNTER_DATA).forEach(([id, { target }]) => {
    const el = document.getElementById(id);
    if (el) animateCounter(el, target);
  });
}

// IntersectionObserver para disparar contadores cuando sean visibles
const counterSection = document.getElementById('hero-stats');
if (counterSection) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initCounters();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  obs.observe(counterSection);
} else {
  setTimeout(initCounters, 400);
}


/* ── 3. BARRAS DE TEMAS (ESCUCHA CIUDADANA) ──────────────── */
const ISSUE_DATA = [
  { id: 'bar-empleo', pct: 38, label: 'pct-empleo' },
  { id: 'bar-seg',    pct: 27, label: 'pct-seg' },
  { id: 'bar-salud',  pct: 18, label: 'pct-salud' },
  { id: 'bar-edu',    pct: 11, label: 'pct-edu' },
  { id: 'bar-vias',   pct: 6,  label: 'pct-vias' },
];

function animateBars() {
  ISSUE_DATA.forEach(({ id, pct, label }) => {
    const bar = document.getElementById(id);
    const lbl = document.getElementById(label);
    if (bar) {
      requestAnimationFrame(() => {
        bar.style.width = pct + '%';
      });
    }
    if (lbl) lbl.textContent = pct + '%';
  });
}

const issueSection = document.getElementById('escucha');
if (issueSection) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateBars();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  obs.observe(issueSection);
}


/* ── 4. FADE-UP AL HACER SCROLL ──────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => {
    el.style.animationPlayState = 'paused';
    obs.observe(el);
  });
}
document.addEventListener('DOMContentLoaded', initScrollReveal);


/* ── 5. ESCALERA DE PARTICIPACIÓN ────────────────────────── */
let selectedStep = null;

function selectStep(n) {
  selectedStep = n;
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('step' + i);
    if (el) el.classList.toggle('active', i === n);
  }
  // Actualiza el select del formulario
  const select = document.getElementById('tipo-participacion');
  if (select) {
    select.value = String(n);
    select.dispatchEvent(new Event('change'));
  }
}

// Exponer globalmente
window.selectStep = selectStep;


/* ── 6. CONTADOR DE CARACTERES ──────────────────────────── */
function initCharCounters() {
  const textareas = document.querySelectorAll('[data-maxchars]');
  textareas.forEach(ta => {
    const max = parseInt(ta.dataset.maxchars, 10);
    const counter = document.getElementById(ta.id + '-count');
    if (!counter) return;
    ta.addEventListener('input', () => {
      const remaining = max - ta.value.length;
      counter.textContent = remaining + ' caracteres restantes';
      counter.style.color = remaining < 100 ? '#BA7517' : '';
    });
  });
}
document.addEventListener('DOMContentLoaded', initCharCounters);


/* ── 7. OPCIONES DE PARTICIPACIÓN (REGISTRO) ────────────── */
function initPartOptions() {
  const opts = document.querySelectorAll('.part-option[data-value]');
  opts.forEach(opt => {
    opt.addEventListener('click', () => {
      opts.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const select = document.getElementById('tipo-participacion');
      if (select) {
        select.value = opt.dataset.value;
        // Sincroniza con la escalera lateral
        selectStep(parseInt(opt.dataset.value, 10));
      }
    });
  });
}
document.addEventListener('DOMContentLoaded', initPartOptions);


/* ── 8. ENVÍO REAL — ESCUCHA CIUDADANA → NETLIFY FORMS ──── */
window.submitEscucha = async function () {
  const form = document.getElementById('form-escucha');
  if (!form) return;

  const municipio = form.querySelector('#esc-municipio');
  const tema      = form.querySelector('#esc-tema');
  const texto     = form.querySelector('#esc-texto');

  // Validación
  let valid = true;
  [municipio, tema, texto].forEach(field => {
    if (!field) return;
    if (!field.value.trim()) {
      field.style.borderColor = '#E24B4A';
      valid = false;
    } else {
      field.style.borderColor = '';
    }
  });
  if (!valid) { showToast('Por favor completa los campos obligatorios.', 'error'); return; }

  const btn = form.querySelector('.btn-submit-escucha');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader" style="animation:spin 1s linear infinite"></i> Enviando…';

  try {
    // Netlify Forms acepta application/x-www-form-urlencoded
    const data = new FormData(form);
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    });

    if (response.ok) {
      form.style.display = 'none';
      const success = document.getElementById('success-escucha');
      if (success) success.style.display = 'block';
    } else {
      throw new Error('Error ' + response.status);
    }
  } catch (err) {
    console.error('Error al enviar escucha:', err);
    showToast('Error al enviar. Intenta de nuevo en un momento.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-send"></i> Enviar mi reporte';
  }
};


/* ── 9. ENVÍO REAL — REGISTRO → NETLIFY FORMS ───────────── */
window.submitRegistro = async function () {
  const form = document.getElementById('form-registro');
  if (!form) return;

  const required = ['reg-nombres','reg-apellidos','reg-cedula',
                    'reg-departamento','reg-municipio','reg-celular','reg-email'];
  let valid = true;

  required.forEach(id => {
    const field = form.querySelector('#' + id);
    if (!field) return;
    if (!field.value.trim()) {
      field.style.borderColor = '#E24B4A';
      valid = false;
    } else {
      field.style.borderColor = '';
    }
  });

  const tipo = form.querySelector('#tipo-participacion');
  if (!tipo || !tipo.value) {
    showToast('Selecciona tu tipo de participación.', 'error');
    valid = false;
  }

  const emailField = form.querySelector('#reg-email');
  if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
    emailField.style.borderColor = '#E24B4A';
    showToast('Ingresa un correo electrónico válido.', 'error');
    valid = false;
  }

  if (!valid) { showToast('Por favor completa todos los campos obligatorios.', 'error'); return; }

  const btn = form.querySelector('.btn-submit-registro');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader" style="animation:spin 1s linear infinite"></i> Registrando…';

  try {
    const data = new FormData(form);
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    });

    if (response.ok) {
      form.style.display = 'none';
      const success = document.getElementById('success-registro');
      if (success) success.style.display = 'block';
    } else {
      throw new Error('Error ' + response.status);
    }
  } catch (err) {
    console.error('Error al registrar:', err);
    showToast('Error al registrar. Intenta de nuevo en un momento.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-check"></i> Confirmar mi registro';
  }
};


/* ── 10. TOAST DE NOTIFICACIONES ─────────────────────────── */
function showToast(message, type = 'info') {
  // Eliminar toast previo
  const prev = document.getElementById('toast-notification');
  if (prev) prev.remove();

  const colors = {
    info:    { bg: '#E6F1FB', border: '#185FA5', text: '#0C447C' },
    error:   { bg: '#FCEBEB', border: '#E24B4A', text: '#A32D2D' },
    success: { bg: '#EAF3DE', border: '#1D9E75', text: '#085041' },
  };
  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.setAttribute('role', 'alert');
  toast.style.cssText = `
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${c.bg};
    border: 1px solid ${c.border};
    color: ${c.text};
    border-radius: 10px;
    padding: 0.875rem 1.5rem;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    z-index: 9999;
    max-width: 420px;
    width: calc(100vw - 2rem);
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}


/* ── 11. SCROLL SUAVE PARA ANCLAS ────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = 80; // altura del navbar fijo
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ── 12. GESTIÓN DEL FORMULARIO ACTIVO EN NAV ────────────── */
function updateActiveNav() {
  const sections = ['inicio', 'vision', 'escucha', 'participa', 'transparencia', 'contacto'];
  const links = document.querySelectorAll('.navbar__links a, .navbar__mobile a');
  let current = '';

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });

  links.forEach(link => {
    const href = link.getAttribute('href')?.slice(1);
    link.style.color = href === current ? 'rgba(255,255,255,1)' : '';
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });


/* ════════════════════════════════════════════════════════
   COUNTDOWN — Elecciones 31 de mayo 2026
   Con manejo de estado: antes / durante / después
════════════════════════════════════════════════════════ */
(function initCountdown() {
  // Fecha de apertura de urnas: 31 mayo 2026, 08:00 AM COT (UTC-5)
  const ELECTION_OPEN  = new Date('2026-05-31T08:00:00-05:00');
  // Fecha de cierre de urnas: 31 mayo 2026, 16:00 PM COT
  const ELECTION_CLOSE = new Date('2026-05-31T16:00:00-05:00');

  function pad(n) { return String(n).padStart(2, '0'); }

  function setDisplay(dias, horas, min, seg) {
    const ids = ['cd-dias','cd-horas','cd-min','cd-seg'];
    const vals = [dias, horas, min, seg];
    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = vals[i];
    });
  }

  function setElectionDayDisplay() {
    // Día de elecciones: estilo especial en los dígitos
    ['cd-dias','cd-horas','cd-min','cd-seg'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('election-day');
    });
    const label = document.getElementById('countdown-label');
    if (label) label.innerHTML = '<i class="ti ti-confetti" style="color:#5DCAA5"></i> ¡HOY ES EL DÍA · 31 DE MAYO!';
  }

  function tick() {
    const now  = new Date();
    const wrap = document.querySelector('.hero__countdown');

    // Estado 1: Día de elecciones — urnas abiertas
    if (now >= ELECTION_OPEN && now < ELECTION_CLOSE) {
      setDisplay('HOY', '¡VOTA', 'AHORA', '!');
      setElectionDayDisplay();
      return;
    }

    // Estado 2: Elecciones terminadas
    if (now >= ELECTION_CLOSE) {
      setDisplay('✅', '✅', '✅', '✅');
      const label = document.getElementById('countdown-label');
      if (label) label.innerHTML = '<i class="ti ti-heart"></i> ¡Gracias Colombia! · Elecciones realizadas';
      return;
    }

    // Estado 3: Cuenta regresiva normal
    const diff  = ELECTION_OPEN - now;
    const dias  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const min   = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seg   = Math.floor((diff % (1000 * 60)) / 1000);
    setDisplay(pad(dias), pad(horas), pad(min), pad(seg));
  }

  tick();
  setInterval(tick, 1000);
})();


/* ════════════════════════════════════════════════════════
   DATOS AJUSTADOS — Abelardo De La Espriella
   (seguridad es el tema #1 de su campaña)
════════════════════════════════════════════════════════ */
// Sobreescribir datos de barras de temas con los correctos para este candidato
const ISSUE_DATA_ESPRIELLA = [
  { id: 'bar-seg',    pct: 42, label: 'pct-seg' },
  { id: 'bar-empleo', pct: 28, label: 'pct-empleo' },
  { id: 'bar-salud',  pct: 16, label: 'pct-salud' },
  { id: 'bar-edu',    pct:  9, label: 'pct-edu' },
  { id: 'bar-vias',   pct:  5, label: 'pct-vias' },
];

// Reemplazar la función animateBars para usar datos correctos
const issueSection2 = document.getElementById('escucha');
if (issueSection2) {
  const obs2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        ISSUE_DATA_ESPRIELLA.forEach(({ id, pct, label }) => {
          const bar = document.getElementById(id);
          const lbl = document.getElementById(label);
          if (bar) requestAnimationFrame(() => { bar.style.width = pct + '%'; });
          if (lbl) lbl.textContent = pct + '%';
        });
        obs2.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  obs2.observe(issueSection2);
}


/* ════════════════════════════════════════════════════════
   TABS: cambiar entre formulario web y QR/WhatsApp
════════════════════════════════════════════════════════ */
window.switchTab = function(form, panel) {
  // Tabs
  const webTab = document.getElementById('tab-' + form + '-web');
  const qrTab  = document.getElementById('tab-' + form + '-qr');
  if (webTab) webTab.classList.toggle('active', panel === 'web');
  if (qrTab)  qrTab.classList.toggle('active',  panel === 'qr');

  // Paneles
  const webPanel = document.getElementById('panel-' + form + '-web');
  const qrPanel  = document.getElementById('panel-' + form + '-qr');
  if (webPanel) webPanel.style.display = panel === 'web' ? '' : 'none';
  if (qrPanel)  qrPanel.style.display  = panel === 'qr'  ? '' : 'none';
};

/* ════════════════════════════════════════════════════════
   NETLIFY FORMS: redireccionamiento post-envío nativo
   Los formularios usan type="submit" — Netlify los procesa
   y redirige. Mostramos éxito con parámetro URL.
════════════════════════════════════════════════════════ */
(function checkFormSuccess() {
  const params = new URLSearchParams(window.location.search);
  // Netlify redirige a /?form=registro o /?form=escucha tras enviar
  const form = params.get('form');
  if (form === 'registro') {
    const fReg = document.getElementById('form-registro');
    const sReg = document.getElementById('success-registro');
    if (fReg) fReg.style.display = 'none';
    if (sReg) sReg.style.display = 'block';
    setTimeout(() => {
      document.getElementById('participa')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
  if (form === 'escucha') {
    const fEsc = document.getElementById('form-escucha');
    const sEsc = document.getElementById('success-escucha');
    const pEsc = document.getElementById('panel-esc-web');
    if (fEsc) fEsc.style.display = 'none';
    if (pEsc) pEsc.style.display = 'none';
    if (sEsc) sEsc.style.display = 'block';
    setTimeout(() => {
      document.getElementById('escucha')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
})();


/* ════════════════════════════════════════════════════════
   BANNER DE URGENCIA — dinámico según días reales
   Nunca más hardcodeado
════════════════════════════════════════════════════════ */
(function initUrgenciaBanner() {
  const ELECTION = new Date('2026-05-31T08:00:00-05:00');
  const CLOSE    = new Date('2026-05-31T16:00:00-05:00');
  const now      = new Date();

  const banner   = document.getElementById('urgencia-banner');
  const titulo   = document.getElementById('urgencia-titulo');
  const subtitulo = document.getElementById('urgencia-subtitulo');
  if (!banner || !titulo || !subtitulo) return;

  const diffMs   = ELECTION - now;
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Post-elección: ocultar banner
  if (now >= CLOSE) { banner.style.display = 'none'; return; }

  // Día de elecciones
  if (now >= ELECTION && now < CLOSE) {
    banner.style.background = 'linear-gradient(135deg, #EAF3DE, #D4EDDA)';
    banner.style.borderColor = '#1D9E75';
    banner.style.color = '#085041';
    titulo.textContent = '🗳️ ¡HOY ES EL DÍA! Urnas abiertas hasta las 4:00 PM';
    subtitulo.textContent = 'Defiende tu voto. Testigos: estén en su mesa asignada.';
    banner.style.display = 'flex';
    return;
  }

  // Urgencia extrema: día siguiente
  if (diffDias <= 1) {
    banner.style.borderColor = '#E24B4A';
    titulo.textContent = '🚨 ¡MAÑANA SON LAS ELECCIONES!';
    subtitulo.textContent = 'Último día para confirmar testigos electorales. ¡Regístrate ahora!';
    banner.style.display = 'flex';
    return;
  }

  // Urgencia alta: 2 días o menos
  if (diffDias <= 2) {
    titulo.textContent = `⚡ ¡Faltan solo ${diffDias} días para el 31 de mayo!`;
    subtitulo.textContent = 'Necesitamos testigos electorales en cada mesa. Regístrate ya.';
    banner.style.display = 'flex';
    return;
  }

  // Normal: más de 2 días
  if (diffDias <= 10) {
    titulo.textContent = `¡Faltan ${diffDias} días para el 31 de mayo!`;
    subtitulo.textContent = 'Necesitamos testigos electorales en cada mesa de votación del país. Si puedes estar presente, regístrate ahora.';
    banner.style.display = 'flex';
    return;
  }

  // Más de 10 días: no mostrar banner de urgencia
  banner.style.display = 'none';
})();


/* ════════════════════════════════════════════════════════
   COUNTDOWN: urgencia visual cuando faltan < 2 días
════════════════════════════════════════════════════════ */
(function patchCountdownUrgency() {
  const ELECTION = new Date('2026-05-31T08:00:00-05:00');
  const diffMs   = ELECTION - new Date();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 2) {
    // Aplicar clase urgente a todos los números del countdown
    setTimeout(() => {
      document.querySelectorAll('.countdown-big__num').forEach(el => {
        el.classList.add('urgent');
      });
    }, 500);
  }
})();
