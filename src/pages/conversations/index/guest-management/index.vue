<template>
  <div class="guest-management-page">
    <div class="guest-management-page__title">{{ $t('guest-management') }}</div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <div class="guest-management-page__actions">
        <div class="guest-management-page-filters">
          <div class="guest-management-page-filters__left">
            <a-input
              :value="filter.search"
              :disabled="isLoading"
              :loading="isLoading"
              :placeholder="$t('search-by-guest-name-or-guest-ID')"
              allow-clear
              @pressEnter="handleSearchGuest"
              @change="onChangeSearch"
            >
              <a-icon slot="prefix" type="search" />
            </a-input>
            <a-select
              v-model="filter.socialChannelId"
              size="large"
              class="custom-select"
              dropdown-class-name="guest-management-page-filters__social-channels"
              :disabled="isLoading"
              :loading="isLoading"
              :get-popup-container="(trigger) => trigger"
              @change="handleChangeSocialChannelId"
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
                  class="guest-management-page-filters__social-channels--icon-channels"
                />
                {{ channel.name }}
              </a-select-option>
            </a-select>
            <app-date-picker
              :value="filter.range"
              :disabled-date="disabledDate"
              :clearable="false"
              :placeholder="$t('creation-date')"
              :disabled="isLoading"
              @input="handleChangeRange"
            />
            <a-button
              type="primary"
              class="btn-filter"
              @click="handleShowFilter"
            >
              <icon-filter />
            </a-button>
            <guest-management-filter-advanced
              :is-show="isShowFilter"
              :is-loading="isLoading"
              :channels="channels"
              @close="handleCloseFilter"
            />
          </div>
          <div class="guest-management-page-filters__right">
            <export-data-guest-management
              :filters="exportFilters"
              class="ml-auto"
            />
          </div>
        </div>
      </div>
      <div class="guest-management-page__content">
        <guest-management-table
          :guests="guests"
          :total="total"
          :is-loading="isLoading"
        ></guest-management-table>
      </div>
    </template>
  </div>
</template>

<script>
import { get, debounce } from 'lodash'
import { today, last30Days, convertLocalToUTC } from '@/utils/moment'

export default {
  name: 'GuestManagementPage',
  fetchOnServer: false,
  data() {
    return {
      page: 1,
      limit: this.$store.state.limit,
      channels: [],
      guests: [],
      total: 0,
      range: [new Date(last30Days), new Date(today)],
      exportFilters: {},
      isShowFilter: false,
      isLoading: false,
      filter: {
        search: '',
        socialChannelId: null,
        tags: [],
        level: 0,
        range: [],
      },
      sort: '-created_at',
    }
  },
  async fetch() {
    await this.fetchSocialChannels()
  },
  computed: {
    primaryChannel() {
      return get(this.channelOptions, '0', {}) || {}
    },
  },
  watch: {
    '$route.query'() {
      this.handleFilters()
    },
  },
  created() {
    this.handleFilters()
  },
  methods: {
    onChangeSearch(e) {
      const { value } = e.target
      if (this.filter.search?.length && !value?.length) {
        const query = {
          ...this.$route.query,
          search: this.filter.search,
          page: 1,
        }
        this.filter.search = value
        delete query.search
        this.$router.push({ query })
      }
      this.filter.search = value
    },
    handleSearchGuest: debounce(function () {
      const query = {
        ...this.$route.query,
        search: this.filter.search,
        page: 1,
      }
      if (!this.filter.search?.length) {
        delete query.search
      }
      this.$router.push({ query })
    }, 1000),
    handleShowFilter() {
      this.isShowFilter = true
    },
    handleCloseFilter() {
      this.isShowFilter = false
    },
    handleChangeRange(date = []) {
      this.filter.range = date
      const query = {
        ...this.$route.query,
        date_from: this.$moment(date[0]).format('YYYY-MM-DD HH:mm'),
        date_to: this.$moment(date[1]).format('YYYY-MM-DD HH:mm'),
        page: 1,
      }
      if (
        query.date_from === 'Invalid date' ||
        query.date_to === 'Invalid date' ||
        !date[0] ||
        !date[1]
      ) {
        query.date_from = this.$moment(new Date(last30Days)).format(
          'YYYY-MM-DD HH:mm'
        )
        query.date_to = this.$moment(today).format('YYYY-MM-DD HH:mm')
        this.filter.range = [new Date(last30Days), new Date(today)]
      }
      this.$router.push({ query })
    },
    handleChangeSocialChannelId(socialChannelId) {
      const query = {
        ...this.$route.query,
        channel_id: socialChannelId,
        page: 1,
      }
      this.$router.push({ query })
    },
    async fetchSocialChannels() {
      try {
        const params = {
          paginate: false,
          sort: 'name',
        }
        const { data } = await this.$api.socialChannel.getSocialChannelsByUser(
          params
        )
        if (data) {
          this.channels = data
          if (this.channels.length) {
            const isValidQueryChannelId = this.channels.some(
              (channel) =>
                channel.social_channel_id + '' === this.$route.query.channel_id
            )
            if (isValidQueryChannelId) return
            const query = {
              ...this.$route.query,
              channel_id: this.channels[0].social_channel_id,
            }
            this.$router.push({ query })
          }
        }
      } catch (e) {}
    },
    async fetchGuests() {
      try {
        this.isLoading = true
        const getLastTag = this.filter.tags?.length
          ? parseInt(this.filter.tags[this.filter.tags.length - 1])
          : null
        const params = {
          ...(this.filter.search?.length && {
            search_columns: this.filter.search,
          }),
          limit: this.limit,
          page: this.page,
          'filter[social_channel_id]': this.filter.socialChannelId,
          ...(this.filter.level && { levels: [this.filter.level] }),
          ...(getLastTag && { tags: [getLastTag] }),
          date_from: convertLocalToUTC(
            this.filter.range[0],
            'YYYY-MM-DD HH:mm'
          ),
          date_to: convertLocalToUTC(this.filter.range[1], 'YYYY-MM-DD HH:mm'),
          sort: this.sort,
        }
        this.exportFilters = { ...params }
        const { data, meta } = await this.$api.fan.getGuests(params)
        if (data) {
          this.guests = data
          this.total = meta.pagination.total
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    },
    handleFilters() {
      const {
        page = 1,
        limit = this.$store.state.limit,
        channel_id,
        level = 0,
        tags = '',
        date_from,
        date_to,
        search = '',
        sort = '-created_at',
      } = this.$route.query
      this.page = Number(page)
      this.limit = Number(limit)
      this.sort = sort
      if (channel_id && !isNaN(channel_id)) {
        this.filter.socialChannelId = parseInt(channel_id)
      }
      this.filter.level = parseInt(level)
      this.filter.tags = tags?.length ? tags.split(',') : []
      if (date_from && date_to) {
        this.filter.range = [new Date(date_from), new Date(date_to)]
        const checkDateFrom = this.$moment(date_from).format('YYYY-MM-DD HH:mm')
        const checkDateTo = this.$moment(date_to).format('YYYY-MM-DD HH:mm')
        if (
          checkDateFrom === 'Invalid date' ||
          checkDateTo === 'Invalid date'
        ) {
          this.handleChangeRange([])
        }
      } else {
        this.handleChangeRange([])
      }
      if (search?.length) {
        this.filter.search = search
      }
      if (this.filter.socialChannelId) {
        this.fetchGuests()
      } else {
        this.guests = []
      }
    },
    handleChangeChannel(e) {
      const query = {
        ...this.$route.query,
        page: 1,
        channel: e.key,
      }
      this.$router.push({ query })
    },
    disabledDate(date) {
      return date > today
    },
    handleSearch: debounce(function () {
      const query = {
        ...this.$route.query,
        page: 1,
        search: this.filter.search,
      }
      if (!this.filter.search?.length) {
        delete query.search
      }
      this.$router.push({ query })
    }, 1000),
  },
}
</script>

<style lang="less" scoped>
.guest-management-page {
  padding: @padding-40 @padding-24;
  overflow: hidden auto;
  &__title {
    color: @black;
    font-size: @size-20;
    margin-bottom: 1rem;
    @apply font-semibold;
  }
  &__content {
    padding-top: 1rem;
  }
}

.guest-management-page-filters {
  margin-top: 0.5rem;
  @apply w-full flex-wrap flex items-center justify-between mb-4;
  .btn-filter {
    background-color: @gray-6;
    color: @black;
    width: @height-field;
    height: @height-field;
    @apply p-0 border-0 rounded-xl ml-2 inline-flex items-center justify-center;
    svg {
      font-size: @size-14;
      width: @size-14;
      height: @size-14;
    }
  }
  /deep/.ant-input-affix-wrapper {
    width: 35rem;
    height: @height-field;
    @apply m-2;
    .ant-input {
      height: 100%;
      border-color: @black-gray;
    }
  }
  /deep/.custom-select {
    color: @gray-1;
    font-size: @size-16;
    min-width: 22rem;
    width: fit-content;
    height: @height-field;
    @apply m-2;
    .ant-select-selection {
      border-color: @black-gray;
      height: 100%;
      &__rendered {
        height: 100%;
        line-height: @height-field;
      }
      .ant-select-selection-selected-value {
        display: flex !important;
        @apply items-center;
        @apply pr-2;
      }
      .ant-select-arrow-icon {
        color: @black;
      }
    }
  }
  /deep/.mx-datepicker-range {
    width: 38rem;
    height: @height-field;
    border-color: @black-gray;

    @apply m-2;
    .mx-input {
      height: @height-field;
    }
  }
  // /deep/&__social-channels {
  //   &--icon-channels {
  //     width: 28px;
  //     height: 28px;
  //     @apply inline-block mr-2;
  //   }
  // }
  /deep/.ant-cascader-picker {
    margin-right: 0.5rem;

    .ant-cascader-input {
      height: @height-field;
    }
  }
}
.guest-management-page-filters__social-channels--icon-channels {
  width: @size-28;
  height: @size-28;
  margin-right: @margin-8;
  @apply inline-block;
}
</style>
