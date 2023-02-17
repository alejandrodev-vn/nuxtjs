<template>
  <div class="loading-page">
    <div class="loading-page-container">
      <div class="loading-page-container__logo">
        <img
          :src="require('~/assets/images/Logo/Logo-Prime-CRM.png')"
          alt="Prime CRM"
        />
      </div>
      <div class="loading-page-container__title">{{ $t('welcome-title') }}</div>
      <div class="loading-page-container__description">
        {{ $t('welcome-description') }}
      </div>
      <div class="loading-page-container__spinner">
        <loading-ios></loading-ios>
      </div>
      <div class="loading-page-container__features">
        <a-row type="flex" justify="center">
          <a-col
            v-for="(feature, index) in features"
            :key="index"
            :xs="{ span: 12 }"
            :lg="8"
          >
            <div class="feature">
              <img
                :src="feature.image"
                alt="Prime CRM"
                class="feature__image"
              />
              <div class="feature__text">{{ feature.text }}</div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingPage',
  data() {
    return {
      features: [
        {
          image: require('~/assets/images/Auth/Auth-Loading-1.png'),
          text: this.$t('loading-feature-text-1'),
        },
        {
          image: require('~/assets/images/Auth/Auth-Loading-2.png'),
          text: this.$t('loading-feature-text-2'),
        },
        {
          image: require('~/assets/images/Auth/Auth-Loading-3.png'),
          text: this.$t('loading-feature-text-3'),
        },
      ],
    }
  },
}
</script>

<style lang="less" scoped>
.loading-page {
  min-height: 100vh;
  @apply flex items-center justify-center;
}

.loading-page-container {
  width: 100%;
  max-width: 1400px;
  padding: 1rem;
  @apply text-center;

  &__logo {
    height: 50px;
    @apply text-center;
    .desktop({
      height: 70px;
    });

    img {
      width: auto;
      height: 100%;
      margin: 0 auto;
    }
  }

  &__title {
    font-size: @size-32;
    color: @black;
    margin-top: 3rem;
    @apply font-bold;
  }

  &__description {
    font-size: @size-20;
    color: @secondary-1;
    margin-bottom: 2rem;
    @apply font-medium;
  }
}

.feature {
  max-width: 21rem;
  margin: 0 auto;
  padding: 0.5rem;

  &__image {
    margin-bottom: 1rem;
  }

  &__text {
    font-size: @size-20;
    color: @black;
    @apply font-medium;
  }
}
</style>
