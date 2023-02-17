<template>
  <a-popover v-model="visible" placement="bottom" trigger="click">
    <template slot="content">
      <div class="email-template-change-language">
        <div class="email-template-change-language__title">
          {{ $t('choose-default-language-to-send-to-email') }}
        </div>
        <div class="email-template-change-language__description">
          {{
            $t(
              'you-can-choose-1-of-2-languages-below-to-send-emails-to-customers'
            )
          }}
        </div>
        <a-form-model
          ref="formEmailTemplateChangeLanguage"
          :colon="false"
          class="email-template-change-language__form email-template-change-language-form"
        >
          <a-form-model-item ref="language" prop="language">
            <a-radio-group v-model="languageInline">
              <template v-for="(locale, index) in locales">
                <a-radio :key="index" :style="radioStyle" :value="locale.code">
                  {{ locale.name }}
                </a-radio>
              </template>
            </a-radio-group>
          </a-form-model-item>
        </a-form-model>
        <div class="email-template-change-language__actions">
          <a-button type="secondary" @click="handleClose">
            {{ $t('cancel') }}
          </a-button>
          <a-button type="primary" class="ml-2" @click="handleSave">
            {{ $t('save') }}
          </a-button>
        </div>
      </div>
    </template>
    <a-button type="secondary">
      {{ $t('choose-language') }}
    </a-button>
  </a-popover>
</template>

<script>
export default {
  name: 'EmailTemplateChangeLanguage',
  props: {
    language: {
      type: String,
      default: 'en',
    },
  },
  data() {
    return {
      radioStyle: {
        display: 'flex',
        alignItems: 'center',
        lineHeight: 1,
        fontSize: '1.4rem',
        fontWeight: 500,
        color: '#22313F',
        margin: '0.8rem 0',
      },
      visible: false,
      languageInline: '',
      rules: {},
    }
  },
  computed: {
    locales() {
      return this.$i18n.locales
    },
    currentLocale() {
      const current = this.locales.find(
        (locale) => locale.code === this.$i18n.locale
      )
      return current
    },
  },
  created() {
    this.languageInline = this.language
  },
  methods: {
    handleClose() {
      this.visible = false
      this.languageInline = this.language
    },
    handleSave() {
      this.$emit('update', this.languageInline)
    },
  },
}
</script>

<style lang="less" scoped>
.email-template-change-language {
  max-width: 21.5rem;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }

  &__description {
    color: @gray-3;
    font-size: @size-14;
    margin-top: 1rem;
  }

  &__form {
    margin-top: 0.5rem;
  }

  &__actions {
    @apply text-right;
  }
}
</style>
