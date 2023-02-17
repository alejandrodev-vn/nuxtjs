<template>
  <a-drawer
    placement="right"
    :closable="false"
    :visible="visible"
    class="channel-setup"
    width="35vw"
    destroy-on-close
    @close="handleClose"
  >
    <span v-if="visible" class="channel-setup__close" @click="handleClose">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <template slot="title">
      <p class="title">{{ $t('set-up-page-data') }}</p>
    </template>
    <div class="channel-setup__select-channel">
      <label for="filterChannel">{{ $t('channel-account') }}:</label>
      <a-select
        id="filterChannel"
        :value="selectedChannelId"
        size="large"
        class="custom-select"
        dropdown-class-name="channel-setup__dropdown"
        @change="handleChangeChannel"
      >
        <a-select-option
          v-for="channel in channelOptions"
          :key="channel.key"
          :value="channel.key"
        >
          <img
            :src="require(`~/assets/images/Icon/Icon-${channel.type}.png`)"
            class="channel-setup__dropdown--icon"
          />
          {{ channel.name }}
        </a-select-option>
      </a-select>
    </div>
    <p class="channel-setup__sub-title">
      {{ $t('choose-conversation-type-you-want-to-update') }}
    </p>
    <div class="channel-setup__tab">
      <div
        class="channel-setup__tab--item"
        :class="{ active: currentTab === configTabs.message }"
        @click="handleSwitchTab(configTabs.message)"
      >
        <a-checkbox
          :checked="isCheckedMessage"
          @change="handleCheckMessage"
          @click="(e) => e.stopPropagation()"
        >
          <span @click="(e) => e.stopPropagation()">{{ $t('message') }}</span>
        </a-checkbox>
      </div>
      <div
        class="channel-setup__tab--item"
        :class="{ active: currentTab === configTabs.comment }"
        @click="handleSwitchTab(configTabs.comment)"
      >
        <a-checkbox
          :checked="isCheckedComment"
          @change="handleCheckComment"
          @click="(e) => e.stopPropagation()"
        >
          <span @click="(e) => e.stopPropagation()">
            {{ $t('comment') }}
          </span>
        </a-checkbox>
      </div>
    </div>
    <keep-alive>
      <transition name="fade">
        <component
          :is="currentTab"
          :is-check-message="isCheckedMessage"
          :is-check-comment="isCheckedComment"
          :comment-options="commentOptions"
          :channel-id="selectedChannelId"
          @changeType="handleChangeType"
          @changePostStatus="handleChangePostStatus"
          @addPost="handleAddPost"
          @deletePost="handleDeletePost"
          @clearPosts="handleClearPosts"
        />
      </transition>
    </keep-alive>
    <div class="channel-setup__footer">
      <a-button style="margin-right: 8px" @click="handleClose">
        {{ $t('cancel') }}
      </a-button>
      <a-button type="primary" @click="handleSave">
        {{ $t('apply') }}
      </a-button>
    </div>
  </a-drawer>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
import ChannelSetupMessage from '@/components/Setting/Channel/ChannelSetup/ChannelSetupMessage.vue'
import ChannelSetupComment from '@/components/Setting/Channel/ChannelSetup/ChannelSetupComment.vue'
Vue.use(notification)

export default {
  name: 'ChannelSetup',
  components: {
    'channel-setup-message': ChannelSetupMessage,
    'channel-setup-comment': ChannelSetupComment,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    selectedChannelId: {
      type: Number,
      default: null,
    },
    selectedChannelData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      channels: [],
      currentTab: 'channel-setup-comment',
      commentOptions: {
        get_comment: 1,
        get_message: 1,
        get_all_post: 1,
        posts_status: 2,
        posts: [],
      },
      newsPosts: [],
      deletedPosts: [],
      isLoadingSubmit: false,
    }
  },
  async fetch() {
    await this.fetchSocialChannelActive()
  },
  computed: {
    configTabs() {
      return {
        message: 'channel-setup-message',
        comment: 'channel-setup-comment',
      }
    },
    configChannel() {
      return this.$store.state.configChannel
    },
    channelOptions() {
      return this.channels.map((item) => {
        return {
          key: item.social_channel_id,
          name: item.name,
          type: item.channel_type?.data?.code || '',
        }
      })
    },
    isCheckedMessage() {
      return this.commentOptions.get_message === 1
    },
    isCheckedComment() {
      return this.commentOptions.get_comment === 1
    },
  },
  watch: {
    selectedChannelData: {
      immediate: true,
      handler() {
        this.commentOptions = {
          ...this.selectedChannelData.config,
        }
      },
    },
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    async handleSave() {
      try {
        this.isLoadingSubmit = true
        if (
          this.commentOptions.get_all_post ===
            this.configChannel.manual_data_type.get_by_post_id &&
          !this.commentOptions.posts.length &&
          !this.newsPosts.length
        ) {
          notification.error({
            message: this.$t('please-add-at-least-one-post'),
            class: 'notification-error',
          })
          return
        }
        if (!this.isCheckedMessage && !this.isCheckedComment) {
          notification.error({
            message: this.$t('validate-require-setup-message-and-comment'),
            class: 'notification-error',
          })
          return
        }
        const payload = {
          get_comment: this.commentOptions.get_comment,
          get_message: this.commentOptions.get_message,
          get_all_post: this.commentOptions.get_all_post,
          posts_status: this.commentOptions.posts_status,
          news_posts: [...this.newsPosts],
          deleted_posts: [...this.deletedPosts],
        }
        await this.$api.socialChannel.setupConfigPage(
          this.selectedChannelId,
          payload
        )
        this.$emit('close')
        notification.success({
          message: this.$t('saved'),
          class: 'notification-success',
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.isLoadingSubmit = false
      }
    },
    handleAddPost(postId) {
      this.commentOptions?.posts?.push(postId)
      this.newsPosts.push(postId)
      const findIndexPostDelete = this.deletedPosts.findIndex(
        (post) => post === postId
      )
      if (findIndexPostDelete !== -1) {
        this.deletedPosts.splice(findIndexPostDelete, 1)
      }
    },
    handleDeletePost(postId) {
      const findPost = this.commentOptions.posts.find((post) => post === postId)
      if (findPost) {
        this.deletedPosts.push(findPost)
      }
      this.commentOptions.posts = this.commentOptions.posts.filter(
        (post) => postId !== post
      )
      this.newsPosts = this.newsPosts.filter((post) => postId !== post)
    },
    handleClearPosts() {
      this.deletedPosts = [...this.commentOptions.posts]
      this.newsPosts.splice(0, this.commentOptions.posts.length)
      this.commentOptions.posts.splice(0, this.commentOptions.posts.length)
    },
    handleChangeType(value) {
      this.commentOptions.get_all_post = value
    },
    handleChangePostStatus(value) {
      this.commentOptions.posts_status = value
    },
    handleChangeChannel(channelId) {
      this.$emit('changeChannel', channelId)
    },
    handleCheckMessage(e) {
      this.commentOptions.get_message = e.target.checked ? 1 : 0
    },
    handleCheckComment(e) {
      this.commentOptions.get_comment = e.target.checked ? 1 : 0
    },
    handleSwitchTab(key) {
      this.currentTab = key
    },
    async fetchSocialChannelActive() {
      try {
        const params = {
          paginate: false,
          'filter[token_status]': this.configChannel.token_status.active,
        }
        const { data } = await this.$api.socialChannel.getSocialChannelsByUser(
          params
        )
        if (data) {
          this.channels = data
        }
      } catch (e) {}
    },
  },
}
</script>
<style lang="less" scoped>
.channel-setup {
  &-body {
    margin-top: @margin-8;
    padding: @padding-8 @padding-24;
  }
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
  &__select-channel {
    border-radius: 8px;
    box-shadow: 0.1px 8px 24px rgba(25, 32, 56, 0.1);
    padding: @padding-16 @padding-24;
  }
  &__sub-title {
    margin-top: @margin-16;
    color: @black;
    font-size: @size-16;
    @apply font-medium;
  }
  &__tab {
    @apply flex items-center justify-between;
    /deep/&--item {
      padding: @padding-12 @padding-16;
      border-radius: 8px;
      width: 48%;
      border: 1px solid @gray-5;
      @apply font-medium cursor-pointer relative;
      span {
        color: @black;
        font-size: @size-14;
      }
      &:first-child {
        margin-right: @margin-12;
      }
      &.active {
        border: none;
        background-color: @primary-3;
        &::after {
          content: '';
          position: absolute;
          width: 90%;
          height: 2px;
          background-color: @primary;
          border-radius: 5px 0 0 5px;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          transition: 0.25s linear;
        }
      }
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
    padding-inline: 2.5rem;
    @apply absolute bottom-0 left-0 w-full py-4
      text-right shadow-2xl;
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
