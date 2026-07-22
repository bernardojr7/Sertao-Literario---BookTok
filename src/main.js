import './firebase.js';
import { onAuthChange } from './services/auth.js';
import { getUserProfile } from './services/users.js';
import { renderApp } from './app.js';

let currentUser = null;
let currentProfile = null;

function showAuth() {
  document.getElementById('app').innerHTML = '';
  import('./pages/login.js').then(m => m.renderLogin());
}

function enterApp(user, profile) {
  currentUser = user;
  currentProfile = profile;
  renderApp(profile);
}

onAuthChange(async (user) => {
  if (!user) {
    currentUser = null;
    currentProfile = null;
    showAuth();
    return;
  }

  try {
    const profile = await getUserProfile(user.uid);
    if (profile) {
      enterApp(user, profile);
    } else {
      document.getElementById('app').innerHTML = 'Carregando perfil...

';
    }
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    showAuth();
  }
});
