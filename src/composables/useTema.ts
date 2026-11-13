import { computed, ref } from 'vue';
import { Dark } from 'quasar';

export type PreferenciaTema = 'claro' | 'oscuro' | 'sistema';

const CLAVE_TEMA = 'comarapa_market_tema';
const preferencia = ref<PreferenciaTema>('claro');
let inicializado = false;

function aplicarTema(valor: PreferenciaTema): void {
  if (valor === 'sistema') Dark.set('auto');
  else Dark.set(valor === 'oscuro');
}

export function inicializarTema(): void {
  if (inicializado || typeof window === 'undefined') return;
  const guardado = window.localStorage.getItem(CLAVE_TEMA);
  preferencia.value = ['claro', 'oscuro', 'sistema'].includes(String(guardado))
    ? (guardado as PreferenciaTema)
    : 'claro';
  aplicarTema(preferencia.value);
  inicializado = true;
}

export function useTema() {
  inicializarTema();

  function establecerTema(valor: PreferenciaTema): void {
    preferencia.value = valor;
    window.localStorage.setItem(CLAVE_TEMA, valor);
    aplicarTema(valor);
  }

  return {
    preferencia: computed(() => preferencia.value),
    oscuroActivo: computed(() => Dark.isActive),
    establecerTema,
  };
}
