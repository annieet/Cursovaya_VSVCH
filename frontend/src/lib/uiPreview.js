const LS = 'salon_kastom_ui_preview';

export function syncPreviewFromUrl() {
  if (typeof window === 'undefined') return;
  const q = new URLSearchParams(window.location.search).get('ui_preview');
  if (q === '1') {
    window.localStorage.setItem(LS, '1');
    window.history.replaceState({}, '', window.location.pathname + window.location.hash);
  }
}

export function isUiPreview() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(LS) === '1';
}

export function setUiPreview(on) {
  if (typeof window === 'undefined') return;
  if (on) window.localStorage.setItem(LS, '1');
  else window.localStorage.removeItem(LS);
}

/** Видит и клиентские, и сотруднические экраны (мастер заказа + панель). */
export const PREVIEW_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'preview@local.test',
  name: 'Гость',
  role: 'ADMIN',
};
