<template>
  <a-drawer
    width="40vw"
    :closable="false"
    :visible="isShow"
    class="level-set-requirement"
    @close="handleClose"
  >
    <span class="level-set-requirement__close" @click="handleClose">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <div class="level-set-requirement__content">
      <div class="level-set-requirement-content">
        <div class="level-set-requirement-content__title">
          {{ $t('set-requirement') }}
        </div>
        <div class="level-set-requirement-content__form">
          <a-form-model ref="form" :model="form" :rules="rules" :colon="false">
            <a-form-model-item ref="advocacy" prop="advocacy">
              <div class="level-set-requirement-condition">
                <app-tag :type="levelColor.advocacy">
                  {{ $t('advocacy') }}
                </app-tag>
                <div class="level-set-requirement-condition__body">
                  <span class="level-set-requirement-condition__body--text">
                    {{ $t('from') }}
                  </span>
                  <a-input-number
                    v-model="form.advocacy_chat"
                    :min="minDigits"
                    :max="maxDigits"
                  />
                  <span
                    class="level-set-requirement-condition__body--text lowercase"
                  >
                    {{ $t('chats-and-from') }}
                  </span>
                  <a-input-number
                    v-model="form.advocacy_comment"
                    :min="minDigits"
                    :max="maxDigits"
                  />
                  <span
                    class="level-set-requirement-condition__body--text lowercase"
                  >
                    {{ $t('comments') }}
                  </span>
                </div>
              </div>
            </a-form-model-item>
            <a-form-model-item ref="loyalty" prop="loyalty">
              <div class="level-set-requirement-condition">
                <app-tag :type="levelColor.loyalty">
                  {{ $t('loyalty') }}
                </app-tag>
                <div class="level-set-requirement-condition__body">
                  <span class="level-set-requirement-condition__body--text">
                    {{ $t('from') }}
                  </span>
                  <a-input-number
                    v-model="form.loyalty_chat"
                    :min="minDigits"
                    :max="maxDigits"
                  />
                  <span
                    class="level-set-requirement-condition__body--text lowercase"
                  >
                    {{ $t('chats-and-from') }}
                  </span>
                  <a-input-number
                    v-model="form.loyalty_comment"
                    :min="minDigits"
                    :max="maxDigits"
                  />
                  <span
                    class="level-set-requirement-condition__body--text lowercase"
                  >
                    {{ $t('comments') }}
                  </span>
                </div>
              </div>
            </a-form-model-item>
            <a-form-model-item ref="convert" prop="convert">
              <div class="level-set-requirement-condition">
                <app-tag :type="levelColor.convert">
                  {{ $t('convert') }}
                </app-tag>
                <div class="level-set-requirement-condition__body">
                  <span class="level-set-requirement-condition__body--text">
                    {{ $t('from') }}
                  </span>
                  <a-input-number
                    v-model="form.convert_chat"
                    :min="minDigits"
                    :max="maxDigits"
                  />
                  <span
                    class="level-set-requirement-condition__body--text lowercase"
                  >
                    {{ $t('chats-and-from') }}
                  </span>
                  <a-input-number
                    v-model="form.convert_comment"
                    :min="minDigits"
                    :max="maxDigits"
                  />
                  <span
                    class="level-set-requirement-condition__body--text lowercase"
                  >
                    {{ $t('comments') }}
                  </span>
                </div>
              </div>
            </a-form-model-item>
            <a-form-model-item ref="consideration" prop="consideration">
              <div class="level-set-requirement-condition">
                <app-tag :type="levelColor.consideration">
                  {{ $t('consideration') }}
                </app-tag>
                <div class="level-set-requirement-condition__body">
                  <span class="level-set-requirement-condition__body--text">
                    {{ $t('from') }}
                  </span>
                  <a-input-number
                    v-model="form.consideration_chat"
                    :min="minDigits"
                    :max="maxDigits"
                  />
                  <span
                    class="level-set-requirement-condition__body--text lowercase"
                  >
                    {{ $t('chats-and-from') }}
                  </span>
                  <a-input-number
                    v-model="form.consideration_comment"
                    :min="minDigits"
                    :max="maxDigits"
                  />
                  <span
                    class="level-set-requirement-condition__body--text lowercase"
                  >
                    {{ $t('comments') }}
                  </span>
                </div>
              </div>
            </a-form-model-item>
            <a-form-model-item ref="awareness" prop="awareness">
              <div class="level-set-requirement-condition">
                <app-tag :type="levelColor.awareness">
                  {{ $t('awareness') }}
                </app-tag>
                <div class="level-set-requirement-condition__body">
                  <span class="level-set-requirement-condition__body--text">
                    {{ $t('from') }}
                  </span>
                  <a-input-number
                    v-model="form.awareness_chat"
                    :min="minDigits"
                    :max="maxDigits"
                  />
                  <span
                    class="level-set-requirement-condition__body--text lowercase"
                  >
                    {{ $t('chats-and-from') }}
                  </span>
                  <a-input-number
                    v-model="form.awareness_comment"
                    :min="minDigits"
                    :max="maxDigits"
                  />
                  <span
                    class="level-set-requirement-condition__body--text lowercase"
                  >
                    {{ $t('comments') }}
                  </span>
                </div>
              </div>
            </a-form-model-item>
          </a-form-model>
        </div>
        <div class="level-set-requirement-content__actions">
          <a-button @click="handleClose">
            {{ $t('cancel') }}
          </a-button>
          <a-button type="primary" :disabled="loading" @click="handleSave">
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
  name: 'LevelSetRequirement',
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    levels: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      loading: false,
      levelColor: this.$store.state.levelColor,
      form: {
        awareness_chat: 0,
        awareness_comment: 0,
        consideration_chat: 0,
        consideration_comment: 0,
        convert_chat: 0,
        convert_comment: 0,
        loyalty_chat: 0,
        loyalty_comment: 0,
        advocacy_chat: 0,
        advocacy_comment: 0,
      },
      rules: {},
      minDigits: 0,
      maxDigits: 999999999,
    }
  },
  mounted() {
    this.levels.forEach((item) => {
      const level = item.name.toLowerCase()
      this.form = {
        ...this.form,
        [`${level}_chat`]: item.message_range,
        [`${level}_comment`]: item.comment_range,
      }
    })
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
      this.loading = true
      try {
        const payload = {
          awareness: {
            message_range: this.form.awareness_chat,
            comment_range: this.form.awareness_comment,
          },
          consideration: {
            message_range: this.form.consideration_chat,
            comment_range: this.form.consideration_comment,
          },
          convert: {
            message_range: this.form.convert_chat,
            comment_range: this.form.convert_comment,
          },
          loyalty: {
            message_range: this.form.loyalty_chat,
            comment_range: this.form.loyalty_comment,
          },
          advocacy: {
            message_range: this.form.advocacy_chat,
            comment_range: this.form.advocacy_comment,
          },
        }
        const { data } = await this.$api.level.updateLevels(payload)
        if (data) {
          this.$emit('reload')
          this.handleClose()
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
          })
        }
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
.level-set-requirement {
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
}

.level-set-requirement-content {
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

.level-set-requirement-condition {
  font-size: @size-14;
  @apply flex flex-wrap items-center justify-between;

  .app-tag {
    font-size: @size-14;
  }

  &__body {
    &--text {
      margin: 0 0.25rem;
    }
  }
}
</style>
