const integrantes = [
  {
    id: 0,
    nome: "Integrante 1",
    cargo: "Desenvolvedor Full Stack",
    descricao: "Especialista em desenvolvimento web com experiência em React e Node.js. Apaixonado por criar soluções inovadoras.",
    foto: "./assets/imgs/logo1.png",
    redes: {
      linkedin: "https://linkedin.com/in/integrante1",
      github: "https://github.com/integrante1",
      instagram: "https://instagram.com/integrante1"
    }
  },
  {
    id: 1,
    nome: "Integrante 2",
    cargo: "Desenvolvedor Backend",
    descricao: "Especialista em arquitetura de sistemas e banco de dados. Focado em performance e escalabilidade.",
    foto: "./assets/imgs/logo1.png",
    redes: {
      linkedin: "https://linkedin.com/in/integrante2",
      github: "https://github.com/integrante2",
      instagram: "https://instagram.com/integrante2"
    }
  },
  {
    id: 2,
    nome: "Integrante 3",
    cargo: "Designer UX/UI",
    descricao: "Criador de interfaces intuitivas e experiências de usuário memoráveis. Apaixonado por design responsivo.",
    foto: "./assets/imgs/logo1.png",
    redes: {
      linkedin: "https://linkedin.com/in/integrante3",
      github: "https://github.com/integrante3",
      instagram: "https://instagram.com/integrante3"
    }
  },
  {
    id: 3,
    nome: "Integrante 4",
    cargo: "Desenvolvedor Frontend",
    descricao: "Especialista em JavaScript e frameworks modernos. Focado em criar interfaces responsivas e acessíveis.",
    foto: "./assets/imgs/logo1.png",
    redes: {
      linkedin: "https://linkedin.com/in/integrante4",
      github: "https://github.com/integrante4",
      instagram: "https://instagram.com/integrante4"
    }
  },
  {
    id: 4,
    nome: "Integrante 5",
    cargo: "Analista de Dados",
    descricao: "Especialista em análise de dados e visualização. Transformando dados em insights valiosos para o negócio.",
    foto: "./assets/imgs/logo1.png",
    redes: {
      linkedin: "https://linkedin.com/in/integrante5",
      github: "https://github.com/integrante5",
      instagram: "https://instagram.com/integrante5"
    }
  },
  {
    id: 5,
    nome: "Integrante 6",
    cargo: "Product Manager",
    descricao: "Liderança de produto e estratégia. Focado em entregar valor aos usuários e ao negócio.",
    foto: "./assets/imgs/logo1.png",
    redes: {
      linkedin: "https://linkedin.com/in/integrante6",
      github: "https://github.com/integrante6",
      instagram: "https://instagram.com/integrante6"
    }
  }
];

function abrirModal(i) {
  const integranteGrupo = integrantes[i];
  
  if (!integranteGrupo) {
    return;
  } 
  
  // Preenche as informações do modal
  document.getElementById('modalFoto').src = integranteGrupo.foto;
  document.getElementById('modalNome').textContent = integranteGrupo.nome;
  document.getElementById('modalCargo').textContent = integranteGrupo.cargo;
  document.getElementById('modalDescricao').textContent = integranteGrupo.descricao;
  
  // Preenche os links das redes sociais de cada integrante
  document.getElementById('linkLinkedin').href = integranteGrupo.redes.linkedin;
  document.getElementById('linkGithub').href = integranteGrupo.redes.github;
  document.getElementById('linkInstagram').href = integranteGrupo.redes.instagram;
  
  // Mostra o modal
  const modal = document.getElementById('modalIntegrante');
  modal.classList.add('ativo');
  
  // Não scrolla quando o modal está aberto
  document.body.style.overflow = 'hidden';
}

// Função para fechar o modal
function fecharModal(fecharModal) {
  // Se o evento foi disparado pelo clique no overlay (não no conteúdo)
  if (fecharModal && fecharModal.target.id !== 'modalIntegrante') {
    return;
  }
  
  const modal = document.getElementById('modalIntegrante');
  modal.classList.remove('ativo');
  
  // volta o scroll do body
  document.body.style.overflow = 'auto';
}

// Fecha o modal no esc
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    fecharModal();
  }
});

// fecha o modal quando clica fora do modal
document.addEventListener('click', function(event) {
  const modal = document.getElementById('modalIntegrante');
  if (event.target === modal) {
    fecharModal();
  }
});