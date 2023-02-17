<template>
  <div class="app-auth-container">
    <div v-if="loading" class="app-auth-loading">
      <img
        class="app-auth-loading__spinner"
        src="@/assets/images/Icon/IconLoading.png"
        alt="loading..."
      />
      <p class="app-auth-loading__description">
        {{ $t('text-loading-token-verify-account') }}
      </p>
    </div>
    <div class="app-auth-background">
      <slot name="auth-background" />
    </div>
    <div class="app-auth-form">
      <slot name="auth-form" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppAuthContainer',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="less" scoped>
.app-auth-container {
  @apply relative;
  .desktop({
    @apply flex;
  });

  .app-auth-background {
    width: 100%;
    .desktop({
      flex: 0.6;
    });
  }

  .app-auth-form {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: @white;
    z-index: 10;
    padding: @padding-20;
    min-width: 300px;

    @apply absolute flex flex-col justify-center;
    .desktop({
      position: static;
      flex: 0.4;
      transform: none;
      min-height: 100vh;
    });
  }
  .app-auth-loading {
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    background-color: white;
    z-index: 999999;
    @apply flex flex-col items-center justify-center;

    &__spinner {
      width: 27rem;
      height: 27rem;
      -webkit-animation: spin 2s linear infinite; /* Safari */
      animation: spin 2s linear infinite;
      @-webkit-keyframes spin {
        0% {
          -webkit-transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
        }
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    }
    &__description {
      font-size: @size-26;
      color: @black;
      @apply font-medium mt-4;
    }
  }
}
</style>
