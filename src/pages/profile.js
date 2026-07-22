import { updateUserProfile } from '../services/users.js';
import { changePassword, removeAccount, logout } from '../services/auth.js';
import { showToast } from '../components/Toast.js';
import { roleLabel } from '../utils/permissions.js';

export function renderProfile(profile) {
  localStorage.setItem('_profile', JSON.stringify(profile));

  document.getElementById('pageContent').innerHTML = `
    
      
        <h1>Meu perfil</h1>
        Gerencie suas informações.


      


      ${roleLabel(profile.role)}
    



    
      
        <h2 style="margin-bottom:20px">Informações</h2>
        
          <label>Nome <input id="editName" value="${profile.name || ''}" /></label>
          <label>E-mail <input value="${profile.email || ''}" disabled /></label>
          <label>Turma <input value="${profile.className || ''}" disabled /></label>
          ${profile.role === 'student' ? `
            <label>Metas de leitura
              
                <input id="goalBimestral" type="number" placeholder="Bimestral" value="10" style="flex:1" />
                <input id="goalSemestral" type="number" placeholder="Semestral" value="30" style="flex:1" />
                <input id="goalAnual" type="number" placeholder="Anual" value="60" style="flex:1" />
              


            </label>
          ` : ''}
          <button id="saveProfile" class="primary-btn full">Salvar alterações</button>
          <button id="changePwd" class="secondary-btn full">Alterar senha</button>
          <button id="deleteAccount" class="danger-btn full">Apagar conta</button>
          <button id="logoutFromProfile" class="secondary-btn full">Sair do aplicativo</button>
        


      



      
        <h2 style="margin-bottom:20px">Histórico</h2>
        
          📚Livros lidos**${profile.booksRead || 0}**


          ⭐Experiência XP**${profile.xp || 0}**


          🏅Nível**${profile.level || 1}**


          🌵Cactoscoins**${profile.cactoscoins || 0}**


        


      


    


  `;

  document.getElementById('saveProfile').addEventListener('click', async () => {
    const name = document.getElementById('editName').value.trim();
    if (!name) return showToast('Informe seu nome.', 'error');
    await updateUserProfile(profile.uid, { name });
    showToast('Perfil atualizado!', 'success');
  });

  document.getElementById('changePwd').addEventListener('click', async () => {
    const current = prompt('Senha atual:');
    if (!current) return;
    const newPwd = prompt('Nova senha (6+ caracteres):');
    if (!newPwd || newPwd.length < 6) return showToast('Nova senha inválida.', 'error');
    try {
      await changePassword(current, newPwd);
      showToast('Senha alterada!', 'success');
    } catch {
      showToast('Senha atual incorreta.', 'error');
    }
  });

  document.getElementById('deleteAccount').addEventListener('click', async () => {
    const confirm = prompt('Digite CONFIRMAR para excluir sua conta:');
    if (confirm !== 'CONFIRMAR') return;
    const pwd = prompt('Sua senha atual:');
    if (!pwd) return;
    try {
      await removeAccount(pwd);
      showToast('Conta excluída.');
    } catch {
      showToast('Senha incorreta.', 'error');
    }
  });

  document.getElementById('logoutFromProfile').addEventListener('click', logout);
}
