<template>
  <div class="guest-information">
    <h5 class="guest-information__title p-section">
      {{ $t('guestInformation') }}
    </h5>
    <app-loading v-if="$fetchState.pending || isLoading" />
    <app-no-data v-else-if="!guestId" :text="$t('noDataFound')" />
    <perfect-scrollbar
      v-else
      :options="{ suppressScrollX: true }"
      class="scroll-guest-information"
    >
      <div class="guest-information__basic-info">
        <app-avatar
          :image="infoFan.avatar"
          :full-name="infoFan.full_name"
          size="large"
          :font-size="35"
        />
        <app-tag v-if="levelGuest" :type="levelColor[levelGuest]">
          {{ $t(levelGuest) }}
        </app-tag>
        <p class="name">{{ infoFan.full_name }}</p>
        <span class="id-user">ID: {{ infoFan.social_profile_id }}</span>
      </div>
      <div class="guest-information__edit p-section">
        <div class="guest-information__edit__head">
          <h6 class="title-section">{{ $t('information') }}</h6>
          <a-button
            v-if="canEdit"
            class="btn-edit"
            :class="{ enableEditing }"
            type="primary"
            @click="handleEnableEditing"
          >
            <a-icon type="edit" />
          </a-button>
        </div>
        <div class="guest-information__edit__body" :class="{ canEdit }">
          <a-form-model ref="form" :model="form" :rules="rules">
            <a-row :gutter="12">
              <a-col :span="12">
                <a-form-model-item
                  ref="phone"
                  :label="$t('phone')"
                  prop="phone"
                  :colon="false"
                >
                  <a-input
                    v-model="form.phone"
                    :disabled="!enableEditing"
                  ></a-input>
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item
                  ref="gender"
                  :label="$t('gender')"
                  prop="gender"
                  :colon="false"
                >
                  <a-select
                    id="gender"
                    v-model="form.gender"
                    size="large"
                    class="custom-select"
                    style="width: 100%"
                    dropdown-class-name="select__dropdown"
                    :disabled="!enableEditing"
                    :placeholder="$t('gender')"
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
              </a-col>
            </a-row>
            <a-form-model-item
              ref="email"
              :label="$t('email')"
              prop="email"
              :colon="false"
            >
              <a-input
                v-model="form.email"
                :disabled="!enableEditing"
              ></a-input>
            </a-form-model-item>
            <a-form-model-item
              ref="address"
              :label="$t('address')"
              prop="address"
              :colon="false"
            >
              <a-input
                v-model="form.address"
                :disabled="!enableEditing"
              ></a-input>
            </a-form-model-item>
            <a-form-model-item
              ref="nation"
              prop="nation"
              :label="$t('nation')"
              :colon="false"
            >
              <a-select
                v-model="form.country"
                show-search
                option-filter-prop="children"
                size="large"
                class="custom-select"
                :disabled="!enableEditing"
                @change="handleChangeCountry"
              >
                <template v-for="(item, index) in nationOptions">
                  <a-select-option :key="index" :value="item.value">
                    {{ item.name }}
                  </a-select-option>
                </template>
              </a-select>
            </a-form-model-item>
            <a-form-model-item
              ref="city"
              prop="city"
              :label="$t('city')"
              :colon="false"
            >
              <a-select
                v-model="form.province"
                show-search
                size="large"
                option-filter-prop="children"
                class="custom-select"
                :disabled="!enableEditing"
                :loading="loadingProvince"
              >
                <template v-for="(item, index) in provinceOptions">
                  <a-select-option :key="index" :value="item.value">
                    {{ item.name }}
                  </a-select-option>
                </template>
              </a-select>
            </a-form-model-item>
          </a-form-model>
        </div>
      </div>
      <!-- <guest-information-orders-detail :info-fan="infoFan" /> -->
      <!-- <guest-information-current-tags-detail /> -->
    </perfect-scrollbar>
    <transition name="float-up">
      <div v-if="enableEditing" class="guest-information__footer">
        <a-button type="secondary" class="btn-cancel mr-4" @click="onCancel">
          {{ $t('cancel') }}
        </a-button>
        <a-button type="primary" class="btn-submit mr-4" @click="onSave">
          {{ $t('save') }}
        </a-button>
      </div>
    </transition>
  </div>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { get, invert } from 'lodash'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'GuestInformationDetail',
  fetchOnServer: false,
  data() {
    return {
      isLoading: false,
      canEdit: false,
      enableEditing: false,
      form: {
        phone: '',
        gender: null,
        email: '',
        address: '',
        country: null,
        province: null,
      },
      countries: [],
      provinces: [],
      loadingProvince: false,
      levelColor: this.$store.state.levelColor,
      infoFan: null,
    }
  },
  async fetch() {
    await this.fetchCurrentInfoFan()
    await this.fetchCountries()
  },
  computed: {
    guestId() {
      return this.$route.params.guest
    },
    levelType() {
      return invert(this.$store.state.level)
    },
    levelGuest() {
      return this.levelType[this.infoFan.level]
    },
    rules() {
      return {
        phone: [
          // {
          //   validator: this.validatePhone,
          //   trigger: 'blur',
          // },
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
            type: 'email',
            message: this.$t('validateFormatEmail'),
            trigger: 'blur',
          },
        ],
        address: [
          {
            max: 50,
            message: this.$t('validateLengthAddress'),
            trigger: 'blur',
          },
        ],
        location: [
          {
            max: 50,
            message: this.$t('validateLengthLocation'),
            trigger: 'blur',
          },
        ],
      }
    },
    nationOptions() {
      return this.countries.map((item, index) => {
        return {
          name: item.name,
          value: item.id,
        }
      })
    },
    provinceOptions() {
      return this.provinces.map((item) => {
        return {
          name: item.name,
          value: item.id,
        }
      })
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
  },
  watch: {
    guestId() {
      this.enableEditing = false
      this.fetchCurrentInfoFan()
    },
    infoFan() {
      this.handleInitData()
    },
  },
  mounted() {
    this.handleInitData()
  },
  methods: {
    async fetchCurrentInfoFan() {
      try {
        this.isLoading = true
        if (!this.guestId) return
        const { data } = await this.$api.fan.getInfoGuest(this.guestId)
        if (data) {
          this.infoFan = data
          this.$store.dispatch('updateCurrentInfoFan', data)
        }
      } catch (err) {
      } finally {
        this.isLoading = false
      }
    },
    handleInitData() {
      if (!this.infoFan) return
      this.canEdit =
        !this.infoFan.locked_by ||
        (this.infoFan.locked_by &&
          this.$auth.user.id === this.infoFan.locked_by.id)
      this.form = {
        ...this.form,
        phone: this.infoFan.phone,
        gender: this.infoFan.gender,
        email: this.infoFan.email,
        address: this.infoFan.address,
        country: get(this.infoFan, 'country.data.id', null),
        province: get(this.infoFan, 'province.data.id', null),
      }
      if (this.form.country) {
        this.fetchProvinces()
      }
    },
    handleEnableEditing() {
      this.enableEditing = !this.enableEditing
      if (!this.enableEditing) {
        this.onCancel()
      }
    },
    onSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.updateGuest()
        } else {
          return false
        }
      })
    },
    async updateGuest() {
      try {
        const payload = {
          ...(this.form.phone?.trim().length && {
            phone: this.form.phone.trim(),
          }),
          ...(this.form.gender && { gender: this.form.gender }),
          ...(this.form.email?.length && { email: this.form.email }),
          ...(this.form.address?.length && { address: this.form.address }),
          ...(this.form.country && { country_id: this.form.country }),
          province_id: this.form.province ? this.form.province : 0,
        }
        await this.$api.fan.updateInfoGuest(this.infoFan.id, payload)
        this.enableEditing = false
        notification.success({
          message: `${this.$t('saved')}!`,
          class: 'notification-success',
        })
        this.fetchCurrentInfoFan()
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    onCancel() {
      this.form = {
        ...this.form,
        phone: this.infoFan.phone,
        gender: this.infoFan.gender,
        email: this.infoFan.email,
        address: this.infoFan.address,
        country: get(this.infoFan, 'country.data.id', null),
        province: get(this.infoFan, 'province.data.id', null),
      }
      this.enableEditing = false
    },
    async fetchCountries() {
      try {
        const params = {
          paginate: false,
        }
        const { data } = await this.$api.location.getCountries(params)
        if (data) {
          this.countries = data
        }
      } catch (e) {}
    },
    async fetchProvinces() {
      try {
        this.loadingProvince = true
        const params = {
          paginate: false,
          'filter[country_id]': this.form.country,
        }
        const { data } = await this.$api.location.getProvinces(params)
        if (data) {
          this.provinces = data
        }
      } catch (e) {
      } finally {
        this.loadingProvince = false
      }
    },
    async handleChangeCountry(value) {
      if (value) {
        this.form.province = null
        this.provinces = []
        await this.fetchProvinces()
      }
    },
    validatePhone(rule, value, callback) {
      if (!value.length) return callback()
      const regEx = /^[0-9]{10,11}\s*$/g
      if (!regEx.test(value)) {
        callback(new Error(this.$t('validateFormatPhone')))
      } else {
        callback()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.guest-information {
  @apply h-full flex flex-col;
  .p-section {
    border-color: @gray-4;
    padding: @padding-24;
    @apply border-b;
  }
  &__title {
    font-size: @size-20;
    color: @black;
    padding: @padding-24 !important;
    @apply text-center font-semibold;
  }
  .scroll-guest-information {
    @apply flex-1;
  }
  &__basic-info {
    border-color: @gray-4;
    padding: @padding-24;
    @apply flex flex-col items-center border-b;
    .avatar,
    /deep/.ant-avatar {
      width: 17.5rem;
      height: 17.5rem;
      font-size: 3.5rem !important;
      @apply mb-4 flex items-center;
    }
    .name {
      font-size: @size-24;
      color: @black;
      margin-top: 20px;
      @apply mb-0 font-semibold;
    }
    .id-user {
      color: @gray-3;
      font-size: @size-16;
      @apply mb-2;
    }
  }
  /deep/.title-section {
    font-size: @size-20;
    line-height: @size-26;
    @apply m-0 font-semibold;
  }
  &__edit {
    &__head {
      color: @black;
      @apply flex items-end mb-4;
      .btn-edit {
        background-color: @gray-6;
        color: @black;
        width: @width-btn-trigger;
        height: @width-btn-trigger;
        padding: 0.25rem 0.5rem;
        font-size: @size-15;
        @apply border-0 rounded-md ml-4;
        &.enableEditing {
          background-color: @primary-3;
          color: @primary;
        }
      }
    }
    /deep/&__body {
      label {
        font-size: @size-12 !important;
        color: @gray-1 !important;
      }
      .ant-row {
        &.ant-form-item {
          margin-bottom: @margin-24;
        }
      }
      .custom-select {
        color: @black;
        font-size: @size-16;
        height: @height-field !important;
        .ant-select-selection {
          border-color: @black-gray !important;
          height: @height-field !important;
          &__rendered {
            line-height: @height-field !important;
          }
        }
        .ant-select-arrow {
          color: @black;
          font-size: @size-10;
          top: 55%;
        }
      }
      .ant-input {
        color: @black;
        border-color: @black-gray;
        font-size: @size-16;
        line-height: @height-field !important;
        height: @height-field !important;
      }
      &.canEdit {
        .custom-select {
          color: @black;
          font-size: @size-16;
          height: @height-field;
          @apply mb-2;
          &.ant-select-disabled {
            .ant-select-selection {
              background-color: #f6f6f6;
              cursor: default;
            }
          }
          .ant-select-selection {
            border-color: @black-gray !important;
          }
          .ant-select-arrow {
            color: @black;
            font-size: @size-10;
            top: 55%;
          }
        }
        .ant-input {
          color: @black;
          border-color: @black-gray;
          font-size: @size-16;
          height: @height-field;
          @apply mb-2;
          &[disabled] {
            background-color: #f6f6f6;
            cursor: default;
          }
        }
      }
    }
  }
  &__footer {
    @apply flex items-center justify-end p-4 shadow-2xl;
    /deep/.btn-cancel {
      color: @black;
      @apply font-medium;
    }
    /deep/.btn-submit {
      @apply font-medium;
    }
  }
}
</style>
