import { logout } from './services/auth.js';

let currentProfile = null;

const pages = ['home', 'library', 'store', 'booktok', 'profile'];
const pageLabels = ['Home', 'Biblioteca', 'Loja', 'BookTok', 'Perfil'];
const pageIcons = ['🏠', '📚', '🛍️', '🎬', '👤'];

function themeToggle() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('sertao-theme', isDark ? 'dark' : 'light');
}

export function renderApp(profile) {
  currentProfile = profile;
  const savedTheme = localStorage.getItem('sertao-theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }

  document.getElementById('app').innerHTML = `
    
      <header class="topbar">
        
          🌵


          Sertão Literário
        


        
          <button id="themeBtn" class="icon-btn">${savedTheme === 'dark' ? '☀' : '☾'}</button>
          
            ${initials(profile.name)}


            ${profile.name?.split(' ')[0] || 'Usuário'}
          


          <button id="logoutBtn" class="secondary-btn">Sair</button>
        


      </header>
      <main id="pageContent" class="page"></main>
      <nav class="bottom-nav" id="bottomNav"></nav>
    


  `;

  renderBottomNav(0);
  loadPage(0);

  document.getElementById('themeBtn').addEventListener('click', themeToggle);

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await logout();
  });
}

function renderBottomNav(active) {
  const nav = document.getElementById('bottomNav');
  nav.innerHTML = pages
    .map((page, i) => `
      <button class="nav-btn ${i === active ? 'active' : ''}" data-page="${page}" data-index="${i}">
        ${pageIcons[i]}
        ${pageLabels[i]}
      </button>
    `).join('');

  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.index);
      renderBottomNav(index);
      loadPage(index);
    });
  });
}

function loadPage(index) {
  const page = pages[index];
  const importMap = {
    home: () => import('./pages/home.js').then(m => m.renderHome(currentProfile)),
    library: () => import('./pages/library.js').then(m => m.renderLibrary(currentProfile)),
    store: () => import('./pages/store.js').then(m => m.renderStore(currentProfile)),
    booktok: () => import('./pages/booktok.js').then(m => m.renderBookTok(currentProfile)),
    profile: () => import('./pages/profile.js').then(m => m.renderProfile(currentProfile))
  };

  importMap[page]().catch(err => {
    console.error(err);
    document.getElementById('pageContent').innerHTML = 'Erro ao carregar página.

';
  });
}

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
