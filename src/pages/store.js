import { listStoreItems, purchaseItem } from '../services/store.js';
import { isStudent, isStaff } from '../utils/permissions.js';
import { showToast } from '../components/Toast.js';

export async function renderStore(profile) {
  const items = await listStoreItems();

  document.getElementById('pageContent').innerHTML = `
    
      
        <h1>Loja Literária</h1>
        ${isStudent(profile) ? `${profile.cactoscoins || 0} Cactoscoins disponíveis` : 'Gerencie os itens da loja.'}


      


    



    
      
        🌵


        Saldo


        ${profile.cactoscoins || 0}


      


      
        ⭐


        XP necessário


        ${profile.xp || 0}


      


    



    
      ${items.length > 0 ? items.map(item => `
        
          ${item.icon || '🎨'}


          
            <h3>${item.title}</h3>
            ${item.description || ''}


            
              **🌵 ${item.priceCoins || 0}**
              ${isStudent(profile) ? `<button class="primary-btn buy-item" data-id="${item.id}" data-price="${item.priceCoins || 0}" data-xp="${item.requiredXp || 0}">Comprar</button>` : ''}
            


          


        


      `).join('') : 'Nenhum item disponível.

'}
    


  `;

  document.querySelectorAll('.buy-item').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const price = Number(btn.dataset.price);
      const xp = Number(btn.dataset.xp);

      if ((profile.cactoscoins || 0) < price) return showToast('Cactoscoins insuficientes.', 'error');
      if ((profile.xp || 0) < xp) return showToast('XP insuficiente.', 'error');

      try {
        await purchaseItem(profile.uid, id, price, xp);
        showToast('Item adquirido!');
        setTimeout(() => renderStore(profile), 1000);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
}
