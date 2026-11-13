<template>
  <div class="marca-comarapa" :class="{ 'marca-comarapa--centrada': centrada }">
    <router-link
      v-if="!centrada"
      class="marca-comarapa__enlace"
      :to="{ name: 'inicio' }"
      aria-label="Ir al inicio de Comarapa Market"
    >
      <img
        class="marca-comarapa__logo marca-comarapa__logo--encabezado"
        src="/Comarapa_Market_Logo_Pin_Quasar_Apps/Comarapa_Market_Logo_Pin_Quasar/07_quasar_public_icons/logo-header.png"
        alt="Comarapa Market"
        decoding="async"
      />
    </router-link>
    <img
      v-else
      class="marca-comarapa__logo"
      src="/icons/app-store-1024x1024.png"
      alt="Comarapa Market"
      decoding="async"
    />
    <span v-if="mostrarUbicacion && !centrada" class="marca-comarapa__ubicacion">Comarapa</span>
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
  flex: 0 1 auto;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  padding: 3px 0;
  background: transparent;

  &__enlace {
    display: block;
    line-height: 0;
    color: inherit;
    text-decoration: none;
  }

  &__logo {
    display: block;
    width: clamp(178px, 22vw, 225px);
    height: 50px;
    object-fit: contain;
    object-position: left center;

    &--encabezado {
      filter: none;
    }
  }

  &__ubicacion {
    margin: -3px 0 1px 58px;
    color: #466255;
    font-size: 0.72rem;
    line-height: 1;
  }

  &--centrada {
    align-items: center;
    padding: 0;
    background: transparent;
    text-align: center;

    .marca-comarapa__logo {
      width: clamp(150px, 44vw, 205px);
      height: auto;
      aspect-ratio: 1;
      object-position: center;
      border-radius: 22px;
      box-shadow: 0 10px 24px rgb(0 70 40 / 18%);
    }

    .marca-comarapa__ubicacion {
      margin: -12px 0 0;
    }
  }
}

@media (max-width: 480px) {
  .marca-comarapa {
    padding: 2px 0;

    &__logo {
      width: 158px;
      height: 42px;
    }

    &__logo--encabezado {
      width: 190px;
      height: 48px;
    }

    &--centrada {
      padding: 0;

      .marca-comarapa__logo {
        width: min(46vw, 180px);
        height: auto;
        border-radius: 18px;
      }
    }
  }
}
</style>
