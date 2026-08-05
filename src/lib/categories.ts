export const CATEGORIES = [
  { id: 'all', label: 'Todo' },
  { id: 'muebles', label: 'Muebles' },
  { id: 'decoracion', label: 'Decoración' },
  { id: 'iluminacion', label: 'Iluminación' },
  { id: 'textil', label: 'Textil' },
  { id: 'cocina', label: 'Cocina' },
  { id: 'electronica', label: 'Electrónica' },
] as const;

export const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'all');
