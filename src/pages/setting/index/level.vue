<template>
  <div class="level-page">
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <div class="level-page__header level-page-header">
        <div class="level-page-header__title">{{ $t('guest-level') }}</div>
        <div class="level-page-header__actions">
          <a-button
            type="primary"
            class="btn-set-requirement"
            @click="handleOpenSetRequirement"
          >
            <icon-edit class="icon-edit" />
            {{ $t('set-requirement') }}
          </a-button>
        </div>
      </div>
      <div class="level-page__body">
        <level-table :levels="levels"></level-table>
      </div>

      <component
        :is="isTypeComponent"
        :is-show="isShowSetRequirement"
        :levels="levels"
        @reload="fetchLevels"
        @close="handleCloseSetRequirement"
      ></component>
    </template>
  </div>
</template>

<script>
import { get } from 'lodash'
import LevelSetRequirement from '@/components/Setting/Level/LevelSetRequirement'

export default {
  name: 'SettingLevelPage',
  fetchOnServer: false,
  components: {
    set: LevelSetRequirement,
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
      isShowSetRequirement: false,
      isTypeComponent: '',
      levels: [],
    }
  },
  async fetch() {
    await this.fetchLevels()
  },
  watch: {
    levels() {
      if (this.levels.length) return
      this.addInitLevels()
    },
  },
  methods: {
    async fetchLevels() {
      try {
        const { data } = await this.$api.level.getLevels()
        if (data) {
          this.levels = data
        }
      } catch (e) {}
    },
    async addInitLevels() {
      try {
        const { data } = await this.$api.level.addLevels()
        if (data) {
          this.levels = data
        }
      } catch (e) {}
    },
    handleOpenSetRequirement() {
      this.isShowSetRequirement = true
      this.isTypeComponent = 'set'
    },
    handleCloseSetRequirement() {
      this.isShowSetRequirement = false
      this.isTypeComponent = ''
    },
  },
}
</script>

<style lang="less" scoped>
.level-page {
  padding: @padding-40 @padding-24;

  &__body {
    margin-top: 1rem;
  }
}

.level-page-header {
  @apply flex items-center justify-between;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }
  &__actions {
    .btn-set-requirement {
      font-size: @size-14;
      @apply flex items-center font-medium;
      .icon-edit {
        @apply mr-2;
      }
    }
  }
}
</style>
