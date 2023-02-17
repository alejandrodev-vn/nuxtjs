<template>
  <a-drawer
    width="30vw"
    :closable="false"
    :visible="isShow"
    class="unsafe-keyword-edit"
    @close="handleClose"
  >
    <span class="unsafe-keyword-edit__close" @click="handleClose">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <div class="unsafe-keyword-edit__content">
      <div class="unsafe-keyword-edit-content">
        <div class="unsafe-keyword-edit-content__title">
          {{ $t('edit-keyword') }}
        </div>
        <div class="unsafe-keyword-edit-content__form">
          <a-form-model
            ref="form"
            :model="form"
            :rules="rules"
            :colon="false"
            hide-required-mark
          >
            <a-form-model-item
              ref="keyword"
              prop="keyword"
              :label="$t('keyword')"
            >
              <a-input
                v-model="form.keyword"
                size="large"
                :placeholder="$t('enter-keyword')"
              />
            </a-form-model-item>
            <a-form-model-item
              ref="convoType"
              prop="convoType"
              :label="$t('apply-to-convo-type')"
            >
              <a-select
                v-model="form.convoType"
                size="large"
                style="width: 100%"
                class="custome-select"
                :placeholder="$t('all-convo-type')"
              >
                <a-select-option :value="0">
                  {{ $t('all-convo-type') }}
                </a-select-option>
                <a-select-option :value="1"> {{ $t('chat') }} </a-select-option>
                <a-select-option :value="2">
                  {{ $t('comment') }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item ref="isBanned" prop="isBanned">
              <a-switch v-model="form.isBanned" />
              <span class="text-type">
                {{
                  form.isBanned
                    ? $t('banned-to-use-in-response')
                    : $t('warning-to-use-in-response')
                }}
              </span>
            </a-form-model-item>
          </a-form-model>
        </div>
        <div class="unsafe-keyword-edit-content__actions">
          <a-button @click="handleClose">
            {{ $t('cancel') }}
          </a-button>
          <a-button
            type="primary"
            :class="{ disabled: !canSubmit }"
            @click="handleSave"
          >
            <a-icon v-if="loading" type="loading" />
            {{ $t('save') }}
          </a-button>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'UnsafeKeywordEdit',
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    keywordEdit: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      canSubmit: false,
      form: {
        keyword: '',
        convoType: 0,
        isBanned: false,
      },
      rules: {
        keyword: [
          {
            required: true,
            message: this.$t('left-unsafe-keyword-blank'),
            trigger: 'blur',
          },
        ],
      },
    }
  },
  watch: {
    form: {
      handler(formEdit) {
        this.canSubmit =
          formEdit.keyword !== this.keywordEdit.disallow_keyword ||
          formEdit.isBanned !== (this.keywordEdit.type === 2) ||
          formEdit.convoType !== this.keywordEdit.conversation_type
      },
      deep: true,
    },
  },
  created() {
    if (this.keywordEdit) {
      this.form = {
        ...this.form,
        keyword: this.keywordEdit.disallow_keyword,
        convoType: this.keywordEdit.conversation_type,
        isBanned: this.keywordEdit.type === 2,
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.handleSubmit()
        }
      })
    },
    async handleSubmit() {
      try {
        this.loading = true
        if (!this.form.keyword.length || !this.canSubmit) return
        const payload = {
          disallow_keyword: this.form.keyword,
          conversation_type: this.form.convoType ? this.form.convoType : 0,
          type: this.form.isBanned ? 2 : 1,
        }
        await this.$api.unsafeKeyword.updateUnsafeKeyword(
          payload,
          this.keywordEdit.id
        )
        notification.success({
          message: this.$t('updated-unsafe-keyword-successfully'),
          class: 'notification-success',
        })
        this.handleClose()
        this.$emit('reload')
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.unsafe-keyword-edit {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    cursor: pointer;
    z-index: 10;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }
  .text-type {
    color: @black;
    @apply ml-2;
  }

  &.ant-drawer-open {
    /deep/ .ant-drawer-content {
      @apply overflow-visible;
      .ant-drawer-body {
        height: 100%;
        padding: 0;
        @apply overflow-auto;
      }
    }
  }
  /deep/.ant-select-selection-selected-value,
  .ant-input,
  .ant-select-arrow-icon {
    color: @black !important;
  }
  /deep/.custom-select {
    .ant-select-selection {
      border-color: @black-gray;
      height: @height-field;
      &__rendered {
        line-height: @height-field;
        font-size: @size-16;
      }
    }
  }
}

.unsafe-keyword-edit-content {
  min-height: 100vh;
  padding: @padding-40 @padding-24;
  @apply relative;

  &__title {
    color: @black;
    font-size: @size-20;
    margin-bottom: 1rem;
    @apply font-semibold;
  }

  &__actions {
    width: 100%;
    left: 0;
    bottom: 0;
    background-color: @white;
    padding: 1rem 1.5rem;
    box-shadow: 8px 0 24px rgba(25, 32, 56, 0.04);
    @apply absolute text-right;
  }
}
</style>
