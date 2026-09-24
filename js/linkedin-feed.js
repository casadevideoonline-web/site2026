/**
 * Casa de Vídeo — Feed do LinkedIn Component Script
 * Renderiza os cards das publicações nativas do LinkedIn com fallback local.
 */

document.addEventListener('DOMContentLoaded', function () {
  const feedContainer = document.getElementById('linkedin-posts-container');
  if (!feedContainer) return;

  const DATA_URL = 'data/linkedin-posts.json?v=' + Date.now();
  const COMPANY_URL = 'https://www.linkedin.com/company/casadevideo';

  const DEFAULT_POSTS = [
    {
      "id": "post-7495917427676024834",
      "tag": "ANDAV // FILME INSTITUCIONAL",
      "author": "Casa de Vídeo",
      "image": "Galeria/linkedin_post_1.jpg",
      "description": "Com o Distribuidor no presente, o Produtor planta o futuro. Ideia por trás do novo filme que fizemos para a Andav, associação que há 35 anos representa os distribuidores de insumos agropecuários do Brasil.",
      "url": "https://www.linkedin.com/posts/casadevideo_com-o-distribuidor-no-presente-o-produtor-activity-7495917427676024834-kv2x",
      "addedAt": "2026-08-25T17:00:00Z"
    },
    {
      "id": "post-7490784777919275009",
      "tag": "DIREÇÃO ARTÍSTICA // EVENTOS",
      "author": "Casa de Vídeo",
      "image": "Galeria/linkedin_post_2.jpg",
      "description": "Um mês na cola do nosso diretor artístico Helder Peixoto em seu habitat natural: os eventos. Convenções, gravações em estúdio e transmissões ao vivo com atenção em tudo.",
      "url": "https://www.linkedin.com/posts/casadevideo_1-m%C3%AAs-na-cola-do-nosso-diretor-art%C3%ADstico-activity-7490784777919275009-kHxt",
      "addedAt": "2026-08-25T17:00:00Z"
    },
    {
      "id": "post-7374152502524583936",
      "tag": "JOHNSON & JOHNSON // EVENTO",
      "author": "Casa de Vídeo",
      "image": "Galeria/linkedin_post_3.jpg",
      "description": "Foi um privilégio estar ao lado da Johnson & Johnson Innovative Medicine Brasil neste evento que celebra cultura, cuidado e aprendizado. Transformamos ideias em experiências autênticas.",
      "url": "https://www.linkedin.com/posts/casadevideo_encerramos-mais-uma-semana-de-conex%C3%A3o-e-virada-activity-7374152502524583936-d8lh",
      "addedAt": "2026-08-25T17:00:00Z"
    },
    {
      "id": "post-7369470969578405888",
      "tag": "SHE TALKS 2025 // DIREÇÃO ARTÍSTICA",
      "author": "Casa de Vídeo",
      "image": "Galeria/linkedin_post_4.jpg",
      "description": "A Casa de Vídeo esteve por trás de todo o conteúdo em vídeo e direção artística do She Talks, importante evento que celebra a liderança feminina na indústria farmacêutica. 🎬",
      "url": "https://www.linkedin.com/posts/casadevideo_shetalks2025-lideranaexafeminina-industriafarmacaeautica-activity-7369470969578405888-0gxt",
      "addedAt": "2026-08-25T17:00:00Z"
    }
  ];

  // 1. Tenta carregar via fetch do arquivo de dados ou localStorage
  const savedLocal = localStorage.getItem('cdv_local_posts');
  if (savedLocal) {
    try {
      const parsedLocal = JSON.parse(savedLocal);
      if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
        renderFeed(parsedLocal);
        return;
      }
    } catch (e) {}
  }

  fetch(DATA_URL)
    .then(response => {
      if (!response.ok) throw new Error('Não foi possível carregar data/linkedin-posts.json');
      return response.json();
    })
    .then(data => {
      if (data && Array.isArray(data.posts) && data.posts.length > 0) {
        renderFeed(data.posts);
      } else {
        renderFeed(DEFAULT_POSTS);
      }
    })
    .catch(err => {
      console.warn('Linkedin Feed Notice:', err.message);
      renderFeed(DEFAULT_POSTS);
    });

  function renderFeed(posts) {
    if (!Array.isArray(posts) || posts.length === 0) {
      posts = DEFAULT_POSTS;
    }

    // Ordena por data decrescente
    posts.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));

    feedContainer.innerHTML = '';

    posts.forEach((post, idx) => {
      const card = document.createElement('div');
      card.className = 'cdv-linkedin-card';
      card.style.animationDelay = (idx * 0.1) + 's';

      const postTag = post.tag || 'LINKEDIN // CASA DE VÍDEO';
      const postDesc = post.description || 'Confira esta publicação no perfil oficial da Casa de Vídeo no LinkedIn.';
      // Sanitiza a imagem: só aceita caminhos relativos locais (bloqueia javascript:, data:, URLs externas).
      const postImg = safeImagePath(post.image);
      // Sanitiza a URL: só aceita links https do LinkedIn (bloqueia javascript:, data:, etc.).
      const postUrl = safeLinkedInUrl(post.url);

      card.innerHTML = `
        <div class="cdv-linkedin-card-badge">
          <div class="cdv-linkedin-author-wrap">
            <img src="Documentos/logo.png" alt="Casa de Vídeo" class="cdv-linkedin-author-avatar" />
            <div class="cdv-linkedin-author-meta">
              <span class="cdv-linkedin-author-name">Casa de Vídeo</span>
            </div>
          </div>
          <span class="cdv-linkedin-badge-dot" title="Post Ativo"></span>
        </div>
        <div class="cdv-linkedin-media-wrapper">
          <img src="${escapeHtml(postImg)}" alt="Publicação Casa de Vídeo" class="cdv-linkedin-media-img" loading="lazy" />
          <div class="cdv-linkedin-media-overlay"></div>
          <span class="cdv-linkedin-tag">${escapeHtml(postTag)}</span>
        </div>
        <div class="cdv-linkedin-card-body">
          <p class="cdv-linkedin-post-text">${escapeHtml(postDesc)}</p>
        </div>
        <div class="cdv-linkedin-card-footer">
          <a href="${escapeHtml(postUrl)}" target="_blank" rel="noopener noreferrer" class="cdv-linkedin-view-link">
            <span>Ver no LinkedIn</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      `;

      feedContainer.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Só permite caminhos de imagem relativos locais (Galeria/..., Documentos/...).
  // Bloqueia javascript:, data:, http(s):// e caminhos absolutos que possibilitariam XSS/hotlink.
  function safeImagePath(raw) {
    const fallback = 'Galeria/1.avif';
    if (typeof raw !== 'string' || raw.trim() === '') return fallback;
    const val = raw.trim();
    // Rejeita qualquer esquema (javascript:, data:, http:, //cdn...) e path traversal.
    if (/^[a-z]+:/i.test(val) || val.startsWith('//') || val.startsWith('/') || val.includes('..')) {
      return fallback;
    }
    // Aceita apenas arquivos de imagem locais conhecidos.
    if (!/^(Galeria|Documentos)\/[\w.\-]+\.(avif|jpe?g|png|webp|gif)$/i.test(val)) {
      return fallback;
    }
    return val;
  }

  // Só permite URLs https de publicações do LinkedIn; caso contrário aponta para o perfil oficial.
  function safeLinkedInUrl(raw) {
    if (typeof raw !== 'string') return COMPANY_URL;
    try {
      const u = new URL(raw, window.location.href);
      if (u.protocol === 'https:' && /(^|\.)linkedin\.com$/i.test(u.hostname)) {
        return u.href;
      }
    } catch (e) {}
    return COMPANY_URL;
  }
});
