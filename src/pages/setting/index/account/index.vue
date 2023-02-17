<template>
  <div class="account-detail-page">
    <div class="account-detail-page__avatar">
      <app-avatar
        class="account-detail-page__avatar--image"
        :image="avatar"
        :full-name="user.name"
        :font-size="45"
      />
    </div>
    <div class="account-detail-page__form">
      <a-form-model :colon="false">
        <a-form-model-item :label="$t('full-name')">
          <a-input v-model="form.name" disabled></a-input>
        </a-form-model-item>
        <a-form-model-item :label="$t('role')">
          <a-input v-model="form.role" disabled></a-input>
        </a-form-model-item>
        <a-form-model-item :label="$t('email')">
          <a-input v-model="form.email" disabled></a-input>
        </a-form-model-item>
        <a-form-model-item :label="$t('phone')">
          <a-input v-model="form.phone" disabled></a-input>
        </a-form-model-item>
        <a-form-model-item :label="$t('birthday')">
          <a-input v-model="form.birthday" disabled></a-input>
        </a-form-model-item>
        <a-form-model-item :label="$t('gender')">
          <a-select
            v-model="form.gender"
            class="custom-select"
            size="large"
            disabled
          >
            <a-select-option
              v-for="(item, index) in genderOptions"
              :key="index"
              :value="item.value"
            >
              {{ item.text }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('address')">
          <a-input v-model="form.address" disabled></a-input>
        </a-form-model-item>
      </a-form-model>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'AccountDetailPage',
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
    form() {
      const role = get(this.user, 'roles[0]', '') || ''
      return {
        name: this.user.name,
        role: this.$t(role),
        email: this.user.email,
        phone: this.user.phone,
        birthday: this.user.birth_date
          ? this.$moment(this.user.birth_date).format('DD/MM/YYYY')
          : '',
        gender: this.user.gender,
        address: this.user.address,
      }
    },
  },
}
</script>

<style lang="less" scoped>
.account-detail-page {
  padding: @padding-24;
  @apply flex flex-wrap;

  &__avatar {
    flex: 0 0 26.8rem;
    height: 26.8rem;
    border-radius: 50%;
    background-color: @primary-3;
    margin: 0 auto;
    margin-right: 6rem;
    @apply overflow-hidden;

    &--image {
      width: 100%;
      height: 100%;
      object-fit: cover;
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
      margin-bottom: @margin-24;

      .ant-input-disabled {
        background-color: @white;
        @apply cursor-default;
      }

      .ant-select-disabled {
        .ant-select-selection {
          background-color: @white;
          @apply cursor-default;
        }
      }
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
