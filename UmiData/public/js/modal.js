const integrantes = [
  {
    id: 0,
    nome: "Cauã Gama",
    cargo: "Designer UI/UX",
    descricao: "Criador de interfaces intuitivas e experiências de usuário memoráveis. Apaixonado por design responsivo.",
    foto: "./assets/imgs/fotoCaua.png",
    redes: {
      linkedin: "https://www.linkedin.com/in/cau%C3%A3-gama-416842314/",
      github: "https://github.com/orgs/UmiData01/people/CauaGamaPaixao",
      instagram: "https://instagram.com/cauaa.gama/"
    }
  },
  {
    id: 1,
    nome: "Igor Félix",
    cargo: "Desenvolvedor FullStack",
    descricao: "Especialista em desenvolvimento web com experiência em React e Node.js. Apaixonado por criar soluções inovadoras.",
    foto: "./assets/imgs/fotoIgor.jpeg",
    redes: {
      linkedin: "https://www.linkedin.com/in/igor-felix0/",
      github: "https://github.com/orgs/UmiData01/people/igor-fel1x",
      instagram: "https://instagram.com/_fellix07/"
    }
  },
  {
    id: 2,
    nome: "Paulo Jesus",
    cargo: "Desenvolvedor FullStack",
    descricao: "Especialista em desenvolvimento web com experiência em React e Node.js. Apaixonado por criar soluções inovadoras.",
    foto: "./assets/imgs/fotoPaulo.png",
    redes: {
      linkedin: "https://www.linkedin.com/in/paulo-gon%C3%A7alves-8093203b5/",
      github: "https://github.com/orgs/UmiData01/people/PauloJesus09",
      instagram: "https://www.instagram.com/pxuloow/"
    }
  },
  {
    id: 3,
    nome: "Sabrina Araújo",
    cargo: "Analista de Dados",
    descricao: "Especialista em análise de dados e visualização. Transformando dados em insights valiosos para o negócio.",
    foto: "./assets/imgs/fotoSabrina.png",
    redes: {
      linkedin: "https://www.linkedin.com/in/sabrina-araujo-051804337/",
      github: "https://github.com/orgs/UmiData01/people/SabrinaArjo",
      instagram: "https://instagram.com/sabrina_araujo2006/"
    }
  },
  {
    id: 4,
    nome: "Tiago Santos",
    cargo: "Product Manager",
    descricao: "Liderança de produto e estratégia. Focado em entregar valor aos usuários e ao negócio.",
    foto: "./assets/imgs/fotoTiaguinho.png",
    redes: {
      linkedin: "https://www.linkedin.com/in/tiago-da-silva-santos-a92b5339a/",
      github: "https://github.com/orgs/UmiData01/people/Tiago-santos1",
      instagram: "https://instagram.com/iamtiagooo/"
    }
  },
  {
    id: 5,
    nome: "Vitor Lima",
    cargo: "Product Manager",
    descricao: "Liderança de produto e estratégia. Focado em entregar valor aos usuários e ao negócio.",
    foto: "./assets/imgs/fotoVitor.jpeg",
    redes: {
      linkedin: "https://www.linkedin.com/in/vitor-lima13/",
      github: "https://github.com/orgs/UmiData01/people/Vitorlbs12",
      instagram: "https://instagram.com/vitinho.lbs/"
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