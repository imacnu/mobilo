export const CATALOG_REFRESH_EVENT = 'catalog:refresh';

export function refreshCatalog() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CATALOG_REFRESH_EVENT));
  }
}
