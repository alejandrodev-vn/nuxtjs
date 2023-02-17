<template>
  <div class="conversation">
    <app-loading v-if="isLoading" class="mt-6" />
    <div
      v-else-if="!conversations.length || !socialProfileId || !infoFan"
      class="no-action"
    >
      <p>{{ $t('noActionConversation') }}</p>
    </div>
    <template v-else>
      <div class="conversation-top">
        <div class="conversation-top__left">
          <div class="conversation-top__left__avatar">
            <app-avatar
              :image="infoFan.avatar"
              :full-name="infoFan.full_name"
              :size="44"
            />
          </div>
          <span class="conversation-top__left__name">
            <a-tooltip overlay-class-name="custom-tooltip-light">
              <template slot="title"> {{ infoFan.full_name }} </template>
              {{ infoFan.full_name }}
            </a-tooltip>
          </span>
        </div>
        <div class="conversation-top__right">
          <div
            v-if="!isHiddenSwitchConversationType && infoPage"
            class="conversation-top__right__switch-conversation"
          >
            <span
              :class="{
                'conversation-top__right__switch-conversation--gray':
                  conversationType === chat,
              }"
              >{{ $t('comment') }}</span
            >
            <a-switch
              :checked="conversationType === chat"
              size="small"
              default-checked
              :disabled="isLoading"
              @click="handleChangeConversationType"
            />
            <span
              :class="{
                'conversation-top__right__switch-conversation--gray':
                  conversationType === comment,
              }"
            >
              {{ $t('chat') }}
            </span>
          </div>
          <div
            v-else
            class="flex items-center conversation-top__right__chat-shopee"
          >
            <icon-sms class="conversation-top__right__icon" />
            <span>
              {{ $t('chat') }}
            </span>
          </div>
          <a-button
            v-if="conversationType === chat"
            class="conversation-top__right__icon conversation-top__right__icon--link-to"
            @click="linkToInbox"
          >
            <icon-link-to />
          </a-button>

          <div
            v-if="conversationType === chat"
            class="conversation-top__right__info"
          >
            <icon-messenger class="conversation-top__right__icon" />
            <span>{{ count }}</span>
          </div>
          <div v-else class="conversation-top__right__info">
            <icon-comment class="conversation-top__right__icon" />
            <span>{{ count }}</span>
          </div>
          <div class="conversation-top__right__info">
            <icon-share class="conversation-top__right__icon" />
            <span>{{ repliesNumber }}</span>
          </div>
        </div>
      </div>
      <app-loading v-if="isLoadingMore" class="mt-6" />
      <div
        v-if="conversationType === chat"
        ref="messagesArea"
        class="conversation-body"
        @scroll="detectScrollConversation"
      >
        <chat-comment-render-message
          v-for="message in conversations"
          :key="message.id"
          :message="message"
          :social-profile-id="socialProfileId"
          :active-message-id="activeMessageId"
          :keywords="keywords"
          :overtime-reply="overtimeToReply"
          @handleUpdateHistories="handleUpdateHistories"
          @handleDeleteTag="handleDeleteTag"
          @handleUpdateConversationProgress="handleUpdateConversationProgress"
          @handleClickReplyMessage="handleClickReplyMessage"
          @handleCancelReplyMessage="handleCancelReplyMessage"
        />
      </div>
      <div
        v-else-if="conversationType === comment"
        ref="commentsArea"
        class="conversation-body"
      >
        <comment-post
          :key="post.social_id"
          :post="post"
          :comments="conversations"
          :active-comment-id="activeCommentId"
          :total-comment="count"
          :is-loading="isLoadingMoreComment"
          :keywords="keywords"
          @fetchMoreComment="fetchMoreComment"
          @handleCancelReplyComment="handleCancelReplyComment"
          @handleClickReplyComment="handleClickReplyComment"
        />
      </div>
      <resolve-conversation
        v-if="infoFan.locked_by && infoFan.locked_by.id !== userId"
        :locked-by="infoFan.locked_by"
      />
      <error-overtime-reply-chat v-if="overtimeToReply" :info-page="infoPage" />
      <chat-comment-form-chat
        v-if="conversationType === chat"
        :is-lock="isLock"
        :unsafe-keywords="listUnsafeKeyword"
        :can-unblock="canUnblock"
        :info-page="infoPage"
        :is-overtime="overtimeToReply"
        :active-message-id="activeMessageId"
        :active-message="activeMessage"
        @handleCancelReplyMessage="handleCancelReplyMessage"
        @handleSubmitReplyMessage="handleSubmitReplyMessage"
        @openModalUnblock="openModalUnblock"
        @handleClickSticker="handleClickSticker"
      />
      <chat-comment-form-comment
        v-else-if="conversationType === comment"
        :is-lock="isLock"
        :active-comment-id="activeCommentId"
        :active-comment="activeComment"
        :unsafe-keywords="listUnsafeKeyword"
        :can-unblock="canUnblock"
        :info-page="infoPage"
        @handleCancelReplyComment="handleCancelReplyComment"
        @handleSubmitReplyComment="handleSubmitReplyComment"
        @openModalUnblock="openModalUnblock"
      />
      <chat-comment-confirm-unblock
        :visible="isVisibleModalUnblock"
        :name-user="nameUserLocked"
        @closeModalUnblock="onCloseModalUnblock"
        @confirmUnblock="confirmUnblock"
      />
    </template>
  </div>
</template>
<script>
import Vue from 'vue'
import { get } from 'lodash'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
import { actionTypes } from '@/constants/action-types-firebase'
import event from '@/utils/event'
import enumEventEmit from '@/constants/enum-event-emit'
Vue.use(notification)

export default {
  name: 'ChatCommentConversationBox',
  props: {
    channels: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isLoading: false,
      isLoadingMore: false,
      isLoadingMoreComment: false,
      conversations: [],
      isLock: false,
      messagesNumber: 0,
      commentsNumber: 0,
      repliesNumber: 0,
      isVisibleModalUnblock: false,
      listUnsafeKeyword: [],
      posts: [],
      activeCommentId: 0,
      activeComment: null,
      activeMessageId: 0,
      activeMessage: null,
      page: 1,
      limit: 12,
      total: 0,
      overtimeToReply: false,
      count: 0,
      post: {},
      keywords: [],
    }
  },
  async fetch() {
    await Promise.all([this.getListUnsafeKeyword(), this.fetchKeywords()])
  },
  computed: {
    configConversations() {
      return this.$store.state.configConversations
    },
    chat() {
      return this.configConversations.typeString.chat
    },
    comment() {
      return this.configConversations.typeString.comment
    },
    guestId() {
      return this.$route.params.guest
    },
    primaryPageId() {
      return get(this.channels, '0.id', '') || ''
    },
    pageId() {
      return this.$route.params.page || this.primaryPageId
    },
    isActivePage() {
      return this.$store.state.isActivePage === 1
    },
    isCollapsed() {
      return this.$store.state.conversationCollapsed
    },
    infoFan() {
      return this.$store.state.currentInfoFan
    },
    conversationType() {
      return this.$route.params.type || 'chat'
    },
    socialProfileId() {
      return this.infoFan?.social_profile_id
    },
    isOwner() {
      return (
        this.$auth.user?.roles?.length && this.$auth.user?.roles[0] === 'owner'
      )
    },
    isManager() {
      return (
        this.$auth.user?.roles?.length &&
        this.$auth.user?.roles[0] === 'manager'
      )
    },
    canUnblock() {
      return (this.isOwner || this.isManager) && this.isActivePage
    },
    userId() {
      return this.$auth.user.id
    },
    noMoreResults() {
      return !this.isLoadingMore && this.page >= this.total
    },
    nameUserLocked() {
      return this.infoFan?.locked_by?.name ? this.infoFan.locked_by.name : '--'
    },
    infoPage() {
      return this.$store.state.currentInfoPage
    },
    isHiddenSwitchConversationType() {
      return this.infoPage?.channel_type?.data?.code === 'shopee'
    },
    configShopee() {
      return this.$store.state.shopee
    },
    socialPostId() {
      return this.$route.query.social_post_id
    },
  },
  watch: {
    isActivePage() {
      if (!this.isActivePage) this.isLock = true
    },
    socialProfileId: {
      immediate: true,
      async handler() {
        this.reset()
        await this.fetchConversationHistory()
        await this.fetchResponseHistory()
      },
    },
    socialPostId: {
      async handler() {
        this.reset()
        await this.fetchConversationHistory()
        await this.fetchResponseHistory()
      },
    },
    conversations() {
      this.checkOvertimeReplyChat()
    },
    infoFan() {
      if (!this.infoFan || !this.socialProfileId) return
      if (!this.isActivePage) {
        this.isLock = true
        return
      }
      this.isLock =
        this.infoFan.locked_by &&
        this.$auth.user.id !== this.infoFan.locked_by.id
    },
    infoPage() {
      return this.$store.state.currentInfoPage
    },
  },
  created() {
    // if (this.guestId?.length) {
    //   await this.fetchConversationHistory()
    //   await this.fetchGuestDetail()
    // }
    if (this.infoFan) {
      if (!this.isActivePage) {
        this.isLock = true
        return
      }
      this.isLock =
        this.infoFan.locked_by &&
        this.$auth.user.id !== this.infoFan.locked_by.id
    }
  },
  mounted() {
    this.$nextTick(function () {
      document.addEventListener('beforeunload', () => {
        if (this.infoFan?.id) {
          // const payload = {
          //   fan_id: this.infoFan.id,
          // }
          // this.$api.fan.unBlockConversation(payload)
        }
      })
    })
    event.$on('triggerRefreshConversationHistory', async () => {
      if (this.guestId?.length) {
        this.reset()
        await this.fetchConversationHistory()
        await this.fetchGuestDetail()
      }
    })
    event.$on(actionTypes.MESSAGE, (data) => {
      this.handlePushNewMessage(data)
    })
  },
  beforeDestroy() {
    this.$store.dispatch('updateCurrentInfoFan', null)
  },
  methods: {
    reset() {
      this.page = 1
      this.total = 0
      this.activeCommentId = 0
      this.conversations.length = 0
      this.repliesNumber = 0
      this.handleCancelReplyMessage()
      this.handleCancelReplyComment()
    },
    handlePushNewMessage(data) {
      if (!data) return
      const { message } = data
      const isExisting = this.conversations.some(
        (item) => item.id === message._id
      )
      let isErrorConversationType = false
      if (this.conversationType === 'chat') {
        isErrorConversationType =
          message.conversation_type === this.configConversations.type.comment ||
          message.conversation_type === this.configConversations.type.reply
      } else {
        isErrorConversationType =
          message.conversation_type === this.configConversations.type.chat
      }

      if (
        isExisting ||
        isErrorConversationType ||
        this.socialProfileId !== message.from_id ||
        parseInt(this.pageId) !== message.social_channel_id
      )
        return
      const newConversation = {
        id: message._id,
        conversation_mysql: {
          data: {
            progress: {
              data: {
                conversation_progress_keywords: {
                  data: [],
                },
                conversation_progress_tags: {
                  data: [],
                },
                histories: {
                  data: [
                    { action: this.configConversations.action_type.create },
                  ],
                },
              },
            },
          },
        },
        replies: {
          data: [],
        },
        ...(!message.from_avatar && {
          from_avatar: this.infoFan.avatar,
        }),
        ...message,
        ...(!message.attachments && { attachments: [] }),
      }
      if (
        newConversation.conversation_type === this.configConversations.type.chat
      ) {
        this.conversations = [...this.conversations, newConversation]
        this.count += 1
        this.$nextTick(function () {
          this.scrollToBottomConversation()
        })
      } else if (
        newConversation.conversation_type ===
          this.configConversations.type.comment &&
        newConversation.social_post_id === this.$route.query.social_post_id
      ) {
        this.conversations = [newConversation, ...this.conversations]
        this.count += 1
      } else if (
        newConversation.social_post_id === this.$route.query.social_post_id
      ) {
        event.$emit(
          `${actionTypes.REALTIME_NEW_CONVERSATION}-${newConversation.social_parent_id}`,
          newConversation
        )
        this.count += 1
      }
    },
    async fetchKeywords() {
      const params = {
        sort: '-created_at',
        'filter[social_channel_id]': this.pageId,
        'filter[status]': this.$store.state.keyword.status.publish,
        paginate: false,
      }
      const { data } = await this.$api.keyword.getListKeyword(params)
      if (data?.length) {
        this.keywords = [...data]
      }
    },
    async fetchResponseHistory() {
      try {
        if (!this.socialProfileId?.length) return
        const params = {
          limit: 1,
          'filter[from_id]': this.socialProfileId,
          'filter[social_channel_id]': this.pageId,
          'filter[conversation_type]':
            this.conversationType === this.comment ? 2 : 1,
        }
        const { meta } = await this.$api.responseHistory.getResponseHistory(
          params
        )
        if (meta) {
          this.repliesNumber = meta.pagination.total
        }
      } catch (e) {}
    },
    handleDeleteTag(messageId) {
      const findMessage = [...this.conversations].find(
        (message) => message.id === messageId
      )
      if (!findMessage) return
      findMessage.conversation_mysql.data.progress.data.tags.data = []
    },
    handleUpdateConversationProgress(conversationProgress, messageId) {
      const findMessage = [...this.conversations].find(
        (message) => message.id === messageId
      )
      if (!findMessage) return
      findMessage.conversation_mysql = {
        data: { ...conversationProgress },
      }
    },
    handleUpdateHistories(history, messageId) {
      const findConversation = [...this.conversations].find(
        (message) => message.id === messageId
      )
      if (!findConversation) return
      findConversation.conversation_mysql.data.progress.data.histories.data.push(
        {
          ...history,
        }
      )
    },
    async confirmUnblock() {
      try {
        if (
          !this.canUnblock ||
          !this.guestId?.length ||
          !this.isActivePage ||
          !this.infoFan.locked_by?.id
        )
          return
        const payload = {
          fan_id: this.guestId,
          user_id: this.infoFan.locked_by.id,
        }
        await this.$api.fan.unBlockConversation(payload)
        notification.success({
          message: this.$t('unblockSuccess'),
          class: 'notification-success',
        })
        this.isVisibleModalUnblock = false
        this.$store.dispatch('updateCurrentInfoFan', null)
        event.$emit('triggerRefreshGuestsList')
        this.$router.push(
          this.localePath({
            path: `/conversations/chat-comment/${this.pageId}/${this.conversationType}`,
          })
        )
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    async getListUnsafeKeyword() {
      try {
        const params = {
          paginate: false,
        }
        const { data } = await this.$api.unsafeKeyword.getListUnsafeKeyword(
          params
        )
        if (data) {
          this.listUnsafeKeyword = Object.freeze(data)
          this.$store.dispatch('updateUnsafeKeywords', this.listUnsafeKeyword)
        }
      } catch (error) {}
    },
    async fetchConversationHistory() {
      try {
        this.isLoading = true
        if (!this.pageId?.length || !this.socialProfileId?.length) return
        const isComment = this.conversationType === this.comment
        if (isComment) {
          if (!this.socialPostId) return
          const paramsPost = {
            social_channel_id: this.pageId,
          }
          const post = await this.$api.socialPosts.getSocialPostDetail(
            this.socialPostId,
            paramsPost
          )
          if (post) {
            this.post = post.data
          }
        }

        const params = {
          action: this.isActivePage
            ? this.configConversations.actions.reply
            : this.configConversations.actions.view,
          'filter[social_channel_id]': this.pageId,
          'filter[from_id]': this.socialProfileId,
          'filter[conversation_type]': isComment ? 2 : 1,
          sort: '-publish_time',
          page: 1,
          limit: this.conversationType === this.comment ? 1 : this.limit,
          include: 'conversation_mysql',
          ...(this.socialPostId &&
            isComment && {
              'filter[social_post_id]': this.socialPostId,
              include: 'social_post,conversation_mysql,replies',
            }),
        }
        const { data, meta } =
          await this.$api.conversation.getConversationHistory(params)
        if (data) {
          data.reverse()
          this.conversations = data
          this.total = meta.pagination.total_pages
          this.count = meta.pagination.total
          if (
            this.infoFan &&
            !this.infoFan.locked_by?.id &&
            this.isActivePage
          ) {
            this.$store.dispatch('updateCurrentInfoFan', {
              ...this.infoFan,
              locked_at: this.$moment.utc(),
              locked_by: {
                avatar: this.$auth.user.profile_picture,
                id: this.$auth.user.id,
                name: this.$auth.user.name,
              },
            })
          }
        }
      } catch (err) {
      } finally {
        this.isLoading = false
        if (this.conversationType === this.comment) {
          setTimeout(() => {
            this.$nextTick(function () {
              this.scrollToBottomConversation()
            })
          }, 1500)
        } else {
          this.$nextTick(function () {
            this.scrollToBottomConversation()
          })
        }
      }
    },
    async fetchMoreConversationHistory(prevPosition) {
      try {
        if (!this.pageId?.length || !this.socialProfileId?.length) return
        const isComment = this.conversationType === this.comment
        if (isComment) {
          if (!this.socialPostId) return
          const paramsPost = {
            social_channel_id: this.pageId,
          }
          const post = await this.$api.socialPosts.getSocialPostDetail(
            this.socialPostId,
            paramsPost
          )
          if (post) {
            this.post = post.data
          }
        }

        const params = {
          action: this.isActivePage
            ? this.configConversations.actions.reply
            : this.configConversations.actions.view,
          'filter[social_channel_id]': this.pageId,
          'filter[from_id]': this.socialProfileId,
          'filter[conversation_type]': isComment ? 2 : 1,
          sort: '-publish_time',
          page: this.page,
          limit: this.limit,
          include: 'conversation_mysql',
          ...(this.socialPostId &&
            isComment && {
              'filter[social_post_id]': this.socialPostId,
              include: 'social_post,conversation_mysql,replies',
            }),
        }
        const { data, meta } =
          await this.$api.conversation.getConversationHistory(params)

        if (data) {
          data.reverse()
          this.conversations = [...data, ...this.conversations]
          this.total = meta.pagination.total_pages
          this.count = meta.pagination.total
        }
      } catch (err) {
      } finally {
        this.isLoadingMore = false
        const container = this.$refs.messagesArea || this.$refs.commentsArea
        if (container) {
          setTimeout(() => {
            container.scrollTop = container.scrollHeight - prevPosition
          }, 100)
        }
      }
    },
    async fetchMoreComment() {
      try {
        if (!this.pageId?.length || !this.socialProfileId?.length) return
        this.isLoadingMoreComment = true
        const params = {
          action: this.isActivePage
            ? this.configConversations.actions.reply
            : this.configConversations.actions.view,
          'filter[social_channel_id]': this.pageId,
          'filter[from_id]': this.socialProfileId,
          'filter[conversation_type]': 2,
          sort: '-publish_time',
          page: this.page,
          limit: 5,
          include: 'conversation_mysql',
          ...(this.socialPostId && {
            'filter[social_post_id]': this.socialPostId,
            include: 'social_post,conversation_mysql,replies',
          }),
        }
        const { data, meta } =
          await this.$api.conversation.getConversationHistory(params)

        if (data) {
          this.conversations =
            this.page === 1 ? [...data] : [...this.conversations, ...data]
          this.total = meta.pagination.total_pages
          this.count = meta.pagination.total
          if (this.page < this.total) {
            this.page++
          }
        }
      } catch (err) {
      } finally {
        this.isLoadingMoreComment = false
      }
    },
    async fetchGuestDetail() {
      try {
        const params = {
          ...(this.conversationType === this.comment && {
            social_post_id: this.$route.query.social_post_id,
          }),
        }
        const { data } = await this.$api.fan.getGuestDetail(
          this.guestId,
          params
        )
        if (data) {
          this.$store.dispatch('updateCurrentInfoFan', data)
        }
      } catch (e) {}
    },
    async handleClickSticker(packageId, stickerId) {
      try {
        if (
          this.overtimeToReply ||
          (this.infoFan.locked_by &&
            this.infoFan.locked_by.id !== this.userId) ||
          !this.isActivePage
        )
          return
        const newReply = {
          attachments: [
            {
              data: '',
              file_type: 'shopee/sticker',
              file_url: `${packageId}/${stickerId}`,
            },
          ],
          content: '',
          conversation_type: 1,
          created_at: this.$moment().utc(),
          updated_at: this.$moment().utc(),
          from_id: this.infoPage.social_id,
          updated_by_name: this.$auth.user.name,
          last_by_id: this.$auth.user.id,
          last_by: this.$auth.user.name,
          last_by_avatar: this.$auth.user.profile_picture,
          last_at: this.$moment().utc(),
          status: 1,
        }
        const payload = new FormData()
        payload.append('actions[hide]', 0)
        payload.append('actions[like]', 0)
        payload.append('actions[reply]', 1)
        payload.append('content', '')
        payload.append('social_channel_id', this.pageId)
        payload.append('attachment_type', 'sticker')
        payload.append('sticker_package_id', packageId)
        payload.append('sticker_id', stickerId)
        payload.append('to_id', this.socialProfileId)
        await this.$api.response.replyShopeeMessage(payload)
        this.conversations = [...this.conversations, newReply]
        this.repliesNumber += 1
        event.$emit('updateLatestConversation', {
          action: newReply,
          guestId: this.guestId,
        })
        this.$nextTick(function () {
          this.scrollToBottomConversation()
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    async handleSubmitReplyMessage({
      content,
      unsafeKeywords = 0,
      fileList = [],
      listPreview = [],
    }) {
      try {
        if (
          this.overtimeToReply ||
          (this.infoFan.locked_by &&
            this.infoFan.locked_by.id !== this.userId) ||
          !this.isActivePage ||
          !this.activeMessageId
        )
          return
        const newReply = {
          attachments: [...listPreview],
          can_reply_privately: false,
          content,
          content_types: ['1'],
          conversation_id: Math.floor(Math.random() * 999999),
          conversation_status: 5,
          conversation_type: 1,
          created_at: this.$moment().utc().format('YYYY-MM-DD HH:mm:ss'),
          from_avatar: this.infoPage.avatar,
          from_id: this.infoPage.social_id,
          from_name: this.infoPage.name,
          is_deleted: 0,
          is_hidden: 0,
          is_system: 0,
          processing_time: 0,
          publish_time: this.$moment().utc().format('YYYY-MM-DD HH:mm:ss'),
          reference_id: null,
          replies: { data: [] },
          reply_status: 1,
          social_channel_id: this.pageId,
          social_id: null,
          social_link: '',
          social_post_id: null,
          updated_at: this.$moment().utc().format('YYYY-MM-DD HH:mm:ss'),
          updated_by_name: this.$auth.user.name,
          waiting_time: 3,
        }
        const conversationId = this.activeMessageId
        const payload = new FormData()
        payload.append('actions[hide]', 0)
        payload.append('actions[like]', 0)
        payload.append('actions[reply]', 1)
        payload.append('content', content)
        payload.append('social_channel_id', this.pageId)
        payload.append('unsafe_keyword', unsafeKeywords)
        if (fileList.length) {
          fileList.forEach((file) => {
            payload.append('attachment_url', file)
            payload.append(
              'attachment_type',
              file.type.includes('image')
                ? 'image'
                : file.type.includes('video')
                ? 'video'
                : 'file'
            )
          })
        }
        if (
          this.infoPage &&
          this.infoPage.channel_type.data.code === 'shopee'
        ) {
          if (content.length && !fileList.length) {
            payload.append('attachment_type', this.configShopee.replyType.text)
          } else {
            newReply.content = ''
            payload.delete('content')
            payload.append('content', '')
          }
          payload.append('to_id', this.socialProfileId)
          if (fileList.length && content.length) {
            await this.handleSubmitReplyMessage({ content, unsafeKeywords })
          }
          await this.$api.response.replyShopeeMessage(payload)
        }
        if (
          this.infoPage &&
          this.infoPage.channel_type.data.code === 'facebook'
        ) {
          await this.$api.response.replyFbMessage(conversationId, payload)
        }
        if (
          this.infoPage &&
          this.infoPage.channel_type.data.code === 'instagram'
        ) {
          await this.$api.response.replyIGMessage(conversationId, payload)
        }
        const findConversation = this.conversations.find(
          (conversation) => conversation.conversation_id === conversationId
        )
        if (findConversation) {
          const isEscalated =
            findConversation.conversation_mysql?.data?.progress?.data?.histories?.data.some(
              (history) =>
                history.action ===
                this.configConversations.action_type.escalated
            )
          findConversation.conversation_status = isEscalated
            ? this.configConversations.status.escalate_response
            : this.configConversations.status.direct_response
          findConversation.conversation_mysql.data.progress.data.histories.data.push(
            {
              action: isEscalated
                ? this.configConversations.action_type.escalate_response
                : this.configConversations.action_type.direct_response,
            }
          )
          event.$emit(enumEventEmit.conversation.UPDATE_COUNT_GUEST, {
            guestId: findConversation.from_id,
            payload: {
              total_pending: isEscalated ? 0 : -1,
              total_waiting: isEscalated ? -1 : 0,
            },
          })
        }
        this.conversations = [...this.conversations, newReply]
        this.repliesNumber += 1
        this.activeMessage = null
        this.activeMessageId = 0
        event.$emit('updateLatestConversation', {
          newReply,
          guestId: this.guestId,
        })

        this.$nextTick(function () {
          this.scrollToBottomConversation()
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    async handleSubmitReplyComment({
      content,
      unsafeKeywords = 0,
      fileList = [],
      listPreview = [],
    }) {
      try {
        if (
          !this.activeCommentId ||
          (this.infoFan.locked_by &&
            this.infoFan.locked_by.id !== this.userId) ||
          !this.isActivePage
        )
          return
        const newReply = {
          attachments: [...listPreview],
          can_reply_privately: false,
          content,
          content_types: ['1'],
          conversation_id: Math.floor(Math.random() * 999999),
          conversation_status: 5,
          conversation_type: 2,
          created_at: this.$moment().utc().format('YYYY-MM-DD HH:mm:ss'),
          from_avatar: this.infoPage.avatar,
          from_id: this.infoPage.social_id,
          from_name: this.infoPage.name,
          is_deleted: 0,
          is_hidden: 0,
          is_system: 0,
          processing_time: 0,
          publish_time: this.$moment().utc().format('YYYY-MM-DD HH:mm:ss'),
          reference_id: null,
          replies: { data: [] },
          reply_status: 1,
          social_channel_id: this.pageId,
          social_id: null,
          social_link: '',
          social_post_id: this.$route.query.social_post_id
            ? this.$route.query.social_post_id
            : null,
          updated_at: this.$moment().utc().format('YYYY-MM-DD HH:mm:ss'),
          updated_by_name: this.$auth.user.name,
          waiting_time: 3,
        }
        const payload = new FormData()
        payload.append('actions[hide]', 0)
        payload.append('actions[like]', 0)
        payload.append('actions[reply]', 1)
        payload.append('content', content)
        payload.append('social_channel_id', this.pageId)
        payload.append('unsafe_keyword', unsafeKeywords)
        if (fileList.length) {
          fileList.forEach((file) => {
            payload.append('attachment_url', file)
            payload.append(
              'attachment_type',
              file.type.includes('image')
                ? 'image'
                : file.type.includes('video')
                ? 'video'
                : 'file'
            )
          })
        }
        if (
          this.infoPage &&
          this.infoPage.channel_type.data.code === 'facebook'
        ) {
          await this.$api.response.replyFbMessage(this.activeCommentId, payload)
        }
        if (
          this.infoPage &&
          this.infoPage.channel_type.data.code === 'instagram'
        ) {
          await this.$api.response.replyIGMessage(this.activeCommentId, payload)
        }
        const isEscalated =
          this.activeComment.conversation_mysql?.data?.progress?.data?.histories?.data.some(
            (history) =>
              history.action === this.configConversations.action_type.escalated
          )
        const updatedComment = {
          ...this.activeComment,
          replies: {
            data: [...this.activeComment.replies.data, { ...newReply }],
          },
        }
        updatedComment.conversation_mysql.data.progress.data.histories.data.push(
          {
            action: isEscalated
              ? this.configConversations.action_type.escalate_response
              : this.configConversations.action_type.direct_response,
          }
        )
        event.$emit(enumEventEmit.conversation.UPDATE_COUNT_GUEST, {
          guestId: updatedComment.from_id,
          payload: {
            total_pending: isEscalated ? 0 : -1,
            total_waiting: isEscalated ? -1 : 0,
          },
          ...(updatedComment.social_post_id?.length && {
            socialPostId: updatedComment.social_post_id,
          }),
        })
        event.$emit(`update-comment-${this.activeCommentId}`, {
          ...updatedComment,
        })
        this.repliesNumber += 1
        this.activeComment = null
        this.activeCommentId = 0
        event.$emit('updateLatestConversation', {
          newReply,
          guestId: this.guestId,
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    detectScrollConversation(e) {
      const target = e.currentTarget
      const isTop = target.scrollTop <= 10
      const prevPosition = target.scrollHeight + target.scrollTop
      if (
        isTop &&
        !this.isLoading &&
        !this.isLoadingMore &&
        !this.noMoreResults
      ) {
        this.handleLoadMore(prevPosition)
      }
    },
    handleLoadMore(prevPosition) {
      if (!this.isLoading && !this.isLoadingMore && !this.noMoreResults) {
        this.isLoadingMore = true
        this.page++
        this.fetchMoreConversationHistory(prevPosition)
      }
    },
    handleCancelReplyMessage() {
      this.activeMessageId = 0
      this.activeMessage = null
    },
    handleClickReplyMessage(message) {
      this.activeMessageId = message.conversation_id
      this.activeMessage = message
    },
    handleCancelReplyComment() {
      this.activeCommentId = 0
      this.activeComment = null
    },
    handleClickReplyComment(conversation) {
      this.activeCommentId = conversation.conversation_id
      this.activeComment = { ...conversation }
    },
    scrollToBottomConversation() {
      const container = this.$refs.messagesArea || this.$refs.commentsArea
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    handleChangeConversationType(value) {
      const isChat = value
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: `/conversations/chat-comment/${this.pageId}/${
            isChat ? this.chat : this.comment
          }/${this.guestId}`,
          query,
        })
      )
    },
    openModalUnblock() {
      if (!this.canUnblock || !this.infoFan.locked_by) return
      this.isVisibleModalUnblock = true
    },
    onCloseModalUnblock() {
      this.isVisibleModalUnblock = false
    },
    linkToInbox() {
      const socialLink = this.conversations.find(
        (message) =>
          message.conversation_type + '' ===
          this.configConversations.type.chat + ''
      )?.social_link
      if (!socialLink) return
      window.open(socialLink, '_blank')
    },
    checkOvertimeReplyChat() {
      if (
        this.conversationType !== this.chat ||
        !this.conversations?.length ||
        this.infoPage?.channel_type?.data?.code === 'shopee'
      )
        return (this.overtimeToReply = false)
      const cloneMessages = [...this.conversations]

      const lastIndex = cloneMessages
        .reverse()
        .findIndex((message) => message.from_id === this.socialProfileId)
      const lastMessage = cloneMessages[lastIndex]
      if (!lastMessage) return (this.overtimeToReply = false)
      const startTime = this.$moment.utc(lastMessage.publish_time).local()
      const endTime = this.$moment()
      const duration = this.$moment.duration(endTime.diff(startTime))
      const hours = duration.asHours()
      // 7 days = 24 * 7 = 168
      this.overtimeToReply = hours > 168
    },
  },
}
</script>
<style lang="less" scoped>
.conversation {
  width: 100%;
  height: 100%;
  @apply flex flex-col flex-1 duration-500;
  &-top {
    min-height: 8rem;
    border-color: @gray-4;
    padding: 0.5rem 3rem 0.5rem 1rem;
    @apply flex items-center justify-between
      border-b;
    &__left {
      width: 30%;
      @apply flex items-center overflow-hidden flex-shrink-0;
      &__name {
        color: @black;
        margin-left: @margin-24;
        font-size: @size-20;
        @apply font-semibold truncate;
      }
    }
    &__right {
      @apply flex items-center justify-end flex-wrap;
      &__switch-conversation {
        color: @black;
        font-size: @font-size-base;
        @apply flex items-center my-4;
        /deep/.ant-switch {
          min-width: 3.6rem;
          height: 2rem;
          background-color: @primary;
          @apply mx-4;
          &::after {
            width: 1.6rem;
            height: 1.6rem;
            top: 0.1rem;
            background-color: @white;
            border-radius: 50%;
            transition: all 0.5s ease;
            @apply absolute;
          }
        }
        &--gray {
          color: @gray-4;
        }
      }
      &__chat-shopee {
        color: @black;
        font-size: @size-16;
        margin: @margin-8;
        @apply font-semibold;
        .conversation-top__right__icon {
          width: @size-24;
          height: @size-24;
        }
      }
      &__icon,
      svg {
        color: @black;
        width: @size-18;
        height: @size-18;
        @apply font-bold mr-2;
        &--link-to {
          @apply mx-4 cursor-pointer border-0 p-0;
        }
      }
      &__info {
        color: @black;
        font-size: @size-16;
        @apply flex items-center font-semibold mx-4;
      }
    }
  }
  &-body {
    max-height: 84%;
    overflow: hidden scroll;
    @apply flex-1;
    &::-webkit-scrollbar {
      width: 6px;
      &:hover {
        width: 11px;
      }
    }
    &::-webkit-scrollbar-track {
      background-color: #eee;
      border-radius: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #aaa;
      border-radius: 6px;
      min-height: 50px;
      &:hover {
        background-color: #999;
      }
    }
  }
  .no-action {
    @apply w-full h-full flex items-center justify-center;
    p {
      color: @gray-4;
    }
  }
}
</style>
