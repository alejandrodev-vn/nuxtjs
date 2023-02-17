<template>
  <div class="conversation">
    <div class="conversation-header">
      <div class="title">
        <div class="title__icon">
          <icon-messenger
            v-if="
              invertConfigConversationType[data.conversationType] ===
              configConversation.typeString.chat
            "
          />
          <icon-comment v-else />
        </div>
        <span class="title__name">
          {{ $t(invertConfigConversationType[data.conversationType]) }}
        </span>
      </div>
    </div>
    <div class="conversation-body">
      <div class="wrap-item wrap-item--left">
        <div class="data-tag-item data-tag-item--left">
          <span class="data-tag-item__text"> {{ $t('conversation') }}</span>
        </div>
      </div>
      <div class="wrap-item wrap-item--left">
        <div class="conversation-item conversation-item--left">
          <p class="conversation-item__content" v-html="data.content"></p>
        </div>
      </div>

      <div v-if="data.histories.length" class="wrap-item wrap-item--right">
        <div class="data-tag-item data-tag-item--right">
          <span class="data-tag-item__text"> {{ $t('response') }}</span>
        </div>
      </div>
      <div
        v-for="response in data.histories"
        :key="response.id"
        class="wrap-item wrap-item--right"
      >
        <div class="conversation-item conversation-item--right">
          <p
            v-if="!response.payload.attachment_url"
            class="conversation-item__content"
            v-html="response.payload.content || response.payload.message"
          ></p>
          <p v-else class="conversation-item__content">
            {{ $t('send-and-attachment') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { invert } from 'lodash'

export default {
  name: 'ResponseHistoryDetailConversation',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    configConversation() {
      return this.$store.state.configConversations
    },
    invertConfigConversationType() {
      return invert(this.configConversation.type)
    },
    responses() {
      return this.data.histories
    },
  },
}
</script>
<style lang="less" scoped>
.conversation {
  border-radius: 8px;
  border: 1px solid @gray-5;
  overflow: hidden;
  margin-bottom: @margin-12;
  &-header {
    background-color: @gray-6;
    padding: @padding-8 2.2rem;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    @apply flex items-center justify-between;
    .title {
      @apply flex items-center;
      &__icon {
        width: 2.4rem;
        height: 2.4rem;
        margin-right: @margin-12;
        flex-shrink: 0;
        svg {
          filter: sepia(150%) hue-rotate(180deg) saturate(10000%);
        }
        img {
          width: 100%;
          height: 100%;
        }
      }
      &__name {
        color: @black;
        font-size: @size-20;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        @apply font-semibold;
      }
    }
  }
  &-body {
    padding-top: @padding-24;
    .wrap-item {
      margin-bottom: @margin-12;
      @apply flex;
      &--left {
        @apply justify-start;
      }
      &--right {
        @apply justify-end;
      }
    }
    .data-tag-item {
      background-color: @gray-6;
      color: @black;
      display: inline-block;
      height: 30px;
      line-height: 30px;
      padding: 0 10px 0 30px;
      position: relative;
      text-decoration: none;
      -webkit-transition: color 0.2s;
      max-width: 40%;
      &__text {
        overflow: hidden;
        display: block;
        @apply truncate;
      }
      &.active {
        background-color: @positive;
        color: @white;
        &::before {
          border-left: 20px solid @positive;
        }
      }
      &--left {
        &::after {
          content: '';
          position: absolute;
          right: -20px;
          bottom: 0;
          width: 0;
          height: 0;
          border-left: 20px solid @gray-6;
          border-top: 16px solid transparent;
          border-bottom: 14px solid transparent;
        }
      }
      &--right {
        background-color: @primary-3;
        color: @black;
        &::before {
          content: '';
          position: absolute;
          left: -20px;
          bottom: 0;
          width: 0;
          height: 0;
          border-right: 20px solid @primary-3;
          border-top: 16px solid transparent;
          border-bottom: 14px solid transparent;
        }
      }
    }
    .conversation-item {
      color: @black;
      background-color: @gray-6;
      padding: 0.4rem @padding-12;
      border-radius: 0.8rem;
      max-width: 60%;
      &--left {
        margin-left: @margin-24;
      }
      &--right {
        background-color: @primary-3;
        margin-right: @margin-24;
      }
      &__content {
        margin-bottom: 0;
        font-size: @size-14;
        line-height: @size-24;
      }
    }
  }
}
</style>
