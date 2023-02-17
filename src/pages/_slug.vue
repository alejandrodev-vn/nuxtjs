<template>
  <div class="landing-page">
    <img
      class="signature-img signature-img--top"
      src="~/assets/images/WhatsApp/OrderFormSignatureTop.png"
      alt="Social CRM"
    />
    <img
      class="signature-img signature-img--bottom"
      src="~/assets/images/WhatsApp/OrderFormSignatureBottom.png"
      alt="Social CRM"
    />
    <div class="landing-page__language">
      <a-dropdown :trigger="['click']">
        <a-menu slot="overlay">
          <a-menu-item v-for="locale in $i18n.locales" :key="locale.code">
            <nuxt-link
              :to="switchLocalePath(locale.code)"
              class="select-languages-option"
            >
              <country-flag
                :country="locale.flag"
                size="normal"
                class="select-languages-option__flag"
                rounded
              ></country-flag>
              <span class="select-languages-option__name">
                {{ locale.name }}
              </span>
            </nuxt-link>
          </a-menu-item>
        </a-menu>
        <a-button class="select-languages-button">
          <country-flag
            :country="currentLocale.flag"
            size="normal"
            rounded
            class="select-languages-button__flag"
          ></country-flag>
          <span class="select-languages-button__name">
            {{ currentLocale.name }}
          </span>
          <a-icon type="down" class="select-languages-button__icon" />
        </a-button>
      </a-dropdown>
    </div>
    <div class="landing-page__form">
      <div class="landing-page-form">
        <div class="landing-page-form__image">
          <img
            src="@/assets/images/WhatsApp/Logo-Social-CRM.png"
            alt="Social CRM"
          />
          <img src="@/assets/images/WhatsApp/WhatsApp.png" alt="WhatsApp" />
        </div>
        <p class="landing-page-form__title">
          {{ $t('whatsapp-order-form') }}
        </p>
        <div class="landing-page-form__description">
          <p class="italic font-bold">
            {{ $t('thanks-for-your-interest-in-our-shop') }}
          </p>
          <p>
            <i>
              {{
                $t(
                  'please-enter-the-information-below-and-there-are-two-options-for-you'
                )
              }}
            </i>
          </p>
          <ul>
            <li>
              <i>{{ $t('send-a-message-to') }}</i>
              <strong>{{ orderForm.name }}</strong>
              <i>{{ $t('for-purchase-consultation') }}</i>
            </li>
            <li>
              <i>{{ $t('buy-now-order-directly-on-the-website') }}</i>
            </li>
          </ul>
        </div>
        <a-form-model
          ref="form"
          :model="form"
          :rules="rules"
          :colon="false"
          hide-required-mark
        >
          <a-form-model-item ref="name" prop="name">
            <template slot="label">
              <div class="flex items-center">
                <a-icon type="user" />
                <span class="ml-3">{{ $t('name') }}*</span>
              </div>
            </template>
            <a-input v-model="form.name" :placeholder="$t('enter-name')" />
          </a-form-model-item>
          <a-form-model-item ref="phone" prop="phone">
            <template slot="label">
              <div class="flex items-center">
                <a-icon type="phone" />
                <span class="ml-3">{{ $t('phone-number') }}*</span>
              </div>
            </template>
            <a-input
              v-model="form.phone"
              :placeholder="$t('enter-phone-number')"
            />
          </a-form-model-item>
          <a-form-model-item ref="email" prop="email">
            <template slot="label">
              <div class="flex items-center">
                <a-icon type="mail" />
                <span class="ml-3">{{ $t('email') }}</span>
              </div>
            </template>
            <a-input v-model="form.email" :placeholder="$t('enter-email')" />
          </a-form-model-item>
        </a-form-model>
        <div class="landing-page-form__actions">
          <a-button
            type="primary"
            :disabled="loading"
            class="btn-success"
            @click="handleSendMessage"
          >
            <a-icon v-if="loading" type="loading" />
            <i v-else class="fab fa-whatsapp mr-2"></i>
            {{ $t('send-message') }}
          </a-button>
          <span class="horizontal-line">{{ $t('or') }}</span>
          <a-button type="primary" @click="handleBuyNow">
            <i class="far fa-cart-plus mr-2"></i>
            {{ $t('buy-now') }}
          </a-button>
        </div>
        <div class="landing-page-form__footer">
          <img
            src="~/assets/images/Logo/Logo-Prime.png"
            class="landing-page-form__footer__logo"
            alt="Prime Commerce"
          />
          <p class="landing-page-form__footer__copyright">
            Powered by Prime Commerce
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'callback',
  auth: false,
  async asyncData({ app, params, error }) {
    try {
      const shortTitle = params.slug

      const { data } = await app.$axios.$get(`${shortTitle}`)
      if (data) {
        return { orderForm: data }
      }
    } catch (e) {
      return error({ statusCode: 404, message: e })
    }
  },
  data() {
    return {
      loading: false,
      form: {
        name: '',
        phone: '',
        email: '',
      },
      rules: {
        name: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          {
            min: 1,
            max: 20,
            message: this.$t('name-min-max-length-required'),
            trigger: 'blur',
          },
        ],
        phone: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          {
            // pattern: /(^84|^60)[0-9]{8,9}\s*$/g,
            pattern: /^[0-9]*\s*$/g,
            message: this.$t('validateFormatPhone'),
            trigger: 'blur',
          },
          {
            max: 11,
            message: this.$t('validateFormatPhoneMax'),
            trigger: 'blur',
          },
          {
            min: 10,
            message: this.$t('validateFormatPhoneMin'),
            trigger: 'blur',
          },
        ],
        email: [
          {
            // eslint-disable-next-line no-useless-escape
            pattern: /^\w+([\.+-]?\w+)*@\w+([\.+-]?\w+)*(\.\w{2,9})+$/,
            message: this.$t('email-format-required'),
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    currentLocale() {
      const current = this.$i18n.locales.find(
        (locale) => locale.code === this.$i18n.locale
      )
      this.$axios.setHeader('X-localization', current.code)
      return current
    },
    linkMessage() {
      if (!this.orderForm?.company_domain?.length)
        return `${process.env.DOMAIN_WEB_FE}404`
      const text = this.$t('template-greeting-whatsapp', {
        name: this.form.name,
        link: `https://${this.orderForm.company_domain}${process.env.DOMAIN_WEB_FE}products`,
      })
      return `https://api.whatsapp.com/send/?phone=${this.orderForm.phone}&app_absent=0&text=${text}`
    },
    linkProducts() {
      if (!this.orderForm?.company_domain?.length)
        return `${this.orderForm.company_domain}${process.env.DOMAIN_WEB}404`
      return `http://${this.orderForm.company_domain}${process.env.DOMAIN_WEB_FE}products`
    },
  },
  methods: {
    handleSendMessage() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.handleSubmit()
        }
      })
    },
    handleBuyNow() {
      const url = this.linkProducts
      window.open(url, '_blank')
    },
    handleSubmit() {
      const url = this.linkMessage
      window.open(url)
    },
  },
}
</script>

<style lang="less" scoped>
.landing-page {
  padding: 2rem;
  position: relative;
  background: linear-gradient(280.96deg, #cdf 1.66%, #cff 100%);
  min-height: 100vh;
  .signature-img {
    position: absolute;
    &--top {
      left: 0;
      top: 0;
      width: 20%;
    }
    &--bottom {
      right: 0;
      bottom: 0;
      width: 30%;
    }
  }
  &__language {
    margin-bottom: 1rem;
    /deep/.select-languages-button {
      border-radius: @border-radius-base;
      border: none;
      height: @height-table;
      width: 30rem;
      @apply flex items-center ml-auto;

      &__flag {
        &.flag {
          border-radius: @border-radius-base;
          margin: 0 -0.25rem 0 -1rem;
        }
      }

      &__name {
        color: @black;
        line-height: 1;
        margin-right: 1rem;
        @apply font-normal;
      }

      &__icon {
        &.anticon {
          color: @black;
          margin-left: auto;
        }
      }
    }
  }

  &__form {
    max-width: 69.4rem;
    margin: 0 auto;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
    border-radius: 24px;
    padding: @padding-24 3.2rem;
    background-color: @white;
    position: relative;
    z-index: 10;
    p {
      margin-bottom: 0;
      font-size: @size-16;
      line-height: @size-32;
    }
    /deep/.ant-col.ant-form-item-label {
      margin-bottom: @margin-8;
      label {
        display: block;
        color: #1c1c1e;
        line-height: 0;
        span {
          font-weight: 300;
        }
      }
    }
  }
}

.landing-page-form {
  &__image {
    @apply flex items-center justify-center;
    img {
      width: 6.4rem;
      height: 6.4rem;
      object-fit: contain;
      &:nth-child(2) {
        margin-left: @margin-24;
      }
    }
  }

  /deep/&__title {
    font-size: @size-24 !important;
    color: @black;
    margin-top: @margin-24;
    @apply font-semibold text-center;
  }
  .ant-form {
    .ant-row {
      margin-bottom: 3.7rem;
      .ant-input {
        height: @height-field;
      }
    }
  }
  &__description {
    color: @black;
    font-size: @size-16;
    margin-top: 1.5rem;
    margin-bottom: @margin-24;

    ul {
      list-style-type: decimal;
      padding-left: 1.25rem;
      font-style: italic;
      li {
        font-size: @size-16;
        line-height: @size-32;
      }
      strong {
        font-style: normal;
      }
    }
  }

  &__actions {
    margin-top: 3.7rem;
    /deep/.ant-btn {
      height: @height-field;
      font-weight: 500;
      font-size: @size-14;
      line-height: @size-22;
      width: 100%;
      @apply block;
      &.btn-success {
        background-color: #20b038;
        border-color: #20b038;
      }
    }
    .horizontal-line {
      display: block;
      margin-block: @margin-24;
      text-align: center;
      color: #1c1c1e;
      font-weight: 300;
      font-size: @size-14;
      line-height: @size-26;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 47%;
        height: 0.1rem;
        background-color: @black-gray;
      }
      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 47%;
        height: 0.1rem;
        background-color: @black-gray;
      }
    }
  }

  &__footer {
    margin-top: @margin-24;
    @apply flex flex-col items-center justify-center text-center mx-auto;
    &__logo {
      width: 6.2rem;
    }
    &__copyright {
      font-size: @size-12 !important;
      color: #333;
    }
  }
}

.select-languages-option {
  @apply flex items-center;

  &__flag {
    &.flag {
      border-radius: @border-radius-base;
      margin: 0 -0.25rem 0 -0.75rem;
    }
  }

  &__name {
    color: @black;
    line-height: 1;
  }
}
</style>
