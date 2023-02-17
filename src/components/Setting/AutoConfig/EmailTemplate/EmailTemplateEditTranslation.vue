<template>
  <a-drawer
    width="30vw"
    :closable="false"
    :visible="isShow"
    class="email-template-edit-translation"
    @close="handleClose"
  >
    <span class="email-template-edit-translation__close" @click="handleClose">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <div class="email-template-edit-translation__content">
      <div class="email-template-edit-translation-content">
        <div class="email-template-edit-translation-content__header">
          <div class="email-template-edit-translation-content__header--title">
            {{ $t('edit-translation') }}
          </div>
          <a-select
            v-model="language"
            style="width: 190px; margin-left: 0.5rem"
            @change="handleChangeLanguage"
          >
            <template v-for="(item, index) in languageOptions">
              <a-select-option :key="index" :value="item.code">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </div>
        <div class="email-template-edit-translation-content__form">
          <email-template-form
            :form="form"
            :key="language"
            @update="handleUpdateForm"
          />
        </div>
        <div class="email-template-edit-translation-content__actions">
          <a-button @click="handleClose">
            {{ $t('cancel') }}
          </a-button>
          <a-button
            type="primary"
            :disabled="isDisableButtonSave || loading"
            @click="handleSave"
          >
            <a-icon v-if="loading" type="loading" />
            {{ $t('save') }}
          </a-button>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { get } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)
export default {
  name: 'EmailTemplateEditTranslation',
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    templates: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      language: '',
      formInit: {},
      form: {
        emailSubject: '',
        greetingMessage: '',
        closingMessage: '',
      },
      loading: false,
      rules: {},
      currentTemplate: {},
    }
  },
  computed: {
    currentLanguage() {
      return this.templates.find((item) => item.default_language === 1)
    },
    listEditTranslation() {
      return this.templates.filter(
        (item) => item.language !== this.currentLanguage.language
      )
    },
    isDisableButtonSave() {
      return (
        (this.form.emailSubject === this.formInit.emailSubject &&
          this.form.greetingMessage === this.formInit.greetingMessage &&
          this.form.closingMessage === this.formInit.closingMessage) ||
        false
      )
    },
    languageOptions() {
      return this.$i18n.locales.filter(
        (item) => item.code !== this.currentLanguage.language
      )
    },
  },
  created() {
    this.currentTemplate = this.listEditTranslation[0]
    this.handleChangeTemplate()
  },
  methods: {
    handleChangeLanguage(value) {
      this.currentTemplate = this.listEditTranslation.find(
        (item) => item.language === value
      )
      this.handleChangeTemplate()
    },
    handleChangeTemplate() {
      this.language = get(this.currentTemplate, 'language', '') || ''
      this.form.emailSubject = get(this.currentTemplate, 'subject', '') || ''
      this.form.greetingMessage =
        get(this.currentTemplate, 'greeting_message', '') || ''
      this.form.closingMessage =
        get(this.currentTemplate, 'closing_message', '') || ''
      this.formInit = { ...this.form }
    },
    handleUpdateForm(form) {
      this.form = { ...form }
    },
    handleClose() {
      this.$emit('close')
    },
    async handleSave() {
      this.loading = true
      try {
        const payload = {
          subject: this.form.emailSubject,
          greeting_message: this.form.greetingMessage,
          closing_message: this.form.closingMessage,
        }

        const { data } = await this.$api.emailTemplate.updateEmailTemplate(
          this.currentTemplate.id,
          payload
        )

        if (data) {
          this.$emit('reload')
          this.handleClose()
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
          })
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.email-template-edit-translation {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    cursor: pointer;
    z-index: 10;

    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }

  &.ant-drawer-open {
    /deep/ .ant-drawer-content {
      @apply overflow-visible;

      .ant-drawer-body {
        height: 100%;
        padding: 0;
        @apply overflow-auto;
      }
    }
  }
}

.email-template-edit-translation-content {
  min-height: 100vh;
  padding: @padding-40 @padding-24;
  @apply relative;

  &__header {
    margin-bottom: 1rem;
    @apply flex justify-between;

    &--title {
      color: @black;
      font-size: @size-20;
      @apply font-semibold;
    }
  }

  &__actions {
    width: 100%;
    left: 0;
    bottom: 0;
    background-color: @white;
    padding: 1rem 1.5rem;
    box-shadow: 8px 0 24px rgba(25, 32, 56, 0.04);
    @apply absolute text-right;
  }
}
</style>
