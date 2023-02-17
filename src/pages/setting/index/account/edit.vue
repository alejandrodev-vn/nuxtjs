<template>
  <div class="account-edit-page">
    <div class="account-edit-page__avatar">
      <div class="button-upload">
        <label for="file-input-upload">
          <span class="button-upload__icon">
            <i class="fas fa-pen" />
          </span>
        </label>

        <input
          id="file-input-upload"
          type="file"
          class="button-upload__input"
          @change="handleUploadImage"
        />
      </div>
      <img
        v-if="form.image"
        :src="form.image"
        alt="Prime CRM"
        class="account-edit-page__avatar--image"
      />
      <span v-else class="account-edit-page__avatar--name">
        {{ shortName }}
      </span>
    </div>
    <div class="account-edit-page__form">
      <a-form-model ref="form" :model="form" :rules="rules" :colon="false">
        <a-form-model-item ref="name" :label="$t('full-name')" prop="name">
          <a-input v-model="form.name"></a-input>
        </a-form-model-item>
        <a-form-model-item ref="role" :label="$t('role')" prop="role">
          <a-input v-model="form.role" disabled></a-input>
        </a-form-model-item>
        <a-form-model-item ref="email" :label="$t('email')" prop="email">
          <a-input v-model="form.email" disabled></a-input>
        </a-form-model-item>
        <a-form-model-item ref="phone" :label="$t('phone')" prop="phone">
          <a-input v-model="form.phone"></a-input>
        </a-form-model-item>
        <a-form-model-item
          ref="birthday"
          :label="$t('birthday')"
          prop="birthday"
        >
          <date-picker
            v-model="form.birthday"
            :disabled-date="disabledDate"
            :clearable="false"
            value-type="format"
            format="DD/MM/YYYY"
          ></date-picker>
        </a-form-model-item>
        <a-form-model-item ref="gender" :label="$t('gender')" prop="gender">
          <a-select v-model="form.gender" class="custom-select" size="large">
            <a-select-option
              v-for="(item, index) in genderOptions"
              :key="index"
              :value="item.value"
            >
              {{ item.text }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item ref="address" :label="$t('address')" prop="address">
          <a-input v-model="form.address"></a-input>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div class="account-edit-page__actions">
      <a-button @click="handleCancel">
        {{ $t('cancel') }}
      </a-button>
      <a-button
        type="primary"
        :disabled="loading || !isChangeForm"
        @click="handleSave"
      >
        <a-icon v-if="loading" type="loading" />
        {{ $t('save') }}
      </a-button>
    </div>
  </div>
</template>

<script>
import { get, isEqual } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '../../../../utils'
Vue.use(notification)

export default {
  name: 'AccountEditPage',
  data() {
    return {
      loading: false,
      form: {},
      formInit: {},
      file: null,
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
    user() {
      return this.$auth.user
    },
    avatar() {
      return this.user.profile_picture
        ? this.user.profile_picture
        : require('~/assets/images/Icon/No-Image.png')
    },
    shortName() {
      const arrayLetter = this.user.name.split(' ').map((x) => {
        return x.charAt(0).toUpperCase()
      })
      return arrayLetter.join('')
    },
    genderOptions() {
      const gender = this.$store.state.gender
      const options = Object.keys(gender).reduce((result, item) => {
        return [
          ...result,
          {
            text: this.$t(item),
            value: gender[item],
          },
        ]
      }, [])
      return options
    },
    isChangeForm() {
      return !isEqual(this.formInit, this.form)
    },
    rules() {
      return {
        name: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          {
            min: 2,
            max: 20,
            message: this.$t('full-name-min-max-length-required'),
            trigger: 'blur',
          },
        ],
        phone: [
          {
            message: this.$t('field-is-required'),
            required: true,
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
      }
    },
  },
  created() {
    const role = get(this.user, 'roles[0]', '') || ''
    this.formInit = {
      name: this.user.name,
      role: this.$t(role),
      email: this.user.email,
      phone: this.user.phone,
      birthday: this.user.birth_date
        ? this.$moment(this.user.birth_date).format('DD/MM/YYYY')
        : null,
      gender: this.user.gender,
      address: this.user.address,
      image: this.avatar,
    }
    this.form = { ...this.formInit }
  },
  methods: {
    disabledDate(date) {
      return date > new Date(new Date().setHours(0, 0, 0, 0))
    },
    handleUploadImage(e) {
      this.file = e.target.files[0] || null
      if (this.file) {
        this.form.image = URL.createObjectURL(this.file)
      }
    },
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
        const payload = new FormData()
        payload.append('name', this.form.name)
        if (this.form.gender) {
          payload.append('gender', this.form.gender)
        }
        if (this.form.phone) {
          payload.append('phone', this.form.phone)
        }
        if (this.form.birthday) {
          const birthday = this.$moment(
            this.form.birthday,
            'DD/MM/YYYY'
          ).format('YYYY-MM-DD')
          payload.append('birth_date', birthday)
        }
        if (this.form.address) {
          payload.append('address', this.form.address)
        }
        if (this.file) {
          payload.append('profile_picture', this.file)
        }

        const { data } = await this.$api.user.updateUser(this.user.id, payload)

        if (data) {
          await this.$auth.fetchUser()
          this.$router.push(this.localePath({ path: '/setting/account' }))
          this.form = { ...this.formInit }
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
  },
}
</script>

<style lang="less" scoped>
.account-edit-page {
  padding: 0 1rem 5rem;
  @apply flex flex-wrap;

  &__avatar {
    flex: 0 0 26.8rem;
    height: 26.8rem;
    border-radius: 50%;
    background-color: @primary-3;
    margin: 0 auto;
    margin-right: 6rem;
    @apply overflow-hidden relative;

    &:hover {
      .button-upload {
        opacity: 1;
        @apply visible;
      }
    }

    &--image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &--name {
      width: 100%;
      height: 100%;
      font-size: 5rem;
      line-height: 1;
      color: @primary;
      @apply flex items-center justify-center font-semibold;
    }
  }

  &__form {
    flex: 1;
    padding: 0 1rem;
    .desktop({
        padding: 0 1.5rem;
    });

    /deep/.ant-form-item {
      max-width: 40rem;
      margin-bottom: 1rem;

      .mx-datepicker {
        width: 100%;

        .mx-input {
          height: @height-field;
        }
      }
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

.button-upload {
  opacity: 0;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(@axes, 0.5);
  transition: opacity 0.5s ease, visibility 0.5s ease;
  @apply absolute invisible;

  label {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    @apply flex items-center justify-center cursor-pointer;
  }

  &__input {
    @apply hidden;
  }

  &__icon {
    font-size: @size-1;
    line-height: 1;

    i {
      color: white;
    }
  }
}
/deep/.custom-select {
  color: @black;
  height: @height-field;
  @apply mb-2;
  &.ant-select-disabled {
    .ant-select-selection {
      background-color: @white;
      cursor: default;
    }
  }
  .ant-select-selection {
    border-color: @gray-4;
    height: @height-field;
    &__rendered {
      line-height: @height-field;
    }
  }
  .ant-select-arrow {
    color: @black;
  }
}
</style>
