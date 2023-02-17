<template>
  <div class="channel-setup-posts">
    <div class="channel-setup-posts__head">
      <img
        src="@/assets/images/EmailTemplate/Icon-light-bulb.png"
        alt="Prime CRM"
        class="custom-button-setup"
        @click="handleOpenModalSetupGuid"
      />
      <channel-modal ref="modalSetupChannel" class="custom-channel-modal">
        <template #title>
          {{ $t('how-to-get-the-post-link-or-post-id') }}
        </template>
        <template #content>
          <a-carousel arrows :infinite="false">
            <a slot="customPaging">
              <span class="app-dot"></span>
            </a>
            <channel-setup-guid
              v-for="(step, index) in steps"
              :key="index"
              :step="step"
            />
            <template #prevArrow>
              <div class="custom-slick-arrow" style="left: 10px; z-index: 1">
                <a-icon type="left-circle" />
              </div>
            </template>
            <template #nextArrow>
              <div class="custom-slick-arrow" style="right: 10px">
                <a-icon type="right-circle" />
              </div>
            </template>
          </a-carousel>
        </template>
      </channel-modal>
      <a-input
        v-model="postId"
        class="custom-input"
        :placeholder="$t('enter-post-link-or-post-id-here')"
        :disabled="!isCheckComment"
      />
      <a-button
        type="primary"
        class="btn-submit"
        :disabled="!postId.length || !isCheckComment"
        :loading="isLoading"
        @click="handleSubmitAddPost"
      >
        {{ $t('add') }}
      </a-button>
      <a-modal
        v-model="visibleModalSetupPostId"
        class="modal-setup-post-id"
        centered
        :closable="false"
        :cancel-text="$t('cancel')"
        :ok-text="$t('confirm')"
        destroy-on-close
        width="400px"
        @cancel="handleCancel"
        @ok="handleConfirmChangeFirstPostStatus"
      >
        <div class="modal-setup-post-id__head">
          <p class="title">{{ $t('choose-type-you-want-to-set-up') }}</p>
          <p class="note">
            {{ $t('note-title-channel-setup-post') }}
          </p>
        </div>
        <a-radio-group
          :value="commentOptions.posts_status"
          class="modal-setup-post-id__body"
          @change="handleChangePostStatus"
        >
          <a-radio
            v-for="option in handleOptions"
            :key="option.key"
            :value="option.value"
            :disabled="option.disabled"
            class="custom-radio"
          >
            <span class="custom-radio__label">{{ option.label }}</span>
          </a-radio>
        </a-radio-group>
      </a-modal>
    </div>
    <div v-if="commentOptions.posts.length" class="channel-setup-posts__body">
      <div class="channel-setup-posts__body__top">
        <div class="switch-post-status">
          <span
            :class="{
              'switch-post-status--gray':
                commentOptions.posts_status ===
                configChannel.posts_status.unhandle,
            }"
          >
            {{ $t('handle') }}
          </span>
          <a-switch
            :checked="
              commentOptions.posts_status ===
              configChannel.posts_status.unhandle
            "
            size="small"
            @click="handleSwitchPostStatus"
          />
          <span
            :class="{
              'switch-post-status--gray':
                commentOptions.posts_status ===
                configChannel.posts_status.handle,
            }"
          >
            {{ $t('un-handle') }}
          </span>
        </div>
        <a-modal
          v-model="visibleModalConfirmChangeStatus"
          class="modal-confirm-change-status"
          centered
          :closable="false"
          :cancel-text="$t('cancel')"
          :ok-text="$t('confirm')"
          destroy-on-close
          width="400px"
          @ok="handleConfirmChangePostStatus"
        >
          <template #title>
            {{ $t('confirm-to-change') }}
          </template>
          <p class="modal-confirm-change-status__note">
            {{
              $t('click-confirm-if-you-want-to-change-status', {
                from:
                  commentOptions.posts_status ===
                  configChannel.posts_status.handle
                    ? $t('handle')
                    : $t('un-handle'),
                to:
                  commentOptions.posts_status ===
                  configChannel.posts_status.handle
                    ? $t('un-handle')
                    : $t('handle'),
              })
            }}
          </p>
          <a-checkbox
            :checked="isCheckedClearPosts"
            @change="handleCheckClearPosts"
            @click="(e) => e.stopPropagation()"
          >
            <span @click="(e) => e.stopPropagation()">
              {{ $t('tick-if-you-want-to-clear-all-posts') }}
            </span>
          </a-checkbox>
        </a-modal>
      </div>
      <div class="channel-setup-posts__body__listing">
        <channel-setup-post-item
          v-for="item in commentOptions.posts"
          :key="item.id"
          :post="item"
          @remove="handleRemovePost"
        />
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)
export default {
  name: 'ChannelSetupPosts',
  props: {
    isCheckComment: {
      type: Boolean,
      default: false,
    },
    commentOptions: {
      type: Object,
      default: () => {},
    },
    channelId: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      postId: '',
      visibleModalSetupPostId: false,
      visibleModalSetupGuid: false,
      visibleModalConfirmChangeStatus: false,
      posts: [],
      postsUpdated: [],
      postsRemoved: [],
      isLoading: false,
      isCheckedClearPosts: false,
      validPostId: '',
      steps: [
        {
          title: this.$t('you-can-get-the-post-link-by'),
          detail: this.$t('step-1-channel-setup-guid'),
          image: require('~/assets/images/Channel/setup-channel-1.png'),
        },
        {
          title: this.$t('you-can-get-the-post-id-by'),
          detail: this.$t('step-2-channel-setup-guid'),
          image: require('~/assets/images/Channel/setup-channel-2.png'),
        },
      ],
    }
  },
  computed: {
    configChannel() {
      return this.$store.state.configChannel
    },
    handleOptions() {
      return [
        {
          value: this.configChannel.posts_status.handle,
          label: this.$t('handle'),
          disabled: false,
        },
        {
          value: this.configChannel.posts_status.unhandle,
          label: this.$t('un-handle'),
          disabled: false,
        },
      ]
    },
  },
  methods: {
    handleConfirmChangePostStatus() {
      const value =
        this.commentOptions.posts_status ===
        this.configChannel.posts_status.handle
          ? this.configChannel.posts_status.unhandle
          : this.configChannel.posts_status.handle
      this.$emit('changePostStatus', value)
      if (this.isCheckedClearPosts) {
        this.$emit('clearPosts')
      }
      this.visibleModalConfirmChangeStatus = false
    },
    handleCheckClearPosts() {
      this.isCheckedClearPosts = !this.isCheckedClearPosts
    },
    handleOpenModalSetupGuid() {
      this.visibleModalSetupGuid = true
      this.$refs.modalSetupChannel.show()
    },
    handleConfirmChangeFirstPostStatus() {
      try {
        this.$emit('addPost', this.validPostId)
        this.postId = ''
        this.validPostId = ''
        this.visibleModalSetupPostId = false
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    handleRemovePost(postId) {
      this.$emit('deletePost', postId)
    },
    handleCancel() {},
    async handleSubmitAddPost() {
      try {
        if (!this.postId.length || !this.isCheckComment) return
        this.isLoading = true
        const payload = {
          post: this.postId,
        }
        const { data } = await this.$api.socialChannel.addPostConfig(
          this.channelId,
          payload
        )
        if (!this.commentOptions.posts.length) {
          this.validPostId = data.id
          this.visibleModalSetupPostId = true
        } else {
          // eslint-disable-next-line unicorn/prefer-includes
          const isExist = this.commentOptions.posts.some(
            (post) => post === data.id
          )
          if (!isExist) {
            this.$emit('addPost', data.id)
            this.postId = ''
            this.validPostId = ''
          } else {
            notification.error({
              message: this.$t('validate-config-post-exist'),
              class: 'notification-error',
            })
          }
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.isLoading = false
      }
    },
    handleChangePostStatus(e) {
      this.$emit('changePostStatus', e.target.value)
    },
    handleSwitchPostStatus() {
      this.visibleModalConfirmChangeStatus = true
      // const value =
      //   this.commentOptions.posts_status ===
      //   this.configChannel.posts_status.handle
      //     ? this.configChannel.posts_status.unhandle
      //     : this.configChannel.posts_status.handle
      // this.$emit('changePostStatus', value)
    },
  },
}
</script>
<style lang="less">
.channel-setup-posts {
  margin-bottom: @margin-12;
  &__head {
    @apply flex items-center;
    .custom-button-setup {
      width: @width-btn-trigger;
      height: @width-btn-trigger;
      cursor: pointer;
      @apply duration-500;
      &:hover {
        transform: scale(1.1);
      }
    }
    .custom-input,
    .custom-input.ant-input-affix-wrapper {
      height: @height-field;
      flex: 1;
      margin-inline: @size-12;
      .ant-input {
        color: @black;
        height: 100%;
      }
      .ant-input-suffix {
        font-size: @size-16;
        color: @black;
      }
    }
    .btn-submit {
      height: @height-field;
    }
  }
  &__body {
    border: 1px solid @gray-4;
    border-radius: 8px;
    margin-top: @margin-24;
    &__top {
      background-color: #f2f3f4;
      border-radius: 8px;
      padding-block: @padding-12;
      @apply flex items-center justify-center;
      .switch-post-status {
        color: @black;
        font-size: @font-size-base;
        .ant-switch {
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
    }
    &__listing {
      height: 400px;
      overflow: hidden auto;
    }
  }
}
.modal-setup-post-id {
  .title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold mb-2;
  }
  .note {
    color: @gray-3;
    font-size: @size-14;
  }
  .ant-modal-footer {
    border: none;
    padding-bottom: 16px;
  }
  &__body {
    @apply flex items-center;
    .custom-radio {
      padding: @padding-12;
      border-radius: 8px;
      border: 1px solid @gray-5;
      width: 49%;
      &:first-child {
        margin-right: @margin-12;
      }
      &.ant-radio-wrapper-checked {
        background-color: @primary-3;
        border: none;
      }
      &__label {
        color: @black;
        font-size: @size-14;
        @apply font-medium;
      }
    }
  }
}
.app-dot {
  width: @size-12;
  height: @size-12;
  display: inline-block;
  background-color: @secondary-4;
  border-radius: 50%;
  margin-inline: 4px;
}

.slick-active {
  .app-dot {
    background-color: @primary;
  }
}
.custom-slick-arrow.slick-disabled {
  cursor: not-allowed !important;
}
.modal-confirm-change-status {
  .ant-modal-header {
    border: none;
    .ant-modal-title {
      font-size: @size-20;
      color: @black;
      font-weight: 600;
      padding-bottom: 0;
    }
  }
  .ant-modal-body {
    padding-block: 0;
  }
  .ant-modal-footer {
    border: none;
  }
  &__note {
    color: @gray-3;
    font-size: @size-14;
  }
}
</style>
