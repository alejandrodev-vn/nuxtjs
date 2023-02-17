<template>
  <div class="unsafe-keyword-page">
    <div class="unsafe-keyword-page__header unsafe-keyword-page-header">
      <div class="unsafe-keyword-page-header__title">
        {{ $t('unsafe-keyword') }}
      </div>
      <div class="unsafe-keyword-page-header__actions">
        <a-button type="primary" icon="plus" @click="handleOpenAddKeyword">
          {{ $t('add-unsafe-keyword') }}
        </a-button>
      </div>
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <div class="unsafe-keyword-page__body">
        <unsafe-keyword-table
          :keywords="keywords"
          :total="total"
          @reload="fetchUnsafeKeywords"
        />
      </div>

      <component
        :is="isTypeComponent"
        :is-show="isShowAddKeyword"
        :keywords="keywords"
        @reload="fetchUnsafeKeywords"
        @close="handleCloseAddKeyword"
      ></component>
    </template>
  </div>
</template>

<script>
import { get } from 'lodash'
import UnsafeKeywordAdd from '@/components/Setting/UnsafeKeyword/UnsafeKeywordAdd'

export default {
  name: 'UnsafeKeyword',
  components: {
    add: UnsafeKeywordAdd,
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
      total: 0,
    }
  },
  async fetch() {
    await this.fetchUnsafeKeywords()
  },
  watch: {
    '$route.query': {
      handler() {
        const { page = 1, limit = this.$store.state.limit } = this.$route.query
        this.page = Number(page)
        this.limit = Number(limit)
        this.fetchUnsafeKeywords()
      },
    },
  },
  methods: {
    async fetchUnsafeKeywords() {
      try {
        const params = {
          limit: this.limit,
          page: this.page,
        }
        const { data, meta } =
          await this.$api.unsafeKeyword.getListUnsafeKeyword(params)
        if (data) {
          this.keywords = data
          this.total = meta.pagination.total
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
.unsafe-keyword-page {
  padding: @padding-40 @padding-24;

  &__filters {
    margin-top: 0.5rem;
    @apply flex items-center;

    /deep/.ant-input-affix-wrapper {
      width: 40%;
      margin-right: 0.5rem;

      .ant-input {
        height: @height-field;
      }
    }
  }

  &__body {
    margin-top: 1rem;
    /deep/.ant-table-column-title {
      @apply font-medium;
    }
  }
}

.unsafe-keyword-page-header {
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
