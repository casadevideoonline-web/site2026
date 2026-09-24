/**
 * session-guard.js — Proteção de Acesso & Autenticação de Sessão (b.rocket Digital Engine)
 * -----------------------------------------------------------------------------------
 * Garante que o acesso só ocorra após autenticação na tela de login (login.html).
 * Se o token de sessão não existir, redireciona o usuário para login.html.
 */

(function enforceAuth() {
  const sessionToken = sessionStorage.getItem('b_rocket_session');
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.endsWith('login.html');

  if (!isLoginPage && sessionToken !== 'cdv_authenticated') {
    if (currentPath.includes('/Google_Ads/') || currentPath.includes('/SEO/') || currentPath.includes('/GEO/')) {
      window.location.href = '../login.html';
    } else {
      window.location.href = './login.html';
    }
  }
})();

/**
 * Função global de logout
 */
function realizarLogout() {
  sessionStorage.removeItem('b_rocket_session');
  sessionStorage.removeItem('b_rocket_user');
  
  const currentPath = window.location.pathname;
  if (currentPath.includes('/Google_Ads/') || currentPath.includes('/SEO/') || currentPath.includes('/GEO/')) {
    window.location.href = '../login.html';
  } else {
    window.location.href = './login.html';
  }
}
