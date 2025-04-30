const API_URL = '/api';

// Função para cadastrar animal (mantida original)
async function salvarCadastroAnimal(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  try {
    const response = await fetch(`${API_URL}/animais`, {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      alert('Animal cadastrado com sucesso!');
      event.target.reset();
      const data = await response.json();
      window.location.href = data.redirect || '/';
    } else {
      alert('Erro ao cadastrar animal');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Função para carregar animais com filtros OTIMIZADA
async function carregarAnimais(tipo) {
  try {
    // Coletar filtros
    const filtros = {
      nome: document.getElementById(`filtro-nome-${tipo}`)?.value.trim(),
      localizacao: document.getElementById(`filtro-local-${tipo}`)?.value.trim(),
      porte: document.getElementById(`filtro-porte-${tipo}`)?.value
    };

    // Construir query params
    const params = new URLSearchParams({ status: tipo });
    if (filtros.nome) params.append('nome', filtros.nome);
    if (filtros.localizacao) params.append('localizacao', filtros.localizacao);
    if (filtros.porte) params.append('porte', filtros.porte);

    // Fetch com filtros
    const response = await fetch(`${API_URL}/animais?${params}`);
    if (!response.ok) throw new Error('Erro na requisição');
    const animais = await response.json();

    // Exibir resultados (mantido original)
    const container = document.getElementById(`lista-${tipo}`);
    container.innerHTML = animais.length ? animais.map(animal => `
      <div class="animal-card">
        <div class="animal-imagen">
          <img src="${animal.foto || 'https://cdn.pixabay.com/photo/2017/01/06/19/15/dog-1950934_1280.jpg'}" alt="Foto do ${animal.nome || 'animal'}">
        </div>
        <div class="animal-info">
          <h3>${animal.nome || 'Sem nome'}</h3>
          <p><strong>Porte:</strong> ${animal.porte || '-'}</p>
          <p><strong>Raça:</strong> ${animal.raca || '-'}</p>
          <button class="btn-detalhes" onclick="toggleDetalhes(this)">Ver Detalhes</button>
          <div class="detalhes-completos" style="display:none;">
            <p><strong>Cor:</strong> ${animal.cor || '-'}</p>
            <p><strong>Gênero:</strong> ${animal.genero || '-'}</p>
            <p><strong>Descrição:</strong> ${animal.descricao || '-'}</p>
            <p><strong>Localização:</strong> ${animal.localizacao || '-'}</p>
            <p><strong>Tutor:</strong> ${animal.tutor || '-'}</p>
            <p><strong>E-mail:</strong> ${animal.email || '-'}</p>
            <p><strong>Telefone:</strong> ${animal.telefone || '-'}</p>
          </div>
        </div>
      </div>
    `).join('') : '<p style="padding:32px">Nenhum animal encontrado.</p>';

  } catch (error) {
    console.error('Erro:', error);
    document.getElementById(`lista-${tipo}`).innerHTML = '<p style="color:red">Erro ao carregar animais.</p>';
  }
}

// Restante do código MANTIDO IGUAL
function limparFiltro(tipo) {
  document.getElementById(`filtro-nome-${tipo}`).value = '';
  document.getElementById(`filtro-local-${tipo}`).value = '';
  document.getElementById(`filtro-porte-${tipo}`).value = '';
  carregarAnimais(tipo);
}

function toggleDetalhes(button) {
  const detalhes = button.nextElementSibling;
  if (detalhes.style.display === 'none') {
    detalhes.style.display = 'block';
    button.textContent = 'Ocultar Detalhes';
  } else {
    detalhes.style.display = 'none';
    button.textContent = 'Ver Detalhes';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('perdidos')) {
    carregarAnimais('perdido');
    configurarEventosBusca('perdido');
  }
  if (window.location.pathname.includes('encontrados')) {
    carregarAnimais('encontrado');
    configurarEventosBusca('encontrado');
  }
});

function configurarEventosBusca(tipo) {
  const nomeFiltro = document.getElementById(`filtro-nome-${tipo}`);
  const localFiltro = document.getElementById(`filtro-local-${tipo}`);
  const porteFiltro = document.getElementById(`filtro-porte-${tipo}`);
  
  if (nomeFiltro) {
    nomeFiltro.addEventListener('input', debounce(() => carregarAnimais(tipo), 500));
  }
  if (localFiltro) {
    localFiltro.addEventListener('input', debounce(() => carregarAnimais(tipo), 500));
  }
  if (porteFiltro) {
    porteFiltro.addEventListener('change', () => carregarAnimais(tipo));
  }
}

function debounce(func, wait) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), wait);
  };
}
