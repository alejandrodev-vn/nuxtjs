<template>
  <div class="whatsapp-order-form-card">
    <div class="whatsapp-order-form-card__top">
      <img src="~/assets/images/WhatsApp/WhatsApp.png" alt="whats-app" />
      <p class="whatsapp-order-form-card__top__title">
        {{ $t('setup-whatsapp-title') }}
      </p>
      <p class="whatsapp-order-form-card__top__description">
        {{ $t('setup-whatsapp-description') }}
      </p>
    </div>
    <div class="whatsapp-order-form-card__bottom">
      <a-button type="primary" class="btn-setup" @click="handleSetup">
        {{ $t('set-up') }}
      </a-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'WhatsappOrderFormCard',
  methods: {
    handleSetup() {
      this.$router.push(
        this.localePath({
          path: '/setting/whatsapp-order-form/setup',
        })
      )
    },
  },
}
</script>
<style lang="less" scoped>
.whatsapp-order-form-card {
  padding: @padding-24;
  border: 1px solid #0112221a;
  border-radius: 8px;
  width: 34rem;
  &__top {
    img {
      width: 6.4rem;
      height: 6.4rem;
      margin-bottom: 10px;
    }
    &__title {
      font-size: @size-16;
      color: @black;
      margin-bottom: 0.6rem;
      @apply font-medium;
    }
    &__description {
      color: @black-gray;
      font-size: @size-4;
      white-space: pre-line;
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
