<template>
  <div class="error">
    <template v-if="statusCode === 404">
      <img
        src="@/assets/images/ErrorPage/PageNotFound.png"
        alt="Page-Not-Found"
      />
      <span class="status-code">{{ statusCode }}</span>
      <p class="error-title">{{ $t('page-not-found') }}</p>
      <nuxt-link class="error-button" to="/">
        {{ $t('back-to-home') }}
      </nuxt-link>
    </template>
    <template v-if="statusCode === 500">
      <img src="@/assets/images/ErrorPage/ServerError.png" alt="Server-Error" />
      <span class="status-code">{{ statusCode }}</span>
      <p class="error-title">{{ $t('server-error') }}</p>
      <nuxt-link class="error-button" to="/">
        {{ $t('back-to-home') }}
      </nuxt-link>
    </template>
  </div>
</template>

<script>
export default {
  name: 'AppError',
  props: {
    statusCode: {
      type: Number,
      required: true,
    },
  },
  mounted() {
    if (this.statusCode === 400) {
      this.handleRedirectHome()
    }
  },
  methods: {
    handleRedirectHome() {
      this.$router.push(
        this.localePath({
          path: `/`,
        })
      )
    },
  },
}
</script>

<style lang="less" scoped>
.error {
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  .status-code {
    color: #22313f;
    font-weight: bold;
    font-size: 14rem;
    line-height: 16.9rem;
    margin-bottom: 0;
  }
  img {
    width: 35rem;
    height: 35rem;
  }
  &-title {
    font-weight: 500;
    font-size: @size-26;
    line-height: 3.1rem;
    color: #22313f;
    margin-bottom: 2.5rem;
  }
  &-button {
    display: inline-block;
    background-color: @primary !important;
    border-color: @primary;
    border-radius: 4px !important;
    font-weight: 500;
    font-size: @size-16;
    opacity: 1;
    transition: opacity 0.3s ease;
    padding: @padding-12 @padding-16;
    color: #fff !important;
    width: 18.7rem;
    text-align: center;
    &:hover {
      opacity: 0.7;
    }
  }
}
</style>
