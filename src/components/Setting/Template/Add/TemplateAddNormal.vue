<template>
  <a-drawer
    width="30vw"
    :visible="isShow"
    mask-closable
    destroy-on-close
    :closable="false"
    class="template-add"
    @close="handleClose"
  >
    <span class="template-add__close" @click="handleClose">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <div class="template-add__content">
      <div class="template-add-content">
        <div class="template-add-content__title">
          <span class="mr-2">{{ $t('add-response-template') }}</span>
          <app-tag :type="'primary'">
            <span>{{ $t('normal') }}</span>
          </app-tag>
        </div>
        <perfect-scrollbar
          :options="{ suppressScrollX: true }"
          class="template-add-content__form"
        >
          <a-form-model
            ref="form"
            :model="form"
            :rules="rules"
            :colon="false"
            hide-required-mark
          >
            <a-form-model-item
              ref="name"
              prop="name"
              :label="$t('template-name')"
            >
              <a-input
                v-model="form.name"
                size="large"
                :placeholder="$t('type-template-name')"
              />
            </a-form-model-item>
            <a-form-model-item
              ref="convoType"
              prop="convoType"
              :label="$t('apply-to')"
            >
              <a-select
                v-model="form.convoType"
                size="large"
                style="width: 100%"
                class="custom-select"
                :placeholder="$t('all-conversation-type')"
              >
                <a-select-option :value="0">
                  {{ $t('all-conversation-type') }}
                </a-select-option>
                <a-select-option :value="1"> {{ $t('chat') }} </a-select-option>
                <a-select-option :value="2">
                  {{ $t('comment') }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item
              ref="response"
              prop="response"
              :label="$t('responseTemplate')"
            >
              <a-textarea
                v-model="form.response"
                size="large"
                class="custom-textarea"
                :auto-size="{ minRows: 3 }"
              >
              </a-textarea>
            </a-form-model-item>
          </a-form-model>
        </perfect-scrollbar>
        <div class="template-add-content__actions">
          <a-button @click="handleClose">
            {{ $t('cancel') }}
          </a-button>
          <a-button type="primary" :loading="isLoading" @click="handleSave">
            {{ $t('add') }}
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
  name: 'TemplateAddNormal',
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isLoading: false,
      form: {
        name: '',
        convoType: 0,
        response: '',
      },
      rules: {
        name: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
        ],
        response: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
        ],
      },
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
        this.isLoading = true
        if (!this.form.name.length || !this.form.response.length) return
        const payload = {
          name: this.form.name,
          type: 1,
          conversation_type: this.form.convoType ? this.form.convoType : 0,
          response: this.form.response,
        }
        await this.$api.responseTemplate.createTemplate(payload)
        notification.success({
          message: `${this.$t('saved')}!`,
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
        this.isLoading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.template-add {
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
  /deep/.ant-col.ant-form-item-label {
    line-height: 1rem;
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

.template-add-content {
  height: 100vh;
  padding: @padding-40 @padding-24;

  &__title {
    color: @black;
    font-size: @size-20;
    margin-bottom: 1rem;
    @apply font-semibold flex items-center;
  }
  &__form {
    height: 90%;
    @apply pr-6;
    /deep/&.ps--active-y > .ps__rail-y {
      left: unset !important;
      right: 0 !important;
    }
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
