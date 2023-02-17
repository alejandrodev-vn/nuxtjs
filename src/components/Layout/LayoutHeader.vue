<template>
  <div class="layout-header">
    <div class="layout-header__left layout-header-left">
      <a-popover v-if="false" trigger="click" placement="bottomLeft">
        <img
          :src="require('~/assets/images/Icon/Icon-Apps.png')"
          alt="Prime CRM"
          class="layout-header-left__apps"
        />
        <template slot="content">
          <div class="products">
            <div class="products__title">{{ $t('other-products') }}</div>
            <div class="products__body">
              <img
                v-for="(product, index) in products"
                :key="index"
                :src="
                  require(`~/assets/images/Logo/Logo-Prime-${product.name}.png`)
                "
                :alt="product.name"
                class="products__body--image"
                @click="handleGoProduct(product)"
              />
            </div>
            <a class="products__footer" @click="handleGoSSOHome">
              {{ $t('sso-home') }}
              <a-icon type="arrow-right" class="products__footer--icon" />
            </a>
          </div>
        </template>
      </a-popover>
      <img
        :src="require('~/assets/images/Logo/Logo-Prime-CRM.png')"
        alt="Prime CRM"
        class="layout-header-left__logo"
      />
    </div>
    <div class="layout-header__right layout-header-right">
      <header-notification />
      <div class="layout-header-right__name">{{ user.name }}</div>
      <app-avatar
        class="layout-header-right__avatar"
        :image="avatar"
        :full-name="user.name"
        size="large"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'LayoutHeader',
  computed: {
    user() {
      return this.$auth.user
    },
    avatar() {
      return this.user.profile_picture
    },
    products() {
      const nameShop = this.$auth.user.company_domain || ''
      return [
        {
          name: 'Web',
          domain: process.env.DOMAIN_WEB,
        },
        {
          name: 'POS',
          domain: `${this.$store.state.protocol}${nameShop}${process.env.DOMAIN_POS}`,
        },
        {
          name: 'Distribution',
          domain: process.env.DOMAIN_DISTRIBUTION,
        },
        {
          name: 'KOL',
          domain: process.env.DOMAIN_KOL,
        },
        {
          name: 'CRM',
          domain: process.env.DOMAIN_CRM,
        },
      ]
    },
  },
  methods: {
    handleGoProduct(product) {
      window.open(product.domain, '_blank')
    },
    handleGoSSOHome() {
      window.open(process.env.DOMAIN_SSO, '_blank')
    },
  },
}
</script>

<style scoped lang="less">
.layout-header {
  top: 0;
  left: 0;
  width: 100%;
  height: @height-header;
  background-color: @white;
  padding: 0.25rem @padding-container;
  z-index: 999;
  @apply fixed flex items-center justify-between;
}

.layout-header-left {
  @apply flex items-center;

  &__apps {
    width: @size-16;
    height: auto;
    margin-right: 2rem;
    @apply cursor-pointer;
  }

  &__logo {
    width: 14rem;
    height: auto;
  }
}

.layout-header-right {
  @apply flex items-center;

  &__name {
    color: @black;
    font-size: @size-16;
    padding-right: 1rem;
    @apply font-medium;
  }

  &__avatar {
    width: 4.4rem;
    height: 4.4rem;
    object-fit: cover;
    border-radius: 50%;
    background-color: @primary-2;
    @apply flex items-center justify-center;
  }
}

.products {
  padding: 1rem;

  &__title {
    font-size: @size-16;
    color: @black;
    @apply font-medium;
  }

  &__body {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 3rem;
    row-gap: 2rem;
    margin: 1rem 0 2rem;
    @apply grid;

    &--image {
      width: 100px;
      height: auto;
      @apply cursor-pointer;
    }
  }

  &__footer {
    color: @primary;
    font-size: @size-14;
    @apply font-semibold;

    &--icon {
      color: @primary;
      @apply align-baseline;
    }
  }
}
</style>
