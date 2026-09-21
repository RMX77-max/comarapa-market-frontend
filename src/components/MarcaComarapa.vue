<template>
  <div class="marca-comarapa" :class="{ 'marca-comarapa--centrada': centrada }">
    <img
      class="marca-comarapa__simbolo"
      :src="
        centrada
          ? '/logos/comarapa-market-completo-360.png'
          : '/logos/comarapa-market-simbolo-160.png'
      "
      :alt="centrada ? 'Comarapa Market' : ''"
      :aria-hidden="centrada ? undefined : 'true'"
    />

    <div v-if="!centrada">
      <div class="marca-comarapa__nombre">Comarapa<br />Market</div>
      <div class="marca-comarapa__lema">Tierra del bienestar</div>
      <div v-if="mostrarUbicacion" class="marca-comarapa__ubicacion">Comarapa</div>
    </div>
    <div
      v-else-if="mostrarUbicacion"
      class="marca-comarapa__ubicacion marca-comarapa__ubicacion--centrada"
    >
      <q-icon name="place" /> Comarapa
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    centrada?: boolean;
    mostrarUbicacion?: boolean;
  }>(),
  {
    centrada: false,
    mostrarUbicacion: true,
  },
);
</script>

<style scoped lang="scss">
.marca-comarapa {
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--verde-principal);

  &--centrada {
    flex-direction: column;
    gap: 8px;
    text-align: center;

    .marca-comarapa__simbolo {
      width: 210px;
      height: 210px;
    }
  }

  &__simbolo {
    width: 78px;
    height: 64px;
    object-fit: contain;
  }

  &__nombre {
    font-size: 1.18rem;
    font-weight: 700;
    line-height: 0.98;
  }

  &__lema {
    margin-top: 1px;
    color: #82916d;
    font-size: 0.68rem;
    letter-spacing: 0.01em;
  }

  &__ubicacion {
    margin-top: 2px;
    color: var(--texto-secundario);
    font-size: 0.75rem;

    &--centrada {
      margin-top: -25px;
      font-size: 0.9rem;
    }
  }
}

@media (max-width: 380px) {
  .marca-comarapa--centrada .marca-comarapa__simbolo {
    width: 174px;
    height: 174px;
  }
}
</style>
