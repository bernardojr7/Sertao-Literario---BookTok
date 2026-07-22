import { login, register } from '../services/auth.js';
import { createUserProfile } from '../services/users.js';
import { showToast } from '../components/Toast.js';
import { validateEmail, validatePassword, validateName } from '../utils/validators.js';

let isRegister = false;

export function renderLogin() {
  const savedTheme = localStorage.getItem('sertao-theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');

  document.getElementById('app').innerHTML = `
    
      
        
          🌵


          Sertão Literário
        


        
          <h1>A leitura virou jornada.</h1>
          Uma experiência literária gamificada. Leia, conquiste, compartilhe.


        


      


      
        
          <h2 id="authTitle">Entrar na jornada</h2>
          Acesse seu painel de leitura.


          
            <button id="tabLogin" class="active">Entrar</button>
            <button id="tabRegister">Criar conta</button>
          


          <form id="authForm" class="form-grid">
            
              <label>Nome completo <input id="inputName" type="text" /></label>
            


            <label>E-mail <input id="inputEmail" type="email" required /></label>
            
              <label>Perfil
                <select id="inputRole">
                  <option value="student">Aluno</option>
                  <option value="teacher">Professor</option>
                  <option value="coordinator">Coordenador</option>
                </select>
              </label>
            


            
              <label>Código de segurança <input id="inputCode" type="password" /></label>
            


            <label>Senha <input id="inputPassword" type="password" minlength="6" required /></label>
            <button class="primary-btn full" type="submit" id="authBtn">Entrar na jornada</button>
          </form>
          
            <button id="themeToggleAuth" style="background:none;color:var(--muted);text-decoration:underline">☾ Tema escuro</button>
          


        


      


    


  `;

  document.getElementById('tabLogin').addEventListener('click', () => setMode(false));
  document.getElementById('tabRegister').addEventListener('click', () => setMode(true));
  document.getElementById('authForm').addEventListener('submit', handleSubmit);
  document.getElementById('inputRole')?.addEventListener('change', toggleCodeField);
  document.getElementById('themeToggleAuth').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('sertao-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });

  setMode(false);
}

function setMode(registerMode) {
  isRegister = registerMode;
  document.getElementById('tabLogin').classList.toggle('active', !registerMode);
  document.getElementById('tabRegister').classList.toggle('active', registerMode);
  document.getElementById('nameField').classList.toggle('hidden', !registerMode);
  document.getElementById('roleField').classList.toggle('hidden', !registerMode);
  document.getElementById('authTitle').textContent = registerMode ? 'Crie sua jornada' : 'Entrar na jornada';
  document.getElementById('authDesc').textContent = registerMode
    ? 'Escolha seu perfil para acessar a experiência correta.'
    : 'Acesse seu painel de leitura e acompanhe suas conquistas.';
  document.getElementById('authBtn').textContent = registerMode ? 'Criar minha conta' : 'Entrar na jornada';
  if (!registerMode) document.getElementById('codeField').classList.add('hidden');
}

function toggleCodeField() {
  const role = document.getElementById('inputRole').value;
  document.getElementById('codeField').classList.toggle('hidden', role === 'student');
}

async function handleSubmit(e) {
  e.preventDefault();

  const email = document.getElementById('inputEmail').value.trim();
  const password = document.getElementById('inputPassword').value;

  if (!validateEmail(email)) return showToast('E-mail inválido.', 'error');
  if (!validatePassword(password)) return showToast('Senha deve ter 6+ caracteres.', 'error');

  try {
    if (isRegister) {
      const name = document.getElementById('inputName').value.trim();
      const role = document.getElementById('inputRole').value;
      const code = document.getElementById('inputCode')?.value?.trim() || '';

      if (!validateName(name)) return showToast('Informe seu nome.', 'error');

      if (role === 'teacher' && code !== 'SERTAO-PROF-2026') {
        return showToast('Código de professor inválido.', 'error');
      }
      if (role === 'coordinator' && code !== 'SERTAO-COORD-2026') {
        return showToast('Código de coordenador inválido.', 'error');
      }

      const userCredential = await import('../firebase.js').then(m => m.auth);
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const credential = await createUserWithEmailAndPassword(userCredential, email, password);
      await updateProfile(credential.user, { displayName: name });

      await createUserProfile(credential.user.uid, {
        name,
        email,
        role,
        className: role === 'coordinator' ? 'Todas as turmas' : (document.getElementById('inputClass')?.value || '6º Ano'),
        isActive: true
      });

      showToast('Conta criada com sucesso!', 'success');
    } else {
      await login(email, password);
    }
  } catch (err) {
    const msg = {
      'auth/invalid-credential': 'E-mail ou senha inválidos.',
      'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde e tente novamente.'
    };
    showToast(msg[err.code] || 'Erro ao acessar. Tente novamente.', 'error');
    console.error(err);
  }
}
