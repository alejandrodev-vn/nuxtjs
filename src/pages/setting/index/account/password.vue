<template>
  <div class="change-password-page">
    <div class="change-password-page__form">
      <a-form-model ref="form" :model="form" :rules="rules" :colon="false">
        <a-form-model-item
          ref="old_password"
          :label="$t('old-password')"
          prop="old_password"
        >
          <a-input-password
            v-model="form.old_password"
            :placeholder="$t('placeholder')"
          ></a-input-password>
        </a-form-model-item>
        <a-form-model-item
          ref="new_password"
          :label="$t('new-password')"
          prop="new_password"
        >
          <a-input-password
            v-model="form.new_password"
            :placeholder="$t('placeholder')"
          ></a-input-password>
        </a-form-model-item>
        <a-form-model-item
          ref="confirm_new_password"
          :label="$t('confirm-new-password')"
          prop="confirm_new_password"
        >
          <a-input-password
            v-model="form.confirm_new_password"
            :placeholder="$t('placeholder')"
          ></a-input-password>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div class="change-password-page__actions">
      <a-button @click="handleCancel">
        {{ $t('cancel') }}
      </a-button>
      <a-button
        type="primary"
        :disabled="loading || isEmptyForm"
        @click="handleSave"
      >
        <a-icon v-if="loading" type="loading" />
        {{ $t('save') }}
      </a-button>
    </div>
  </div>
</template>

<script>
import { get, isEmpty } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '../../../../utils'
Vue.use(notification)

export default {
  name: 'ChangePasswordPage',
  data() {
    const checkNewPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('field-is-required')))
      } else if (value.length < 6 || value.length > 50) {
        callback(new Error(this.$t('password-min-max-length-required')))
      } else if (value !== this.form.new_password) {
        callback(new Error(this.$t('new-password-does-not-match')))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      form: {
        old_password: '',
        new_password: '',
        confirm_new_password: '',
      },
      rules: {
        old_password: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          {
            min: 6,
            max: 50,
            message: this.$t('password-min-max-length-required'),
            trigger: 'blur',
          },
        ],
        new_password: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          {
            min: 6,
            max: 50,
            message: this.$t('password-min-max-length-required'),
            trigger: 'blur',
          },
        ],
        confirm_new_password: [
          { validator: checkNewPassword, trigger: 'blur' },
        ],
      },
    }
  },
  fetch({ app, redirect }) {
    const role = get(app, 'store.state.auth.user.roles[0]', '') || ''
    if (role === 'owner') {
      const defaultLocale = app.i18n.defaultLocale
      const locale = app.store.state.i18n.locale
      const url =
        locale === defaultLocale
          ? '/setting/account'
          : `/${locale}/setting/account`

      redirect(url)
    }
  },
  computed: {
    isEmptyForm() {
      return (
        isEmpty(this.form.old_password) ||
        isEmpty(this.form.new_password) ||
        isEmpty(this.form.confirm_new_password)
      )
    },
  },
  methods: {
    handleCancel() {
      this.$router.push(
        this.localePath({
          path: '/setting/account',
        })
      )
    },
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.handleSubmit()
        }
      })
    },
    async handleSubmit() {
      try {
        const payload = {
          current_password: this.form.old_password,
          new_password: this.form.new_password,
          new_password_confirmation: this.form.confirm_new_password,
        }

        // eslint-disable-next-line camelcase
        const { access_token } = await this.$api.user.updateUserPassword(
          payload
        )

        // eslint-disable-next-line camelcase
        if (access_token) {
          this.$auth
            .setUserToken(access_token)
            .then(() => {
              this.$router.push(this.localePath({ path: '/setting/account' }))
              notification.success({
                message: this.$t('success'),
                class: 'notification-success',
              })
            })
            .catch((e) => {
              this.$router.push(this.localePath({ path: '/' }))
            })
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.change-password-page {
  padding: 0 1rem 5rem;
  @apply flex flex-wrap;

  &__form {
    flex: 1;

    /deep/.ant-form-item {
      max-width: 40rem;
      margin-bottom: @margin-24;
    }
  }

  &__actions {
    width: 100%;
    background-color: @white;
    left: 0;
    bottom: 0;
    padding: 1rem 1.5rem;
    box-shadow: 8px 0 24px rgba(25, 32, 56, 0.04);
    @apply absolute text-right;
  }
}
</style>
