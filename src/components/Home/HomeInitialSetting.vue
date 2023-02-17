<template>
  <section class="initial-setting">
    <h3 class="initial-setting-title">{{ $t('getStarted') }}</h3>
    <div class="initial-setting-head">
      <a-progress
        :show-info="false"
        class="initial-setting-head__progress"
        status="active"
        :percent="percent"
      />
      <p class="initial-setting-head__step">{{ completedSteps }}</p>
    </div>
    <div class="initial-setting-setup">
      <div
        v-for="(feature, index) in features"
        :key="index"
        class="initial-setting-setup-feature"
      >
        <div class="initial-setting-setup-feature__top">
          <img :src="feature.image" :alt="feature.title" />
        </div>
        <div class="initial-setting-setup-feature__bottom">
          <h1 class="title">
            {{ feature.title }}
          </h1>
          <p class="initial-setting-setup-feature__bottom--description">
            {{ feature.description }}
          </p>
          <div class="initial-setting-setup-feature__bottom--group-button">
            <a-button type="primary" :disabled="feature.disable">
              <nuxt-link :to="localePath({ path: feature.direct })">
                <a-icon :type="feature.icon" />
                {{ feature.button }}
              </nuxt-link>
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { get } from 'lodash'
import { convertLocalToUTC, last30Days, yesterdayEnd } from '@/utils/moment'

export default {
  name: 'HomeInitialSetting',
  fetchOnServer: false,
  data() {
    return {
      channels: [],
      templates: [],
      totalResponse: 0,
    }
  },
  async fetch() {
    await Promise.all([this.fetchSocialChannels(), this.fetchTemplates()])
    await this.fetchAnalytics()
  },
  computed: {
    features() {
      const permissions =
        get(this.$store, 'state.auth.user.permissions', []) || []
      return [
        {
          image: require('~/assets/images/Auth/Auth-Loading-1.png'),
          title: this.$t('loading-feature-text-1'),
          description: this.$t('loading-feature-description-1'),
          button: this.$t('addNow'),
          icon: 'plus',
          direct: '/setting/channel',
          disable: !permissions.includes('setting'),
        },
        {
          image: require('~/assets/images/Auth/Auth-Loading-2.png'),
          title: this.$t('loading-feature-text-2'),
          description: this.$t('loading-feature-description-2'),
          button: this.$t('addNow'),
          icon: 'plus',
          direct: '/setting/template',
          disable: !permissions.includes('setting'),
        },
        {
          image: require('~/assets/images/Auth/Auth-Loading-3.png'),
          title: this.$t('loading-feature-text-3'),
          description: this.$t('loading-feature-description-3'),
          button: this.$t('startNow'),
          icon: 'plus',
          direct: '/conversations/chat-comment',
          disable: !permissions.includes('conversation'),
        },
      ]
    },
    hasChannel() {
      return this.channels?.length > 0
    },
    hasTemplate() {
      return this.templates?.length > 0
    },
    hasInteracted() {
      return this.totalResponse > 0
    },
    allSteps() {
      return [this.hasChannel, this.hasTemplate, this.hasInteracted]
    },
    currentStep() {
      return this.allSteps.reduce(
        (prevValue, currentStep) => (currentStep ? prevValue + 1 : prevValue),
        0
      )
    },
    completedSteps() {
      const totalSteps = this.allSteps.length
      return `${this.currentStep}/${totalSteps}`
    },
    percent() {
      const totalSteps = this.allSteps.length
      return 100 * (this.currentStep / totalSteps)
    },
  },
  methods: {
    async fetchAnalytics() {
      try {
        const socialChannelIds = this.channels?.length
          ? this.channels.map((channel) => channel.id)
          : []
        if (!socialChannelIds?.length) {
          this.totalResponse = 0
          return
        }
        const params = {
          social_channel_ids: [...socialChannelIds],
          date_from: convertLocalToUTC(last30Days, 'YYYY-MM-DD HH:mm'),
          date_to: convertLocalToUTC(yesterdayEnd, 'YYYY-MM-DD HH:mm'),
        }
        const { data } = await this.$api.analytics.getStatistics(params)
        if (data) {
          this.totalResponse = data.total_response
        }
      } catch (e) {}
    },
    async fetchSocialChannels() {
      try {
        const params = {
          sort: 'name',
          pagination: false,
        }
        const { data } = await this.$api.socialChannel.getSocialChannelsByUser(
          params
        )
        if (data) {
          this.channels = Object.freeze(data)
        }
      } catch (e) {}
    },
    async fetchTemplates() {
      try {
        const params = {
          limit: 1,
        }
        const { data } =
          await this.$api.responseTemplate.getResponseTemplatesByFilter(params)
        if (data) {
          this.templates = Object.freeze(data)
        }
      } catch (e) {}
    },
    increase() {
      let percent = this.percent + 30
      if (percent > 100) {
        percent = 100
      }
      this.percent = percent
    },
  },
}
</script>
<style lang="less" scoped>
.initial-setting {
  &-title {
    color: @black;
    font-size: @size-20;
    @apply font-bold;
  }
  &-head {
    @apply flex items-center;
    &__progress {
      width: 96%;
      @apply relative rounded-md;
      /deep/.ant-progress-inner {
        background-color: @primary-4;
        height: 12px;
        .ant-progress-bg {
          background-color: @primary;
          height: 100% !important;
        }
      }
    }
    &__step {
      width: 4%;
      padding-left: 1%;
      color: #3e457e;
      font-size: @font-size-base;
      @apply mb-0 font-semibold;
    }
  }
  &-setup {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    &-feature {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      .desktop({
      width: 28%;
      });
      &__top {
        width: 28rem;
        flex: 1;
        &--title {
          font-weight: 600;
          font-size: @size-20;
          line-height: @size-26;
          color: @black;
        }
      }
      &__bottom {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .title {
          font-size: @size-20;
          font-weight: 600;
        }
        &--description {
          color: @black;
          font-size: @size-16;
        }
      }
    }
  }
}
</style>
