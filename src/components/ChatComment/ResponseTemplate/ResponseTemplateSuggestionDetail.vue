<template>
  <div class="suggestion">
    <a-collapse
      v-model="activeKey"
      default-activekey="1"
      expand-icon-position="right"
      :bordered="false"
    >
      <template #expandIcon="props">
        <icon-right
          :style="{
            transform: props.isActive ? 'rotate(90deg)' : 'rotate(-90deg)',
          }"
        />
      </template>
      <app-loading v-if="isLoading" />
      <a-collapse-panel
        v-else-if="!suggestions.length"
        key="1"
        header="Suggestion"
      >
        <app-no-data :text="$t('noSuggestionHere')" />
      </a-collapse-panel>
      <a-collapse-panel v-else key="1" :header="$t('suggestion')">
        <response-template-card
          v-for="template in suggestions"
          :key="template.id"
          :is-lock="isLock"
          :template="template"
          :selected-template="selectedTemplate"
        />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
import event from '@/utils/event'
import { actionTypes } from '@/constants/action-types-firebase'

export default {
  name: 'ResponseTemplateSuggestionDetail',
  props: {
    selectedTemplate: {
      type: String,
      default: null,
    },
    isLock: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeKey: ['1'],
      isLoading: false,
      conversations: [],
      suggestions: [],
    }
  },
  computed: {
    pageId() {
      return this.$route.params.page
    },
    currentSocialProfileId() {
      return this.$store.state.currentInfoFan.social_profile_id
    },
    conversationType() {
      return this.$route.params.type
    },
    conversationIds() {
      return !this.conversations.length
        ? []
        : this.conversations.map((conversation) => conversation.id)
    },
  },
  watch: {
    conversationIds() {
      this.fetchSuggestions()
    },
  },
  async created() {
    if (this.currentSocialProfileId) {
      await this.fetchConversations()
    }
  },
  mounted() {
    event.$on(actionTypes.MESSAGE, (data) => {
      this.handlePushNewConversation(data)
    })
  },
  methods: {
    handlePushNewConversation(data) {
      if (!data) return
      const { message } = data
      const isExisting = this.conversations.some(
        (item) => item.id === message.conversation_id
      )
      if (
        isExisting ||
        this.conversationType !== 'chat' ||
        this.currentSocialProfileId !== message.from_id
      )
        return
      const newConversation = {
        ...message,
        id: message.conversation_id,
      }
      this.conversations = [...this.conversations, newConversation]
      this.count += 1
    },
    async fetchSuggestions() {
      try {
        this.isLoading = true
        if (!this.conversationIds.length) return
        const params = {
          conversation_ids: [...this.conversationIds],
        }
        const { data } = await this.$api.responseTemplate.getSuggestion(params)
        if (data) {
          this.suggestions = Object.freeze(data)
        }
      } catch (error) {
      } finally {
        this.isLoading = false
      }
    },
    async fetchConversations() {
      try {
        if (!this.pageId || !this.currentSocialProfileId) return
        const configConversations = this.$store.state.configConversations
        const params = {
          'filter[social_channel_id]': this.pageId,
          'filter[from_id]': this.currentSocialProfileId,
          'filter[conversation_type]':
            this.conversationType === configConversations.typeString.chat
              ? configConversations.type.chat
              : configConversations.type.comment,
          sort: '-created_at',
        }
        const { data } = await this.$api.conversation.getConversationByGuest(
          params
        )

        if (data) {
          this.conversations = Object.freeze(data)
        }
      } catch (err) {}
    },
  },
}
</script>

<style lang="less" scoped>
.suggestion {
  max-height: 50%;
  border-color: @gray-4;
  overflow: hidden;
  padding: @padding-24;
  padding-right: 0;
  @apply border-t-4;
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
  /deep/.ant-collapse {
    background-color: transparent;
    height: 100%;
    .ant-collapse-item {
      border: none;
      height: 100%;
      .ant-collapse-header {
        font-size: @size-20;
        line-height: @size-20;
        margin-right: @margin-24 !important;
        @apply px-0 m-0 mb-4 font-semibold;
        .anticon {
          @apply right-0;
        }
      }
      .ant-collapse-content {
        height: 80%;
      }
      .ant-collapse-content-box {
        overflow: hidden auto;
        height: 100%;
        @apply p-0;
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
    }
  }
}
</style>
