<template>
  <div
    class="single-guest"
    :class="{ active: isActive }"
    @click="handleClickGuest"
  >
    <div class="single-guest__avatar">
      <app-avatar
        :image="guestInline.avatar"
        :full-name="guestInline.full_name"
        size="large"
      />
    </div>
    <div class="single-guest__info">
      <p class="name">{{ guestInline.full_name }}</p>
      <div class="arrival-message">
        <icon-reply v-if="hasReplied" class="flex-shrink-0" />
        <p
          v-if="
            guestInline.latest_conversation.data.attachments &&
            guestInline.latest_conversation.data.attachments.length
          "
        >
          {{ $t('send-an-attachment') }}
        </p>
        <p
          v-else
          class="arrival-message__content"
          v-html="guestInline.latest_conversation.data.content"
        ></p>
      </div>
      <div class="time">
        <time>
          {{ publishTime }}
        </time>
      </div>
      <div class="tracking-status">
        <!-- <span class="unseen" :class="{ hasUnseen }">{{ unseenNumber }}</span> -->
        <span
          class="unseen unseen--red"
          :class="{ '!opacity-100': guestInline.total_pending > 0 }"
        >
          {{ guestInline.total_pending }}
        </span>
        <span
          class="unseen unseen--yellow ml-1"
          :class="{ '!opacity-100': guestInline.total_waiting > 0 }"
        >
          {{ guestInline.total_waiting }}
        </span>
        <a-icon
          type="lock"
          :class="{
            isLock:
              guestInline.locked_by && guestInline.locked_by.id !== userId,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { convertUTCToLocal } from '@/utils/moment'

export default {
  name: 'ChatCommentGuestCard',
  props: {
    guest: {
      type: Object,
      default: () => {},
    },
    isBlockingEventClick: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    configConversations() {
      return this.$store.state.configConversations
    },
    guestInline() {
      return {
        ...this.guest,
        ...(!this.guest.latest_conversation?.data && {
          latest_conversation: {
            data: {},
          },
        }),
      }
    },
    chat() {
      return this.configConversations.typeString.chat
    },
    comment() {
      return this.configConversations.typeString.comment
    },
    pageId() {
      return this.$route.params.page
    },
    conversationType() {
      return this.$route.params.type
    },
    guestId() {
      return this.$route.params.guest
    },
    currentInfoFan() {
      return this.$store.state.currentInfoFan
    },
    infoPage() {
      return this.$store.state.currentInfoPage || {}
    },
    isActive() {
      if (this.conversationType === this.comment) {
        const { social_post_id } = this.$route.query
        return (
          social_post_id === this.guestInline.social_posts?.social_post_id &&
          this.guestId === this.guestInline.id
        )
      } else {
        return this.guestId === this.guestInline.id
      }
    },
    userId() {
      return this.$auth.user.id
    },
    hasReplied() {
      return (
        this.guestInline.latest_conversation?.data?.from_id ===
        this.infoPage?.social_id
      )
    },
    unseenNumber() {
      return this.conversationType === this.comment
        ? this.guestInline.tracking_unseen?.data?.unseen_comment
        : this.guestInline.tracking_unseen?.data?.unseen_message
    },
    hasUnseen() {
      return this.unseenNumber > 0
    },
    isActivePage() {
      return this.$store.state.isActivePage === 1
    },
    hasAttachment() {
      return this.guestInline.latest_conversation?.data?.attachments?.length
    },
    publishTime() {
      return this.formatTime(
        this.guestInline.latest_conversation?.data.publish_time
      )
    },
  },
  methods: {
    formatTime(time) {
      return convertUTCToLocal(time, 'hh:mm A DD/MM/YYYY')
    },
    handleClickGuest() {
      try {
        if (this.isBlockingEventClick) return
        this.$emit('handleBlockAreaGuestList')
        // if (
        //   ((this.guestId && this.guestId !== this.guestInline.id) ||
        //     this.$route.query.social_post_id !==
        //       this.guestInline.social_posts?.social_post_id) &&
        //   this.currentInfoFan &&
        //   this.currentInfoFan.locked_by &&
        //   this.currentInfoFan.locked_by.id === this.userId &&
        //   this.isActivePage
        // ) {
        // const payload = {
        //   fan_id: this.guestId,
        // }
        // await this.$api.fan.unBlockConversation(payload)
        // }
        // if (
        //   !this.guestInline.locked_by ||
        //   this.guestInline.locked_by.id === this.userId
        // ) {
        //   this.$emit('handleSeenConversation', this.guestInline.id)
        // }
        const query = {
          ...this.$route.query,
        }
        if (this.conversationType === this.comment) {
          query.social_post_id = this.guest.social_posts?.social_post_id
        } else {
          delete query.social_post_id
        }
        this.$router.push(
          this.localePath({
            path: `/conversations/chat-comment/${this.pageId}/${this.conversationType}/${this.guest.id}`,
            query,
          })
        )
      } catch (e) {}
    },
    // async seenConversation(fanId) {
    //   try {
    //     if (!fanId) return
    //     const payload = {
    //       fan_id: fanId,
    //       conversation_type:
    //         this.conversationType === this.comment ? 'comment' : 'message',
    //     }
    //     await this.$api.fan.seenConversation(payload)
    //   } catch (err) {}
    // },
  },
}
</script>
<style lang="less" scoped>
.single-guest {
  margin-right: 2.4rem;
  padding-inline: @padding-16;
  padding-block: @padding-12;
  @apply relative flex items-center rounded-2xl
    duration-500 cursor-pointer mb-2;
  &__avatar {
    width: 6rem;
    height: 6rem;
    /deep/.ant-avatar {
      width: 100%;
      height: 100%;
      @apply flex items-center justify-center;
    }
  }
  &:hover,
  &.active {
    background-color: @primary-3;
  }
  &__info {
    padding-left: @padding-12;
    @apply flex-1 truncate;
    /deep/p {
      @apply m-0;
    }
    .name {
      font-size: @size-17;
      color: @black;
      @apply font-semibold;
    }
    .arrival-message {
      @apply flex items-center;
      svg {
        @apply mr-2;
      }
      /deep/p,
      &__content {
        font-size: @size-14;
        color: @gray-1;
        height: 19px;
        line-height: 19px;
        @apply truncate;
      }
    }
    .time {
      color: @gray-4;
      font-size: @size-12;
    }
    .tracking-status {
      top: 10px;
      right: 15px;
      @apply flex items-center absolute;
      .anticon-lock {
        color: @red;
        margin-left: 0.5rem;
        @apply hidden;
        &.isLock {
          @apply block;
        }
      }
      .unseen {
        background-color: @primary;
        min-width: 26px;
        width: max-content;
        font-size: @size-11;
        color: @white;
        opacity: 0;
        transition: 0.25s linear;
        @apply text-center rounded-xl;
        &--red {
          background-color: @red;
          margin-right: 0.5rem;
        }
        &--yellow {
          background-color: @yellow;
        }
        &.hasUnseen {
          @apply block;
        }
      }
    }
  }
}
</style>
