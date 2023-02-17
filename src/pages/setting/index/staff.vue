<template>
  <div class="staff-page">
    <div class="staff-page__header staff-page-header">
      <div class="staff-page-header__title">{{ $t('staff-management') }}</div>
      <div class="staff-page-header__actions">
        <a-button type="primary" icon="plus" @click="handleOpenAddStaff">
          {{ $t('add-staff') }}
        </a-button>
      </div>
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <div class="staff-page__filters">
        <a-input v-model="search" :placeholder="$t('search-by-name-or-email')">
          <a-icon slot="prefix" type="search" />
        </a-input>
        <app-select-channel :channels="channels" />
      </div>
      <div class="staff-page__body">
        <staff-table
          :channels="channels"
          :staffs="staffs"
          :total="total"
          :loading="isLoading"
          @reload="fetchStaffs"
        ></staff-table>
      </div>

      <component
        :is="isTypeComponent"
        :is-show="isShowAddStaff"
        :channels="channels"
        @reload="fetchStaffs"
        @close="handleCloseAddStaff"
      ></component>
    </template>
  </div>
</template>

<script>
import { get, debounce } from 'lodash'
import StaffAdd from '@/components/Setting/Staff/StaffAdd'

export default {
  name: 'SettingStaffPage',
  fetchOnServer: false,
  components: {
    add: StaffAdd,
  },
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
      isShowAddStaff: false,
      isTypeComponent: '',
      search: '',
      channels: [],
      staffs: [],
      total: 0,
      isLoading: false,
    }
  },
  async fetch() {
    await Promise.all([this.fetchSocialChannels()])
  },
  watch: {
    '$route.query': {
      handler: debounce(function () {
        const {
          page = 1,
          limit = this.$store.state.limit,
          search = '',
        } = this.$route.query
        this.page = Number(page)
        this.limit = Number(limit)
        this.search = search
        this.fetchStaffs()
      }, 1000),
    },
    search() {
      this.handleSearch()
    },
  },
  methods: {
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
        }
      } catch (e) {}
    },
    async fetchStaffs() {
      try {
        this.isLoading = true
        // eslint-disable-next-line camelcase
        const { channel_ids } = this.$route.query
        // eslint-disable-next-line camelcase
        const socialChannelIds = channel_ids.length ? channel_ids : null
        const params = {
          ...(this.search && { search_columns: this.search }),
          ...(socialChannelIds && {
            'filter[social_channel_id]': socialChannelIds,
          }),
          limit: this.limit,
          page: this.page,
          include: 'social_channels',
        }
        if (!socialChannelIds?.length) {
          const { data, meta } = await this.$api.user.getUserMe()
          this.staffs = [{ ...data }]
          this.total = meta.pagination.total
        } else {
          const { data, meta } = await this.$api.user.getStaffs(params)
          this.staffs = [...data]
          this.total = meta.pagination.total
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    },
    handleOpenAddStaff() {
      this.isShowAddStaff = true
      this.isTypeComponent = 'add'
    },
    handleCloseAddStaff() {
      this.isShowAddStaff = false
      this.isTypeComponent = ''
    },
    handleSearch: debounce(function () {
      const query = {
        ...this.$route.query,
        page: 1,
        search: this.search,
      }
      if (!this.search) {
        delete query.search
      }
      this.$router.push({ query })
    }, 700),
  },
}
</script>

<style lang="less" scoped>
.staff-page {
  padding: @padding-40 @padding-24;

  &__filters {
    margin-top: 0.5rem;
    @apply flex items-center;

    /deep/.ant-input-affix-wrapper {
      width: 40%;
      margin-right: @margin-16;

      .ant-input {
        height: @height-field;
      }
    }
  }

  &__body {
    margin-top: 1rem;
  }
}

.staff-page-header {
  @apply flex items-center justify-between;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }
}
</style>
