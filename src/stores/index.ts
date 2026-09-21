import { defineStore } from '#q-app/wrappers';
import { createPinia } from 'pinia';

export default defineStore(() => {
  const tienda = createPinia();

  return tienda;
});
