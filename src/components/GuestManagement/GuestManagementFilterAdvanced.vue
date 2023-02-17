<template>
  <app-filter-advanced
    :is-show="isShow"
    :is-loading="isLoading"
    @close="handleClose"
    @save="handleSave"
    @setDefault="handleSetDefault"
  >
    <template slot="form">
      <a-form-model ref="form" class="guest-management-filter" :colon="false">
        <a-form-model-item
          ref="channel"
          prop="channel"
          :label="$t('channel-account')"
        >
          <a-select
            v-model="filter.socialChannelId"
            size="large"
            class="custom-select"
            dropdown-class-name="guest-management-filter__social-channels"
            :loading="isLoading"
          >
            <a-select-option
              v-for="channel in channels"
              :key="channel.id"
              :value="channel.social_channel_id"
            >
              <img
                :src="
                  require(`~/assets/images/Icon/Icon-${channel.channel_type.data.code}.png`)
                "
                class="guest-management-filter__social-channels--icon-channels"
              />
              {{ channel.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item ref="level" prop="level" :label="$t('level')">
          <a-select v-model="filter.level">
            <template v-for="item in levelOptions">
              <a-select-option :key="item.key" :value="item.value">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-model-item>
        <!-- <a-form-model-item ref="tags" prop="tags" :label="$t('tags')">
          <a-cascader
            v-model="filter.tags"
            :options="tagOptions"
            :placeholder="$t('allCurrentTags')"
            :allow-clear="true"
            expand-trigger="click"
            popup-class-name="custom-popup-cascader-guest-management"
          />
        </a-form-model-item> -->
        <a-form-model-item
          ref="range"
          prop="range"
          :label="$t('creation-date')"
        >
          <app-date-picker
            :value="filter.range"
            :disabled-date="disabledDate"
            :use-query-router="false"
            :placeholder="$t('response-date')"
            :append-to-body="false"
            popup-class="placement-right"
            @input="handleChangeRange"
          />
        </a-form-model-item>
      </a-form-model>
    </template>
  </app-filter-advanced>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { get } from 'lodash'
import { today, last30Days } from '@/utils/moment'
Vue.use(notification)

export default {
  name: 'GuestManagementFilterAdvanced',
  fetchOnServer: false,
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    channels: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      tags: [],
      filter: {
        socialChannelId: null,
        level: 0,
        tags: [],
        range: [new Date(last30Days), new Date(today)],
      },
      filterInit: {
        socialChannelId: null,
        level: 0,
        tags: [],
        range: [new Date(last30Days), new Date(today)],
      },
    }
  },
  async fetch() {
    await await this.fetchTags()
  },
  computed: {
    levelOptions() {
      const level = this.$store.state.level
      const levels = Object.keys(level).map((item) => {
        return {
          key: item,
          value: level[item],
          name: this.$t(item),
        }
      })
      return [{ key: 0, value: 0, name: this.$t('all-level') }, ...levels]
    },
    tagOptions() {
      return this.tags.map((item) => {
        const children = get(item, 'children.data', []) || []
        return {
          value: `${item.id}`,
          label: item.name,
          select: true,
          ...(children.length && {
            children: children.map((child) => {
              return this.handleTag(child)
            }),
          }),
        }
      })
    },
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler() {
        this.handlerFilter()
      },
    },
  },
  destroyed() {
    this.handlerFilter()
  },
  methods: {
    async fetchTags() {
      try {
        const { data } = await this.$api.tags.getAllTags()
        if (data) {
          this.tags = data
        }
      } catch (e) {}
    },
    handleTag(tag) {
      const children = get(tag, 'children.data', []) || []
      return {
        value: `${tag.id}`,
        label: tag.name,
        ...(!children.length && { select: true }),
        ...(children.length && {
          children: children.map((child) => {
            return this.handleTag(child)
          }),
        }),
      }
    },
    disabledDate(date) {
      return date > today
    },
    handleChangeRange(date = []) {
      this.filter.range = date
      if (!date[0] || !date[1]) {
        this.filter.range = [new Date(last30Days), new Date(today)]
      }
    },
    handleClose() {
      this.handlerFilter()
      this.$emit('close')
    },
    handlerFilter() {
      const {
        channel_id,
        level = 0,
        date_from,
        date_to,
        tags = '',
      } = this.$route.query
      if (channel_id && !isNaN(channel_id)) {
        this.filter.socialChannelId = parseInt(channel_id)
      }
      this.filter.level = parseInt(level)
      if (date_from && date_to) {
        this.filter.range = [new Date(date_from), new Date(date_to)]
      } else {
        this.filter.range = [new Date(last30Days), new Date(today)]
      }
      this.filter.tags = tags?.length ? tags.split(',') : []
    },
    handleSave() {
      const fromDate = this.filter.range[0]
        ? this.$moment(this.filter.range[0]).format('YYYY-MM-DD HH:mm')
        : null
      const toDate = this.filter.range[1]
        ? this.$moment(this.filter.range[1]).format('YYYY-MM-DD HH:mm')
        : null
      const query = {
        ...(this.$route.query.search?.length && {
          search: this.$route.query.search,
        }),
        ...(this.filter.socialChannelId && {
          channel_id: this.filter.socialChannelId,
        }),
        ...(this.filter.level && {
          level: this.filter.level,
        }),
        ...(this.filter.tags?.length && {
          tags: this.filter.tags.join(','),
        }),
        ...(fromDate && { date_from: fromDate }),
        ...(toDate && { date_to: toDate }),
        page: 1,
      }
      this.$router.push({ query })
      this.handleClose()
    },
    handleSetDefault() {
      if (this.channels?.length && this.channels[0]) {
        this.filterInit.socialChannelId = this.channels[0].social_channel_id
      }
      this.filter = {
        ...this.filterInit,
      }
    },
  },
}
</script>
<style lang="less" scoped>
.guest-management-filter {
  &__social-channels {
    &--icon-channels {
      width: @size-28;
      height: @size-28;
      @apply inline-block mr-2;
    }
  }
}
</style>
<style lang="less">
.custom-popup-cascader-guest-management {
  .ant-cascader-menu-item {
    padding-right: 6rem;
    color: @black;
    font-size: @size-16;
    .ant-cascader-menu-item-expand-icon {
      color: @black;
      font-size: @size-16;
    }
  }
}
</style>
