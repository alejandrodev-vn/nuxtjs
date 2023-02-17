<template>
  <app-filter-advanced
    :is-show="isShow"
    :is-loading="isLoading"
    @close="handleClose"
    @save="handleSave"
    @setDefault="handleSetDefault"
  >
    <template slot="form">
      <a-form-model
        ref="form"
        class="response-history-filter__social-channels"
        :colon="false"
      >
        <a-form-model-item
          ref="channel"
          prop="channel"
          :label="$t('channel-account')"
        >
          <a-select
            v-model="filter.socialChannelId"
            size="large"
            class="custom-select"
            dropdown-class-name="response-history-filter__social-channels"
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
                class="response-history-filter__social-channels--icon-channels"
              />
              {{ channel.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item
          v-if="!isShopee"
          ref="conversationType"
          prop="conversationType"
          :label="$t('conversationType')"
        >
          <a-select v-model="filter.conversationType">
            <a-select-option
              v-for="item in conversationTypeOptions"
              :key="item.key"
              :value="item.value"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item
          v-if="filter.conversationType === configConversationType.comment"
          ref="postId"
          prop="postId"
          :label="$t('postId')"
        >
          <!-- <a-select
            v-model="filter.postId"
            size="large"
            class="custom-select-multiple"
            dropdown-class-name="dropdown-custom-select-multiple"
            :loading="$fetchState.pending"
            :placeholder="$t('search-id')"
            :not-found-content="notFoundContent"
            :disabled="
              filter.conversationType !== configConversationType.comment
            "
            option-label-prop="value"
          >
            <a-select-option
              v-for="post in posts"
              :key="post.social_id"
              :value="post.social_id"
            >
              <img
                :src="
                  post.thumbnail_image
                    ? post.thumbnail_image
                    : require('~/assets/images/Icon/No-Image.png')
                "
                class="dropdown-custom-select-multiple__thumbnail"
              />
              <div class="w-full">
                <p class="dropdown-custom-select-multiple__post-id">
                  {{ post.social_id }}
                </p>
                <p class="dropdown-custom-select-multiple__description">
                  {{ post.full_description }}
                </p>
              </div>
            </a-select-option>
          </a-select> -->
          <app-select-post-id
            :value="filter.postId"
            allow-clear
            :disabled="
              filter.conversationType !== configConversationType.comment
            "
            :social-channel-id="filter.socialChannelId"
            @handleChangeValue="handleChangePostId"
          />
        </a-form-model-item>
        <a-form-model-item ref="status" prop="status" :label="$t('status')">
          <a-select
            v-model="filter.status"
            size="large"
            class="custom-select"
            dropdown-class-name="response-history__social-channels"
            :loading="$fetchState.pending"
          >
            <a-select-option
              v-for="status in statusOptions"
              :key="status.key"
              :value="status.value"
            >
              {{ status.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item ref="tags" prop="tags" :label="$t('tags')">
          <!-- <a-cascader
            v-model="filter.tags"
            :options="tagOptions"
            :load-data="loadDataTagChildren"
            :placeholder="$t('allCurrentTags')"
            :allow-clear="true"
            expand-trigger="click"
            popup-class-name="custom-popup-cascader-guest-management"
          /> -->
          <app-filter-data-tag
            :value="filter.tags"
            :social-channel-id="filter.socialChannelId"
            allow-clear
            @change="handleChangeFilterDataTag"
          />
        </a-form-model-item>
        <a-form-model-item
          ref="respondedBy"
          prop="respondedBy"
          :label="$t('responded-by')"
        >
          <a-select v-model="filter.respondedBy">
            <a-select-option
              v-for="user in userOptions"
              :key="user.key"
              :value="user.value"
            >
              {{ user.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
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
            :clearable="false"
            popup-class="placement-right"
            @input="handleChangeRange"
          />
        </a-form-model-item>
      </a-form-model>
    </template>
  </app-filter-advanced>
</template>
<script>
import { get } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
import { today, last30Days } from '@/utils/moment'
Vue.use(notification)

export default {
  name: 'ResponseHistoryFilterAdvanced',
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
      users: [],
      posts: [],
      filter: {
        socialChannelId: null,
        conversationType: 0,
        respondedBy: 0,
        range: [new Date(last30Days), new Date(today)],
        status: 0,
        tags: [],
        postId: '',
        // postIds: [],
      },
      filterInit: {
        socialChannelId: null,
        conversationType: 0,
        respondedBy: 0,
        range: [new Date(last30Days), new Date(today)],
        status: 0,
        tags: [],
        postId: '',
        // postIds: [],
      },
      tagOptions: [],
    }
  },
  async fetch() {
    await this.fetchAllUsers()
    // await this.fetchPosts()
  },
  computed: {
    notFoundContent() {
      return <app-no-data text={this.$t('no-data')} />
    },
    configConversationType() {
      return this.$store.state.configConversations.type
    },
    conversationTypeOptions() {
      return [
        { key: 0, value: 0, name: this.$t('all-conversation-type') },
        {
          key: 1,
          value: this.configConversationType.chat,
          name: this.$t('chat'),
        },
        {
          key: 2,
          value: this.configConversationType.comment,
          name: this.$t('comment'),
        },
      ]
    },
    userOptions() {
      const users = this.users.map((item) => {
        return {
          key: item.id,
          name: item.name,
          value: item.id,
        }
      })
      return [{ key: 0, value: 0, name: this.$t('all-users') }, ...users]
    },
    statusOptions() {
      const status = this.$store.state.configConversations.status
      const arrayKeyStatus = Object.keys(status).map((status) => status)
      return [
        { key: 0, value: 0, name: this.$t('all-status') },
        {
          key: status.opening,
          name: this.$t(arrayKeyStatus[status.opening]),
          value: status.opening,
        },
        {
          key: status.direct_response,
          name: this.$t(arrayKeyStatus[status.direct_response]),
          value: status.direct_response,
        },
        {
          key: status.direct_skip,
          name: this.$t(arrayKeyStatus[status.direct_skip]),
          value: status.direct_skip,
        },
        {
          key: status.waiting_escalate,
          name: this.$t(arrayKeyStatus[status.waiting_escalate]),
          value: status.waiting_escalate,
        },
        {
          key: status.escalate_response,
          name: this.$t(arrayKeyStatus[status.escalate_response]),
          value: status.escalate_response,
        },
        {
          key: status.escalate_skip,
          name: this.$t(arrayKeyStatus[status.escalate_skip]),
          value: status.escalate_skip,
        },
      ]
    },
    isStaff() {
      const user = this.$auth.user
      const role = get(user, 'roles[0]', '') || ''
      return role === 'member' || role === 'crew'
    },
    hasPermissionSetting() {
      const permissions = this.$auth.user.permissions || []
      return permissions.includes('setting')
    },
    isShopee() {
      return this.channels.some(
        (channel) =>
          channel.id === this.filter.socialChannelId &&
          channel.channel_type.data.code === 'shopee'
      )
    },
    // tagOptions() {
    //   return this.tags.map((item) => {
    //     const children = get(item, 'children.data', []) || []
    //     return {
    //       value: `${item.id}`,
    //       label: item.name,
    //       select: true,
    //       ...(children.length && {
    //         children: children.map((child) => {
    //           return this.handleTag(child)
    //         }),
    //       }),
    //     }
    //   })
    // },
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler() {
        this.handlerFilter()
      },
    },
    'filter.socialChannelId': {
      handler() {
        this.filter.postId = ''
      },
    },
  },
  methods: {
    handleChangeFilterDataTag(value) {
      this.filter.tags = value
    },
    async loadDataTagChildren(selectedOptions) {
      try {
        const targetOption = selectedOptions[selectedOptions.length - 1]
        targetOption.loading = true
        const data = await this.fetchChildrenTag(targetOption.value)
        if (data.length) {
          const children = data.map((item) => {
            return {
              ...item,
              value: `${item.id}`,
              label: item.name,
              isLeaf: !item.total_children,
            }
          })
          targetOption.children = children
        }
        targetOption.loading = false
        this.tagOptions = [...this.tagOptions]
      } catch (error) {
        console.log(error)
      }
    },
    async fetchChildrenTag(tagId) {
      try {
        if (!tagId) return
        const params = {
          'filter[status]': this.$store.state.tag.status.unhide,
          'filter[parent_status]': this.$store.state.tag.status.unhide,
        }
        const data = await this.$api.tags.getTagDetail(tagId, params)
        if (data) {
          return data
        }
      } catch (error) {}
    },
    async fetchTags() {
      try {
        const params = {
          'filter[social_channel_id]': this.filter.socialChannelId,
          include: 'social_channel',
        }
        const { data } = await this.$api.tags.getAllTags(params)
        if (data) {
          this.tagOptions = data.map((item) => {
            return {
              ...item,
              value: `${item.id}`,
              label: item.name,
              isLeaf: !item.total_children,
            }
          })
        }
      } catch (e) {}
    },
    handleChangePostId(value) {
      this.filter.postId = value || ''
    },
    async fetchAllUsers() {
      try {
        const { data } = this.hasPermissionSetting
          ? await this.$api.user.getStaffs()
          : await this.$api.user.getUserMe()
        if (data?.length) {
          this.users = Object.freeze([...data])
          return
        }
        this.users = Object.freeze([{ ...data }])
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    async fetchPosts() {
      try {
        if (!this.filter.socialChannelId) return
        const params = {
          'filter[social_channel_id]': this.filter.socialChannelId,
          sort: '-published_date',
          page: this.pagePostId,
          limit: 10,
        }
        const { data, meta } = await this.$api.socialPosts.getSocialPostList(
          params
        )
        if (data?.length) {
          this.posts = [...data]
          this.totalPagePostId = meta.pagination.total_pages
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
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
    handleChangeRange(date = []) {
      this.filter.range = date
      if (!date[0] || !date[1]) {
        this.filter.range = [new Date(last30Days), new Date(today)]
      }
    },
    disabledDate(date) {
      return date > today
    },
    handleClose() {
      this.handlerFilter()
      this.$emit('close')
    },
    handlerFilter() {
      const {
        channel_id,
        responded_by = 0,
        conversation_type = 0,
        date_from,
        date_to,
        status = 0,
        post_id = '',
        tags = '',
      } = this.$route.query
      if (channel_id && !isNaN(channel_id)) {
        this.filter.socialChannelId = parseInt(channel_id)
      }
      if (!isNaN(responded_by)) {
        this.filter.respondedBy = parseInt(responded_by)
      }
      if (!isNaN(conversation_type)) {
        this.filter.conversationType = parseInt(conversation_type)
      }
      if (!isNaN(status)) {
        this.filter.status = parseInt(status)
      }
      this.filter.postId = post_id || ''
      this.filter.tags = tags?.length ? tags.split(',') : []
      if (date_from && date_to) {
        this.filter.range = [new Date(date_from), new Date(date_to)]
      } else {
        this.filter.range = [new Date(last30Days), new Date(today)]
      }
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
        ...(!isNaN(this.filter.conversationType) && {
          conversation_type: this.filter.conversationType,
        }),
        ...(this.filter.socialChannelId && {
          channel_id: this.filter.socialChannelId,
        }),
        ...(this.filter.postId?.length && {
          post_id: this.filter.postId,
        }),
        ...(!isNaN(this.filter.status) && {
          status: this.filter.status,
        }),
        ...(this.filter.tags?.length && {
          tags: this.filter.tags.join(','),
        }),
        ...(!isNaN(this.filter.respondedBy) && {
          responded_by: this.filter.respondedBy,
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
.response-history-filter {
  &__social-channels {
    &--icon-channels {
      width: @size-28;
      height: @size-28;
      margin-right: @margin-8;
      @apply inline-block;
    }
  }
}
/deep/.custom-select-multiple {
  color: @black;
  font-size: @size-16;
  height: auto !important;
  .ant-select-selection {
    border-color: @black-gray !important;
    min-height: @height-field !important;
    height: auto !important;
    padding-block: 0;
    &__rendered {
      line-height: @height-field !important;
      .ant-select-selection__choice {
        background-color: @primary;
        border-radius: 9999px;
        padding-right: 28px !important;
        &__content {
          color: @white;
        }
        &__remove {
          .anticon-close.ant-select-remove-icon {
            font-size: @size-14;
            border-radius: 50%;
            border: 2px solid white;
            color: @white;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            right: 0.5rem;
            top: 1rem;
            padding: 2px;
            transition: 0.25s linear;
            &:hover {
              color: @red;
              transform: scale(1.3);
              border-color: @red;
            }
          }
        }
      }
    }
  }
  .ant-select-arrow {
    color: @black;
    font-size: @size-10;
    top: 55%;
  }
}
</style>
