<template>
  <div class="channel-page">
    <div class="channel-page__header channel-page-header">
      <div class="channel-page-header__title">
        {{ $t('channel-integration') }}
      </div>
      <div class="channel-page-header__actions">
        <a-dropdown :trigger="['click']">
          <a-menu slot="overlay" @click="handleOpenAddChannel">
            <a-menu-item
              v-for="channelItem in typeChannels"
              :key="channelItem.key"
              class="flex items-center justify-between"
            >
              <div class="flex items-center">
                <img
                  :src="
                    require(`~/assets/images/Icon/Icon-${channelItem.key}.png`)
                  "
                  alt="Social CRM"
                  class="icon-channel"
                />
                {{ channelItem.name }}
              </div>
              <icon-new v-if="channelItem.isNew" />
            </a-menu-item>
          </a-menu>
          <a-button type="primary">
            {{ $t('add-channel-account') }} <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <div class="channel-page__filters">
        <a-select
          default-value="all"
          style="width: 180px"
          class="custom-select"
          @change="handleChangeChannel"
        >
          <a-select-option
            v-for="(item, index) in channelOptions"
            :key="index"
            :value="item.value"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
      <div class="channel-page__body">
        <channel-table
          :channels="channels"
          :total="total"
          @reload="fetchSocialChannels"
        ></channel-table>
      </div>

      <channel-modal ref="modalAddChannel" class="custom-channel-modal">
        <template #content>
          <a-carousel arrows :infinite="false">
            <a slot="customPaging">
              <span class="app-dot"></span>
            </a>
            <channel-guid
              v-for="(step, index) in steps"
              :key="index"
              :step="step"
              :is-final-step="index + 1 === steps.length"
              @next="handleAddChannel"
            />
            <template #prevArrow>
              <div class="custom-slick-arrow" style="left: 10px; z-index: 1">
                <a-icon type="left-circle" />
              </div>
            </template>
            <template #nextArrow>
              <div class="custom-slick-arrow" style="right: 10px">
                <a-icon type="right-circle" />
              </div>
            </template>
          </a-carousel>
        </template>
      </channel-modal>
    </template>
  </div>
</template>

<script>
import { get } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
Vue.use(notification)

export default {
  name: 'SettingChannelPage',
  fetchOnServer: false,
  asyncData({ app, redirect }) {
    const permissions = get(app, 'store.state.auth.user.permissions', []) || []
    if (!permissions.includes('setting')) {
      const defaultLocale = app.i18n.defaultLocale
      const locale = app.store.state.i18n.locale
      const url =
        locale === defaultLocale
          ? '/setting/account'
          : `/${locale}/setting/account`

      redirect(url)
    }
  },
  data() {
    return {
      addChannelSuccessKey: 'add_channel_success',
      errorMessageAddChannel: 'error_message_add_channel',
      page: 1,
      limit: this.$store.state.limit,
      type: null,
      channel: null,
      channels: [],
      total: {},
      steps: [
        {
          title: this.$t('steps.title-step-1'),
          detail: this.$t('steps.detail-step-1'),
          image: require('~/assets/images/Channel/add-channel-step-1.png'),
        },
        {
          title: this.$t('steps.title-step-2'),
          detail: this.$t('steps.detail-step-2'),
          image: require('~/assets/images/Channel/add-channel-step-2.png'),
        },
        {
          title: this.$t('steps.title-step-3'),
          detail: this.$t('steps.detail-step-3'),
          image: require('~/assets/images/Channel/add-channel-step-3.png'),
        },
        {
          title: this.$t('steps.title-step-4'),
          detail: this.$t('steps.detail-step-4'),
          image: require('~/assets/images/Channel/add-channel-step-4.png'),
        },
      ],
    }
  },
  async fetch() {
    await this.fetchSocialChannels()
  },
  computed: {
    typeChannels() {
      return [
        {
          key: 'facebook',
          name: this.$t('facebook'),
          value: this.$store.state.channel.facebook,
        },
        // {
        //   key: 'instagram',
        //   name: this.$t('instagram'),
        //   value: this.$store.state.channel.instagram,
        // },
        // {
        //   key: 'shopee',
        //   name: this.$t('shopee'),
        //   value: this.$store.state.channel.shopee,
        //   isNew: true,
        // },
      ]
    },
    channelOptions() {
      return [
        { key: 'all', name: this.$t('all-channels'), value: 'all' },
        ...this.typeChannels,
      ]
    },
    auth() {
      try {
        return localStorage.getItem('auth._token.local')
      } catch (e) {
        return null
      }
    },
    configTypeChannel() {
      return {
        facebook: 'fb',
        instagram: 'ig',
        shopee: 'shopee',
      }
    },
  },
  watch: {
    '$route.query': {
      handler() {
        const {
          page = 1,
          limit = this.$store.state.limit,
          channel = null,
        } = this.$route.query
        this.page = Number(page)
        this.limit = Number(limit)
        this.channel = channel ? Number(channel) : null
        this.fetchSocialChannels()
      },
    },
  },
  mounted() {
    const isAddSuccess = localStorage.getItem(this.addChannelSuccessKey)
    const errorMessage = localStorage.getItem(this.errorMessageAddChannel)
    if (isAddSuccess && !errorMessage?.length) {
      notification.success({
        message: this.$t('channel-account-is-successfully-added'),
        class: 'notification-success',
      })

      localStorage.removeItem(this.addChannelSuccessKey)
      // } else if (!isAddSuccess && errorMessage?.length) {
    } else if (errorMessage?.length) {
      notification.error({
        message: errorMessage,
        class: 'notification-error',
      })

      localStorage.removeItem(this.addChannelSuccessKey)
      localStorage.removeItem(this.errorMessageAddChannel)
    }
  },
  methods: {
    async fetchSocialChannels() {
      try {
        const params = {
          limit: this.limit,
          page: this.page,
          ...(this.channel && { 'filter[channel_type_id]': this.channel }),
        }
        const { data, meta } =
          await this.$api.socialChannel.getSocialChannelsByUser(params)
        if (data) {
          this.channels = data
          this.total = meta.pagination.total
        }
      } catch (e) {}
    },
    handleOpenAddChannel(e) {
      this.type = e.key
      if (this.type === 'shopee') {
        this.handleAddChannel()
      } else {
        this.$refs.modalAddChannel.show()
      }
    },
    async handleAddChannel() {
      if (process.client) {
        const redirectUrlAfterLogin = window.location.href
        const type = this.configTypeChannel[this.type]
        const urlRedirect = await this.$api.socialChannel.addChannelAccount(
          redirectUrlAfterLogin,
          this.auth,
          type
        )
        if (urlRedirect) {
          window.location.href = urlRedirect
          this.type = null
          this.$refs.modalAddChannel.hide()
        }
      }
    },
    handleChangeChannel(value) {
      const query = {
        ...this.$route.query,
        page: 1,
        channel: value,
      }
      this.$router.push({ query })
    },
  },
}
</script>

<style lang="less" scoped>
.channel-page {
  padding: @padding-40 @padding-24;

  &__filters {
    margin-top: 0.5rem;
    @apply flex;

    /deep/.ant-select {
      color: @black;
    }
  }

  &__body {
    margin-top: 1rem;
  }
}

.channel-page-header {
  @apply flex items-center justify-between;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }

  &__actions {
    /deep/.ant-btn {
      @apply font-medium;
    }
  }
}

.icon-channel {
  width: @size-32;
  height: @size-32;
  @apply mr-4;
}

.custom-channel-modal {
  /deep/.ant-modal-body {
    padding: 2.5rem 1.5rem 1.5rem;
    background-image: url('~/assets/images/Channel/Background-Channel-Modal.jpg');
    border-radius: @border-radius-base;
    @apply bg-center bg-no-repeat bg-cover;
  }
}

.app-dot {
  width: @size-12;
  height: @size-12;
  display: inline-block;
  background-color: @secondary-4;
  border-radius: 50%;
  margin-inline: 4px;
}

.slick-active {
  .app-dot {
    background-color: @primary;
  }
}
/deep/.custom-slick-arrow.slick-disabled {
  cursor: not-allowed !important;
}
.custom-select {
  color: @black;
  font-size: @size-16;
  height: @height-field !important;
  /deep/.ant-select-selection {
    border-color: @black-gray !important;
    height: @height-field !important;
    &__rendered {
      line-height: @height-field !important;
    }
  }
  /deep/.ant-select-arrow {
    color: @black;
    font-size: @size-10;
    top: 55%;
  }
}
</style>
