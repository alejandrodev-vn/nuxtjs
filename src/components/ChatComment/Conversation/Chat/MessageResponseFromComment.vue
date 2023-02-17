<template>
  <div class="message-response-from-comment">
    <div class="message-response-from-comment__header">
      {{
        $t('title-message-response-from-comment', {
          name: infoFan.full_name,
        })
      }}
      <nuxt-link
        :to="
          localePath({
            path: `/conversations/chat-comment/${$route.params.page}/comment/${$route.params.guest}`,
          })
        "
        class="message-response-from-comment__header--link"
      >
        {{ $t('view-comment') }}
      </nuxt-link>
    </div>
    <div class="message-response-from-comment__body">
      <div class="mr-4">
        <div class="message">
          <a-icon
            v-if="
              message.conversation_status && message.conversation_status === 0
            "
            type="exclamation-circle"
            class="message__icon-failed"
          />
          <div
            class="message__content"
            :class="{
              error:
                message.conversation_status &&
                message.conversation_status === 0,
            }"
          >
            {{ message.content }}
          </div>
        </div>
        <div class="time">
          {{ formatTime(message.publish_time) }}
        </div>
      </div>
      <div>
        <app-avatar
          :image="message.from_avatar"
          :full-name="message.updated_by_name"
          size="large"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { convertUTCToLocal } from '@/utils/moment'

export default {
  name: 'MessageResponseFromComment',
  props: {
    message: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    infoFan() {
      return this.$store.state.currentInfoFan
    },
    formatTime(time) {
      return convertUTCToLocal(time, 'hh:mm A DD/MM/YYYY')
    },
  },
}
</script>
<style lang="less" scoped>
.message-response-from-comment {
  &__header {
    font-size: @size-3;
    color: #333;
    padding-inline: 1rem;
    @apply text-center;

    &--link {
      text-decoration: underline;
    }
  }

  &__body {
    max-width: 45%;
    @apply flex justify-end my-6 ml-auto mr-4;
  }
}

.message {
  @apply flex items-end;

  &__icon-failed {
    color: @red;
    margin-right: 0.8rem;
  }

  &__content {
    font-size: @size-3;
    color: @black;
    background-color: @gray-6;
    padding: @padding-8 @padding-16;
    @apply rounded-md;

    &.error {
      background-color: @red-2;
      border: 1px solid @red;
      color: @red;
    }
  }
}

.time {
  font-size: @size-12;
  color: @gray-4;
  @apply mt-2 px-2 text-right;
}
</style>
