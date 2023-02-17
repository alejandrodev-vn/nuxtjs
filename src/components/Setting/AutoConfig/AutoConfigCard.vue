<template>
  <div class="auto-config-card">
    <div class="auto-config-card__top">
      <i class="far fa-envelope"></i>
      <p class="auto-config-card__top__title">
        {{ $t('email-template') }}
      </p>
      <p class="auto-config-card__top__description">
        {{ $t('email-template-description') }}
      </p>
    </div>
    <div class="auto-config-card__bottom">
      <a-button type="primary" class="btn-setup" @click="handleSetup">
        {{ $t('set-up') }}
      </a-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'AutoConfigCard',
  methods: {
    handleSetup() {
      this.$router.push(
        this.localePath({
          path: '/setting/auto-config/email',
        })
      )
    },
  },
}
</script>
<style lang="less" scoped>
.auto-config-card {
  padding: 24px;
  border: 1px solid #0112221a;
  border-radius: 8px;
  width: 330px;
  &__top {
    i {
      font-size: 5rem;
      margin-bottom: 1rem;
      color: #323232;
    }
    &__title {
      font-size: @size-20;
      color: @black;
      @apply font-medium;
    }
    &__description {
      color: @black-gray;
      font-size: @size-14;
    }
  }
  &__bottom {
    @apply w-full;
    .btn-setup {
      @apply w-full block;
    }
  }
}
</style>
