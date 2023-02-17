<template>
  <a-drawer
    placement="right"
    :closable="false"
    :visible="isVisible"
    class="chat-comment-filter"
    width="25vw"
    @close="handleClose"
  >
    <span
      v-if="isVisible"
      class="chat-comment-filter__close"
      @click="handleClose"
    >
      <icon-right class="btn-trigger-collapse" />
    </span>
    <template slot="title">
      <p class="title">{{ $t('filter') }}</p>
    </template>
    <label for="filterChannel">{{ $t('pageAccount') }}</label>
    <a-select
      id="filterChannel"
      :value="filters.channel"
      size="large"
      class="custom-select"
      dropdown-class-name="chat-comment-filter__dropdown"
      @change="handleChangeChannel"
    >
      <a-select-option
        v-for="channel in channelOptions"
        :key="channel.key"
        :value="channel.key"
      >
        <img
          :src="require(`~/assets/images/Icon/Icon-${channel.type}.png`)"
          class="chat-comment-filter__dropdown--icon"
        />
        {{ channel.name }}
      </a-select-option>
    </a-select>
    <template v-if="currentChannelType !== 'shopee'">
      <label for="filterType">{{ $t('conversationType') }}</label>
      <a-select
        id="filterType"
        :value="filters.conversationType"
        size="large"
        class="custom-select"
        dropdown-class-name="chat-comment-filter__dropdown"
        @change="handleChangeConversationType"
      >
        <a-select-option
          v-for="item in conversationTypeOptions"
          :key="item.key"
          :value="item.value"
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
      <label for="filterPostId">{{ $t('postId') }}</label>
      <app-select-post-id
        v-if="filters.conversationType === configConversationTypeString.comment"
        :value="filters.postId"
        allow-clear
        :disabled="
          filters.conversationType !== configConversationTypeString.comment
        "
        :social-channel-id="filters.channel"
        @handleChangeValue="handleChangePostId"
      />
      <!-- <a-select
        id="filterPostId"
        show-search
        :allow-clear="filters.postId !== ''"
        option-filter-prop="children"
        size="large"
        class="custom-select"
        :placeholder="$t('allPostId')"
        dropdown-class-name="chat-comment-filter__dropdown"
        :disabled="filters.type === 'chat'"
        :filter-option="filterOptionPostId"
        :value="filters.postId"
        :loading="isLoadingMorePostId"
        @search="handleChangeSearchPostId"
        @change="handleChangePostId"
        @popupScroll="handleScrollPostId"
      >
        <a-select-option value="">
          {{ $t('allPostId') }}
        </a-select-option>
        <a-select-option
          v-for="post in posts"
          :key="post.id"
          :value="post.social_id"
        >
          {{ post.social_id }}
        </a-select-option>
      </a-select> -->
    </template>
    <label for="filterDates">{{ $t('conversationDates') }}</label>
    <app-date-picker
      :value="filters.range"
      :disabled-date="disabledDate"
      :use-query-router="false"
      :placeholder="$t('all-time')"
      :append-to-body="false"
      popup-class="placement-right"
      @input="handleChangeRange"
    />
    <label for="filterBlockStatus" class="flex items-center">
      {{ $t('blockStatus') }}
      <a-tooltip overlay-class-name="custom-tooltip-light">
        <template slot="title">
          <span>
            {{ $t('tooltip-block-status') }}
          </span>
        </template>
        <a-icon class="ml-2" type="info-circle" />
      </a-tooltip>
    </label>
    <a-select
      id="filterBlockStatus"
      v-model="filters.status"
      size="large"
      class="custom-select"
      dropdown-class-name="chat-comment-filter__dropdown"
    >
      <a-select-option value=""> {{ $t('allBlockStatus') }} </a-select-option>
      <a-select-option value="1"> {{ $t('yes') }} </a-select-option>
      <a-select-option value="2"> {{ $t('no') }} </a-select-option>
    </a-select>
    <!-- <label for="filterCurrentTags">{{ $t('currentTags') }}</label>
    <a-cascader
      id="filterCurrentTags"
      v-model="filters.tags"
      :options="tagOptions"
      size="large"
      class="custom-cascader"
      :placeholder="$t('allCurrentTags')"
    /> -->
    <div class="chat-comment-filter__footer">
      <a-button style="margin-right: 8px" @click="handleSetDefaultFilter">
        {{ $t('defaultFilter') }}
      </a-button>
      <a-button type="primary" @click="handleApplyFilter">
        {{ $t('apply') }}
      </a-button>
    </div>
  </a-drawer>
</template>

<script>
import { get, debounce } from 'lodash'
import { today } from '@/utils/moment'

export default {
  name: 'ChatCommentFilter',
  props: {
    isVisible: {
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
      posts: [],
      tags: [],
      filters: {
        channel: '',
        conversationType: '',
        postId: '',
        range: [],
        tags: [],
        status: '',
      },
      currentChannelType: '',
      searchPostId: '',
      pagePostId: 1,
      totalPagePostId: 0,
      isLoadingMorePostId: false,
    }
  },
  computed: {
    configConversationTypeString() {
      return this.$store.state.configConversations.typeString
    },
    channelOptions() {
      return this.channels.map((item) => {
        return {
          key: `${item.social_channel_id}`,
          name: item.name,
          type: get(item, 'channel_type.data.code', '') || '',
        }
      })
    },
    conversationTypeOptions() {
      return [
        {
          key: 1,
          value: this.configConversationTypeString.chat,
          name: this.$t('chat'),
        },
        {
          key: 2,
          value: this.configConversationTypeString.comment,
          name: this.$t('comment'),
        },
      ]
    },
    pageId() {
      return this.$route.params.page
    },
    defaultChannel() {
      const primaryChannelId = get(this.channelOptions, '0.key', {}) || {}
      const pageId = this.pageId || primaryChannelId
      return pageId
    },
    defaultConversationType() {
      return this.$route.params.type || 'chat'
    },
    tagOptions() {
      return this.tags.map((item) => {
        const children = get(item, 'children.data', []) || []
        return {
          value: item.id,
          label: item.name,
          ...(children.length && {
            children: children.map((child) => {
              return this.handleTag(child)
            }),
          }),
        }
      })
    },
    infoPage() {
      return this.$store.state.currentInfoPage
    },
  },
  watch: {
    pageId() {
      this.filters.channel = this.defaultChannel
    },
    infoPage: {
      immediate: true,
      handler() {
        if (this.infoPage) {
          this.currentChannelType = this.infoPage.channel_type.data.code
        }
      },
    },
    searchPostId: debounce(function (value) {
      this.searchPostId = value
      this.posts = []
      this.pagePostId = 1
      this.totalPagePostId = 0
      this.fetchPostId()
    }, 1000),
    'filters.channel': {
      handler() {
        this.filters.postId = ''
      },
    },
    defaultConversationType: {
      immediate: true,
      handler() {
        this.filters.conversationType = this.defaultConversationType
      },
    },
  },
  created() {
    this.filters.channel = this.defaultChannel
  },
  methods: {
    handleChangePostId(value) {
      this.filters.postId = value || ''
    },
    // handleChangeSearchPostId(value) {
    //   this.searchPostId = value
    // },
    // handleScrollPostId(e) {
    //   const { target } = e
    //   if (
    //     !this.isLoadingMorePostId &&
    //     this.pagePostId < this.totalPagePostId &&
    //     target.scrollTop + target.offsetHeight >= target.scrollHeight - 10
    //   ) {
    //     this.pagePostId++
    //     this.fetchPostId()
    //   }
    // },
    // async fetchPostId() {
    //   try {
    //     this.isLoadingMorePostId = true
    //     const params = {
    //       'filter[social_channel_id]': this.filters.channel,
    //       ...(this.searchPostId?.length && {
    //         'filter[social_id]': this.searchPostId,
    //       }),
    //       sort: '-published_date',
    //       page: this.pagePostId,
    //       limit: 10,
    //     }
    //     const { data, meta } = await this.$api.socialPosts.getSocialPostList(
    //       params
    //     )
    //     if (data) {
    //       this.posts = [...this.posts, ...data]
    //       this.totalPagePostId = meta.pagination.total_pages
    //     }
    //   } catch (e) {
    //   } finally {
    //     this.isLoadingMorePostId = false
    //   }
    // },
    async fetchAllTags() {
      try {
        const { data } = await this.$api.tags.getAllTags()
        if (data) {
          this.tags = data
        }
      } catch (e) {}
    },
    async fetchTagsChildren(id) {
      try {
        const params = {
          include: 'children',
        }
        const { data } = await this.$api.tags.getTagsChildren(id, params)
        if (data) {
          return data
        }
      } catch (e) {}
    },

    handleTag(tag) {
      const children = get(tag, 'children.data', []) || []
      return {
        value: tag.id,
        label: tag.name,
        ...(children.length && {
          children: children.map((child) => {
            return this.handleTag(child)
          }),
        }),
      }
    },
    handleClose() {
      this.$emit('close')
    },
    handleChangeChannel(value) {
      this.filters.channel = value
      this.filters.postId = ''
      const channel = this.channels.find(
        (item) => item.social_channel_id === parseInt(value)
      )
      if (channel) {
        this.currentChannelType = channel.channel_type.data.code
        if (
          this.currentChannelType === 'facebook' ||
          this.currentChannelType === 'instagram'
        ) {
          this.filters.postId = ''
        }
      }
    },
    handleChangeConversationType(value) {
      this.filters.conversationType = value
      this.filters.postId = ''
    },
    handleApplyFilter() {
      this.$emit('filters', this.filters)
      this.handleClose()
    },
    handleSetDefaultFilter() {
      this.filters.channel = this.defaultChannel
      this.filters.conversationType = this.defaultConversationType
      this.filters.postId = ''
      this.filters.range = []
      this.filters.status = ''
      this.filters.tags = []
    },
    disabledDate(date) {
      return date > today
    },
    handleChangeRange(date = []) {
      this.filters.range = date
      if (!date[0] || !date[1]) {
        this.filters.range = []
      }
    },
  },
}
</script>
<style lang="less" scoped>
.chat-comment-filter {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    z-index: 10;
    cursor: pointer;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }

  &__dropdown {
    &--icon {
      width: 2rem;
      height: 2rem;
      @apply inline-block mr-2;
    }
  }

  &__footer {
    background-color: @white;
    @apply absolute bottom-0 left-0 w-full px-2 py-4 text-right shadow-2xl;
  }

  /deep/.ant-drawer-content {
    overflow: unset;
    .ant-drawer-header {
      @apply relative border-0 pt-12;
      .title {
        color: @black;
        font-size: @size-2;
        @apply m-0 font-semibold;
      }
    }
    .ant-drawer-wrapper-body {
      overflow: unset;
      @apply flex flex-col;
      .ant-drawer-body {
        @apply flex-1 pt-0;
        .custom-select-post-id {
          margin-bottom: 1.5rem;
        }
        .custom-select,
        .custom-cascader {
          .ant-select-selection__rendered {
            font-size: @size-16;
          }
          @apply w-full mt-2 mb-6;
          .ant-select-selection-selected-value {
            @apply flex items-center;
          }
          .mx-input {
            height: 38px;
          }
        }
      }
    }
  }
}
</style>
