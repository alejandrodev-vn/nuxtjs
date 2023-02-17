<template>
  <div class="keyword-management-page">
    <div class="keyword-management-page__header keyword-management-page-header">
      <div class="keyword-management-page-header__title">
        {{ $t('keyword-management') }}
      </div>
      <div class="keyword-management-page-header__actions">
        <a-button type="primary" icon="plus" @click="handleOpenAddKeyword">
          {{ $t('add-keyword') }}
        </a-button>
      </div>
    </div>
    <div class="keyword-management-page__filters">
      <a-input
        v-model="filter.search"
        :placeholder="$t('search-by-keyword-name')"
      >
        <a-icon slot="prefix" type="search" />
      </a-input>
      <a-select
        v-model="filter.socialChannelId"
        size="large"
        class="custom-select"
        dropdown-class-name="keyword-management-page__social-channels"
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
            class="keyword-management-page__social-channels--icon-channels"
          />
          {{ channel.name }}
        </a-select-option>
      </a-select>
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <div class="keyword-management-page__body">
        <keyword-table
          :keywords="keywords"
          :total="total"
          @reload="fetchKeywords"
        />
      </div>

      <component
        :is="isTypeComponent"
        :is-show="isShowAddKeyword"
        :keywords="keywords"
        :social-channel-id="filter.socialChannelId"
        @reload="fetchKeywords"
        @close="handleCloseAddKeyword"
      ></component>
    </template>
  </div>
</template>

<script>
import { get, debounce } from 'lodash'
import KeywordAdd from '@/components/Setting/KeywordManagement/KeywordAdd'

export default {
  name: 'KeywordManagement',
  components: {
    add: KeywordAdd,
  },
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
      page: 1,
      limit: this.$store.state.limit,
      isShowAddKeyword: false,
      isTypeComponent: '',
      keywords: [],
      channels: [],
      total: 0,
      filter: {
        search: '',
        socialChannelId: null,
      },
    }
  },
  async fetch() {
    await this.fetchSocialChannels()
  },
  watch: {
    'filter.socialChannelId': {
      deep: true,
      handler() {
        this.fetchKeywords()
      },
    },
    'filter.search': {
      handler: debounce(function () {
        this.page = 1
        this.fetchKeywords()
      }, 1000),
    },
    '$route.query': {
      handler() {
        const { page = 1, limit = this.$store.state.limit } = this.$route.query
        this.page = Number(page)
        this.limit = Number(limit)
        this.fetchKeywords()
      },
    },
  },
  methods: {
    async fetchKeywords(sort) {
      try {
        const params = {
          limit: this.limit,
          page: this.page,
          sort: !sort ? '-created_at' : sort,
          'filter[social_channel_id]': this.filter.socialChannelId,
          ...(this.filter.search.length && {
            'filter[name]': this.filter.search,
          }),
        }
        const { data, meta } = await this.$api.keyword.getListKeyword(params)
        if (data) {
          this.keywords = data
          this.total = meta.pagination.total
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
    handleOpenAddKeyword() {
      this.isShowAddKeyword = true
      this.isTypeComponent = 'add'
    },
    handleCloseAddKeyword() {
      this.isShowAddKeyword = false
      this.isTypeComponent = ''
    },
  },
}
</script>

<style lang="less" scoped>
.keyword-management-page {
  padding: @padding-40 @padding-24;

  /deep/&__filters {
    margin-top: 0.5rem;
    @apply w-full flex-wrap flex items-center mb-4;

    .ant-input-affix-wrapper {
      width: 50rem;
      height: @height-field;
      @apply m-2;
      .ant-input {
        height: 100%;
      }
    }
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
  }
  &__social-channels {
    &--icon-channels {
      width: @size-28;
      height: @size-28;
      margin-right: @margin-8;
      @apply inline-block;
    }
  }

  &__body {
    margin-top: 1rem;
    /deep/.ant-table-column-title {
      @apply font-medium;
    }
  }
}

.keyword-management-page-header {
  @apply flex items-center justify-between;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }
  &__actions {
    .ant-btn {
      @apply font-medium;
    }
  }
}
</style>
