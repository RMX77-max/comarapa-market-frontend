<template>
  <div class="volver-perfil">
    <q-btn
      class="volver-perfil__boton"
      flat
      no-caps
      icon="arrow_back"
      label="Volver al perfil"
      :to="{ name: 'perfil' }"
      aria-label="Volver al perfil"
    />
  </div>
</template>

<style scoped lang="scss">
.volver-perfil {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 12px clamp(16px, 3vw, 32px) 0;

  &__boton {
    min-height: 42px;
    padding: 0 12px;
    border: 1px solid var(--borde);
    border-radius: 13px;
    color: var(--primario-oscuro);
    background: var(--fondo);
    font-weight: 600;
    box-shadow: 0 5px 16px rgb(0 70 40 / 6%);

    &:hover,
    &:focus-visible {
      border-color: var(--primario);
      background: var(--coral-suave);
    }
  }
}

@media (max-width: 480px) {
  .volver-perfil {
    padding-top: 8px;

    &__boton {
      min-height: 38px;
      padding-inline: 9px;
      font-size: 0.82rem;
    }
  }
}
</style>
