<template>
  <div class="tag-page">
    <div class="tag-page__header tag-page-header">
      <span class="tag-page-header__title">
        {{ $t('tagging-management') }}
      </span>
      <span v-if="textLastUpdated.length" class="text-last-update">
        {{ textLastUpdated }}
      </span>
    </div>
    <div class="tag-page-filter">
      <a-select
        v-if="channels.length"
        v-model="filter.socialChannelId"
        size="large"
        class="custom-select"
        dropdown-class-name="tag-page-filter__social-channels"
        :loading="$fetchState.pending"
      >
        <a-select-option
          v-for="channel in channels"
          :key="channel.social_channel_id"
          :value="channel.social_channel_id"
        >
          <img
            :src="
              require(`~/assets/images/Icon/Icon-${channel.channel_type.data.code}.png`)
            "
            class="tag-page-filter__social-channels--icon-channels"
          />
          {{ channel.name }}
        </a-select-option>
      </a-select>
    </div>
    <div class="tag-page__body">
      <tag
        :channels="channels"
        :social-channel-id="filter.socialChannelId"
        @updateTag="fetchLastInteractiveTag"
      />
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'
export default {
  name: 'TagPage',
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
      textLastUpdated: '',
      lastInteractiveTag: null,
      channels: [],
      filter: {
        socialChannelId: null,
      },
    }
  },
  async fetch() {
    await this.fetchSocialChannels()
    await this.fetchLastInteractiveTag()
  },
  watch: {
    lastInteractiveTag() {
      this.handleShowLastUpdated()
    },
  },
  methods: {
    async fetchLastInteractiveTag() {
      try {
        const { data } = await this.$api.tags.getLastInteractiveTag()
        if (data) {
          this.lastInteractiveTag = Object.freeze(data)
        }
      } catch (e) {}
    },
    async fetchSocialChannels() {
      try {
        const params = {
          paginate: false,
        }
        const { data } = await this.$api.socialChannel.getSocialChannelsByUser(
          params
        )
        if (data) {
          this.channels = data
          this.filter.socialChannelId = this.channels[0].social_channel_id
        }
      } catch (e) {}
    },
    handleShowLastUpdated() {
      if (!this.lastInteractiveTag) return
      this.textLastUpdated = this.$t('last-updated-by', {
        name: this.lastInteractiveTag.interact_user_name || 'unknown',
        time: this.$moment
          .utc(this.lastInteractiveTag.updated_at)
          .local()
          .format('HH:mm DD/MM/YYYY'),
      })
    },
  },
}
</script>
<style lang="less" scoped>
.tag-page {
  padding: @padding-40 @padding-24;
  &__body {
    height: 500px;
    border-color: @gray-4;
    @apply mt-6 border rounded-md;
  }
  &-header {
    @apply flex items-center justify-between;

    &__title {
      color: @black;
      font-size: @size-20;
      @apply font-semibold;
    }
    .text-last-update {
      font-size: @size-14;
      color: @gray-3;
    }
  }
  &-filter {
    .custom-select {
      color: @black;
      font-size: @size-16;
      min-width: 26rem;
      width: fit-content;
      height: @height-field;
      @apply m-2;
      .ant-select-selection {
        border-color: @black-gray;
        height: 100%;
        &__rendered {
          height: 100%;
          line-height: @height-field;
          .ant-select-selection-selected-value {
            display: flex !important;
            @apply items-center;
          }
        }
        .ant-select-selection-selected-value {
          max-width: 25rem;
          @apply pr-2;
        }
        .ant-select-arrow-icon {
          color: @black;
        }
      }
    }

    &__social-channels {
      &--icon-channels {
        width: @size-28;
        height: @size-28;
        margin-right: @margin-8;
        @apply inline-block;
      }
    }
  }
}
</style>
