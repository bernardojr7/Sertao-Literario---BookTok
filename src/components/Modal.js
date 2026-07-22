export function showModal(title, body) {
  const modal = document.getElementById('modal');
  modal.innerHTML = `
    
      
        <h2>${title}</h2>
        <button id="closeModalBtn" class="icon-btn">×</button>
      


      ${body}
    


  `;
  modal.classList.remove('hidden');

  document.getElementById('closeModalBtn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
}
