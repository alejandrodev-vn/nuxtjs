<template>
  <div class="guest-detail-infomation">
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <div
        class="guest-detail-infomation__header guest-detail-infomation-header"
      >
        <div
          class="guest-detail-infomation-header__left guest-detail-infomation-header-left"
        >
          <div class="guest-detail-infomation-header-left__image">
            <app-avatar
              :image="guestDetail.image"
              :full-name="guestDetail.name"
              :size="66"
            />
          </div>
          <div class="guest-detail-infomation-header-left__info">
            <a-popover placement="topLeft">
              <template slot="content">
                {{ guestDetail.name }}
              </template>
              <div class="guest-detail-infomation-header-left__info--name">
                {{ guestDetail.name }}
              </div>
            </a-popover>
            <a-popover placement="topLeft">
              <template slot="content">
                {{ guestDetail.id }}
              </template>
              <div class="guest-detail-infomation-header-left__info--id">
                ID: {{ guestDetail.id }}
              </div>
            </a-popover>
          </div>
        </div>
        <div
          class="guest-detail-infomation-header__right guest-detail-infomation-header-right"
        >
          <app-tag
            v-if="guestDetail.level"
            :type="levelColor[guestDetail.level]"
          >
            {{ $t(guestDetail.level) }}
          </app-tag>
          <div class="guest-detail-infomation-header-right__channel">
            <img
              :src="
                require(`~/assets/images/Icon/Icon-${guestDetail.channel_type}.png`)
              "
              alt="Prime CRM"
              class="guest-detail-infomation-header-right__channel--icon"
            />
            <a-popover placement="topLeft">
              <template slot="content">
                {{ guestDetail.channel_name }}
              </template>
              <span class="guest-detail-infomation-header-right__channel--name">
                {{ guestDetail.channel_name }}
              </span>
            </a-popover>
          </div>
        </div>
      </div>
      <div class="guest-detail-infomation__form">
        <a-form-model ref="form" :model="form" :rules="rules" :colon="false">
          <a-form-model-item ref="phone" prop="phone" :label="$t('phone')">
            <a-input v-model="form.phone" :disabled="disabled" />
          </a-form-model-item>
          <a-form-model-item ref="email" prop="email" :label="$t('email')">
            <a-input v-model="form.email" :disabled="disabled" />
          </a-form-model-item>
          <a-form-model-item
            ref="address"
            prop="address"
            :label="$t('address')"
          >
            <a-input v-model="form.address" :disabled="disabled" />
          </a-form-model-item>
          <a-form-model-item ref="nation" prop="nation" :label="$t('nation')">
            <a-select
              v-model="form.country"
              show-search
              option-filter-prop="children"
              :disabled="disabled"
              @change="handleChangeCountry"
            >
              <template v-for="(item, index) in nationOptions">
                <a-select-option :key="index" :value="item.value">
                  {{ item.name }}
                </a-select-option>
              </template>
            </a-select>
          </a-form-model-item>
          <a-form-model-item ref="city" prop="city" :label="$t('city')">
            <a-select
              v-model="form.province"
              show-search
              option-filter-prop="children"
              :loading="loadingProvince"
              :disabled="disabled"
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
    </template>
  </div>
</template>

<script>
import { get, invert } from 'lodash'

export default {
  name: 'GuestDetailInformation',
  fetchOnServer: false,
  props: {
    guest: {
      type: Object,
      default: () => {},
    },
    disabled: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      levelColor: this.$store.state.levelColor,
      form: {
        phone: '',
        email: '',
        address: '',
        country: null,
        province: null,
      },
      rules: {
        phone: [
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
            // pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: this.$t('email-format-required'),
            trigger: 'blur',
          },
        ],
      },
      countries: [],
      provinces: [],
      loadingProvince: false,
      thumbnailSrc: null,
    }
  },
  async fetch() {
    await this.fetchCountries()
  },
  computed: {
    levelType() {
      return invert(this.$store.state.level)
    },
    guestDetail() {
      const arrayName = this.guest.full_name
        .split(' ')
        .map((x) => {
          return x.charAt(0).toUpperCase()
        })
        .splice(-2)
      const shortName = arrayName.join('')
      const channel = get(this.guest, 'social_channel.data', {}) || {}
      const guest = {
        id: this.guest.social_profile_id,
        image: this.guest.avatar,
        short_name: shortName,
        name: this.guest.full_name,
        level: this.levelType[this.guest.level],
        channel_name: get(channel, 'name', '') || '',
        channel_type: get(channel, 'channel_type.data.code', '') || '',
      }
      return guest
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
  },
  async mounted() {
    this.form = {
      ...this.form,
      phone: this.guest.phone,
      email: this.guest.email,
      address: this.guest.address,
      country: get(this.guest, 'country.data.id', null) || null,
      province: get(this.guest, 'province.data.id', null) || null,
    }

    if (this.form.country) {
      await this.fetchProvinces()
    }
  },
  methods: {
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
    handleSave() {
      let isCompleted = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          isCompleted = true
        }
      })

      return isCompleted
    },
  },
}
</script>

<style lang="less" scoped>
.guest-detail-infomation {
  border: 1px solid @secondary-2;
  border-radius: @border-radius-lg;
  padding: @padding-24;

  &__header {
    @apply flex items-center justify-between;
  }

  &__form {
    margin-top: 1rem;

    /deep/.ant-form-item {
      .ant-input-disabled {
        background-color: @white;
        @apply cursor-default;
      }
    }

    /deep/.ant-select {
      &.ant-select-disabled {
        .ant-select-selection {
          background-color: @white;
          @apply cursor-default;
        }
      }

      .ant-select-selection {
        height: @height-field;

        &__rendered {
          line-height: @height-field;
        }
      }
    }
  }
}

.guest-detail-infomation-header-left {
  @apply flex items-center;

  &__image {
    flex: 0 0 4rem;
    border-radius: 50%;
    background-color: @primary-3;
    color: @primary;
    font-size: @size-16;
    line-height: 1;
    @apply flex items-center justify-center font-semibold object-cover;
  }

  &__info {
    margin-left: @margin-24;

    &--name {
      color: @primary;
      font-size: @size-20;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      display: -webkit-box;
      word-break: break-word;
      @apply font-semibold overflow-hidden overflow-ellipsis;
    }

    &--id {
      color: @secondary-1;
      font-size: @size-16;
      margin-top: 0.25rem;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      display: -webkit-box;
      word-break: break-word;
      @apply overflow-hidden overflow-ellipsis;
    }
  }
}

.guest-detail-infomation-header-right {
  max-width: 30%;
  @apply text-right;

  .app-tag {
    font-size: @size-14;
    @apply inline-block;
  }

  &__channel {
    margin-top: @margin-12;
    @apply flex items-center;

    &--icon {
      flex: 0 0 1.5rem;
      width: @size-24;
      height: @size-24;
      @apply object-contain;
    }

    &--name {
      color: @gray-1;
      font-size: @size-16;
      margin-left: @margin-12;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      display: -webkit-box;
      word-break: break-word;
      @apply overflow-hidden overflow-ellipsis text-left;
    }
  }
}
</style>
