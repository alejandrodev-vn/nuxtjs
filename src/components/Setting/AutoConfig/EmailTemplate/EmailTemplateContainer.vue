<template>
  <div class="email-template-container">
    <app-loading v-if="$fetchState.pending" />
    <template v-else>
      <div>
        <div class="email-template-container__header">
          <div class="flex items-center">
            <div class="email-template-container-title">
              {{ $t(type) }}
            </div>
            <div class="email-template-container-switch">
              <app-switch
                ref="switchStatus"
                :checked="status === 1"
                :item="{ status }"
                :title="getTitleSwitchStatus(status)"
                :content="getContentSwitchStatus(status)"
                @confirm="handleUpdateStatus"
              />
              <span class="email-template-container-switch__title">
                {{ $t('on') }}
              </span>
              <a-popover placement="bottom">
                <template slot="content">
                  {{ $t(`${type}-tooltip`) }}
                </template>
                <i class="fal fa-info-circle custom-icon-info"></i>
              </a-popover>
            </div>
          </div>
          <div>
            <email-template-change-language
              :language="language"
              @update="handleUpdateLanguage"
            />
            <a-button
              type="secondary"
              class="ml-2"
              @click="handleOpenEditTranslation"
            >
              <i class="far fa-language custom-icon-language"></i>
              {{ $t('edit-translation') }}
            </a-button>
            <img
              src="@/assets/images/EmailTemplate/Icon-light-bulb.png"
              alt="Prime CRM"
              class="custom-button-setup"
              @click="handleOpenModalSetup"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-4">
          <email-template-form :form="form" @update="handleUpdateForm" />
          <email-template-preview-bahasa
            v-if="language === 'ms'"
            :type="type"
            :form="form"
          />
          <email-template-preview-english v-else :type="type" :form="form" />
        </div>
      </div>
      <div class="email-template-container__actions">
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

      <email-template-setup-modal ref="emailTemplateSetupModal" />
      <component
        :is="isTypeComponent"
        :is-show="isShowEditTranslation"
        :templates="dataLanguages"
        @reload="fetchEmailTemplates"
        @close="handleCloseEditTranslation"
      ></component>
    </template>
  </div>
</template>

<script>
import { get } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import EmailTemplateEditTranslation from '@/components/Setting/AutoConfig/EmailTemplate/EmailTemplateEditTranslation'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'EmailTemplateContainer',
  fetchOnServer: false,
  components: {
    // eslint-disable-next-line vue/no-unused-components
    edit: EmailTemplateEditTranslation,
  },
  data() {
    return {
      loading: false,
      type: '',
      id: '',
      language: '',
      status: 1,
      dataLanguages: [],
      formInit: {},
      form: {
        emailSubject: '',
        greetingMessage: '',
        closingMessage: '',
      },
      isShowEditTranslation: false,
      isTypeComponent: '',
    }
  },
  async fetch() {
    await this.fetchEmailTemplates()
  },
  computed: {
    isDisableButtonSave() {
      return (
        (this.form.emailSubject === this.formInit.emailSubject &&
          this.form.greetingMessage === this.formInit.greetingMessage &&
          this.form.closingMessage === this.formInit.closingMessage) ||
        false
      )
    },
  },
  methods: {
    handleClose() {
      this.$router.push(
        this.localePath({
          path: `/setting/auto-config`,
        })
      )
    },
    async fetchEmailTemplates() {
      try {
        const params = {
          'filter[type_id]': this.$store.state.emailTemplateType[this.type],
        }
        const { data } = await this.$api.emailTemplate.getEmailTemplates(params)
        if (data) {
          this.dataLanguages = [...data]
          const dataCurrentLanguage = this.dataLanguages.find(
            (item) => item.default_language === 1
          )
          this.form.emailSubject = get(dataCurrentLanguage, 'subject', '') || ''
          this.form.greetingMessage =
            get(dataCurrentLanguage, 'greeting_message', '') || ''
          this.form.closingMessage =
            get(dataCurrentLanguage, 'closing_message', '') || ''
          this.formInit = { ...this.form }
          this.status = get(dataCurrentLanguage, 'status', 0) || 0
          this.language = get(dataCurrentLanguage, 'language', 'en') || 'en'
          this.id = get(dataCurrentLanguage, 'id', '') || ''
        }
      } catch (err) {}
    },
    getTitleSwitchStatus(status) {
      if (status === 1) {
        return this.$t('confirm-to-unpublish-email-type', {
          type: this.$t(this.type),
        })
      }
      return this.$t('confirm-to-publish-email-type', {
        type: this.$t(this.type),
      })
    },
    getContentSwitchStatus(status) {
      if (status === 1) {
        return this.$t('click-confirm-if-you-want-to-unpublish-email-type', {
          type: this.$t(this.type),
        })
      }
      return this.$t('click-confirm-if-you-want-to-publish-email-type', {
        type: this.$t(this.type),
      })
    },
    async handleUpdateStatus(value) {
      const status = value.status === 1 ? 0 : 1
      try {
        const payload = {
          status,
        }
        const { data } =
          await this.$api.emailTemplate.updateEmailTemplateStatus(
            this.id,
            payload
          )

        if (data) {
          this.status = status
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
      }
      this.$refs.switchStatus.handleCloseModal()
    },
    handleUpdateForm(form) {
      this.form = { ...form }
    },
    handleOpenEditTranslation() {
      this.isShowEditTranslation = true
      this.isTypeComponent = 'edit'
    },
    handleCloseEditTranslation() {
      this.isShowEditTranslation = false
      this.isTypeComponent = ''
    },
    handleOpenModalSetup() {
      this.$refs.emailTemplateSetupModal.show()
    },
    async handleUpdateLanguage(language) {
      try {
        const payload = {
          language,
          type_id: this.$store.state.emailTemplateType[this.type],
        }
        const { data } =
          await this.$api.emailTemplate.updateEmailTemplateLanguage(payload)

        if (data) {
          await this.$fetch()
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
      }
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
          this.id,
          payload
        )

        if (data) {
          this.$fetch()
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
.email-template-container {
  height: 100%;
  @apply flex flex-col justify-between;

  &__header {
    @apply flex items-center justify-between;
    /deep/.ant-btn-secondary {
      color: @black;
      @apply font-medium;
    }
  }

  &__actions {
    padding: 1rem 0;
    @apply text-right;
  }
}

.email-template-container-title {
  font-size: @size-20;
  color: @black;
  @apply font-semibold;
}

.email-template-container-switch {
  margin-left: 4rem;
  @apply flex items-center justify-between;

  &__title {
    color: @black;
    margin: 0 0.5rem 0 0.75rem;
    @apply block font-semibold;
  }
}

.custom-icon-info {
  color: #323232;
}

.custom-icon-language {
  font-size: 1.5rem;
  vertical-align: middle;
  margin-right: 0.5rem;
}

.custom-button-setup {
  width: @width-btn-trigger;
  height: @width-btn-trigger;
  margin-left: 0.5rem;
  @apply inline-block cursor-pointer duration-500;
  &:hover {
    transform: scale(1.1);
  }
}
</style>
