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
          <span class="mr-2">{{ $t('edit-response-template') }}</span>
          <app-tag :type="'primary'">
            <span>
              {{ $t('auto-response') }}
            </span>
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
            <a-form-model-item ref="isKeywords" prop="isKeywords">
              <label class="flex items-center custom-label">
                <span>{{ $t('is-keyword') }}</span>
                <a-tooltip>
                  <template slot="title">
                    {{ $t('tooltip-is-keyword') }}
                  </template>
                  <a-icon type="info-circle" class="cursor-help ml-2" />
                </a-tooltip>
              </label>
              <span class="custom-placeholder">{{ $t('type-keyword') }}</span>
              <a-input
                v-model="valueIsKeyword"
                size="large"
                class="!mt-4"
                @pressEnter="handleAddIsKeyword"
              />
              <span v-if="showTextIsKeywordExist" class="text-validate">
                {{ $t('keyword-is-exist') }}
              </span>
              <div
                v-if="form.isKeywords.length"
                class="flex items-center flex-wrap mt-4"
              >
                <div
                  v-for="(keyword, index) in form.isKeywords"
                  :key="index"
                  class="chip-label"
                >
                  <span class="mr-2">{{ keyword }}</span>
                  <a-icon
                    type="close-circle"
                    @click="handleRemoveIsKeyword(keyword)"
                  />
                </div>
              </div>
            </a-form-model-item>
            <a-form-model-item ref="hasKeywords" prop="hasKeywords">
              <label class="flex items-center custom-label">
                <span
                  >{{ $t('has-keyword') }}: {{ $t('recommend-to-use') }}</span
                >
                <a-tooltip>
                  <template slot="title">
                    {{ $t('tooltip-is-keyword') }}
                  </template>
                  <a-icon type="info-circle" class="cursor-help ml-2" />
                </a-tooltip>
              </label>
              <span class="custom-placeholder">{{ $t('type-keyword') }}</span>
              <a-input
                v-model="valueHasKeyword"
                size="large"
                class="!mt-4"
                @pressEnter="handleAddHasKeyword"
              />
              <span v-if="showTextHasKeywordExist" class="text-validate">
                {{ $t('keyword-is-exist') }}
              </span>
              <div
                v-if="form.hasKeywords.length"
                class="flex items-center flex-wrap mt-4"
              >
                <div
                  v-for="(keyword, index) in form.hasKeywords"
                  :key="index"
                  class="chip-label"
                >
                  <span class="mr-2">{{ keyword }}</span>
                  <a-icon
                    type="close-circle"
                    @click="handleRemoveHasKeyword(keyword)"
                  />
                </div>
              </div>
            </a-form-model-item>
            <a-form-model-item
              ref="autoResponse"
              style="margin-bottom: 0"
              prop="autoResponse"
            >
              <div class="flex items-center">
                <a-switch default-checked disabled size="large" />
                <span class="label-black mx-2">{{ $t('auto-response') }}</span>
                <a-tooltip>
                  <template slot="title">
                    {{ $t('tooltip-auto-response') }}
                  </template>
                  <a-icon type="info-circle" class="cursor-help" />
                </a-tooltip>
              </div>
            </a-form-model-item>
            <a-form-model-item style="margin-bottom: 0">
              <div class="flex items-center">
                <a-checkbox v-model="isSetActiveDate" />
                <span class="label-black mx-2">
                  {{ $t('set-active-dates') }}
                </span>
              </div>
            </a-form-model-item>
            <a-form-model-item :label="$t('from-to')">
              <date-picker
                v-model="form.selectedDate"
                :disabled-date="disabledDate"
                :placeholder="$t('select-date-range')"
                :disabled="!isSetActiveDate"
                class="custom-datepicker"
                value-type="format"
                format="HH:mm DD/MM/YYYY"
                range-separator=" - "
                range
                @input="handleChangeDateRange"
              ></date-picker>
              <span v-if="showErrorToDate" class="text-validate">
                {{ $t('validate-from-is-equal-to-date') }}
              </span>
              <span v-if="showErrorRequireDate" class="text-validate">
                {{ $t('field-is-required') }}
              </span>
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
          <a-button
            type="primary"
            :disabled="!canSubmit"
            :loading="isLoading"
            @click="handleSave"
          >
            {{ $t('save') }}
          </a-button>
        </div>
        <app-modal ref="modalRequiredKeywords" type="danger">
          <template #title>
            {{ $t('cant-be-left-blank-valid-cases-are') }}
          </template>
          <template #content>
            <p>1. {{ $t('enter-is-keywords-or-has-keywords') }}</p>
            <p>2.{{ $t('enter-both-is-keywords-and-has-keywords') }}</p>
          </template>
          <template slot="footer">
            <a-button key="cancel" @click="handleCloseModalRequiredKeywords">
              {{ $t('cancel') }}
            </a-button>
          </template>
        </app-modal>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import Vue from 'vue'
import { isEqual } from 'lodash'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'TemplateEditAutoResponse',
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    templateEdit: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      isLoading: false,
      canSubmit: false,
      showTextIsKeywordExist: false,
      showTextHasKeywordExist: false,
      showErrorToDate: false,
      showErrorRequireDate: false,
      valueIsKeyword: '',
      valueHasKeyword: '',
      isSetActiveDate: false,
      form: {
        name: '',
        convoType: '',
        response: '',
        isKeywords: [],
        hasKeywords: [],
        selectedDate: [],
      },
    }
  },
  computed: {
    titleTypeTemplate() {
      if (this.typeComponent === 'add-auto' && this.form.autoResponse)
        return this.$t('auto-response')
      return this.form.autoResponse
        ? this.$t('auto-response')
        : this.$t('auto-suggestion')
    },
    enumTemplateType() {
      return this.$store.state.enumTemplateType
    },
    rules() {
      return {
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
        isKeywords: [
          {
            required:
              this.form.templateType === this.enumTemplateType.IS_KEYWORD,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
        ],
        hasKeywords: [
          {
            required:
              this.form.templateType === this.enumTemplateType.HAS_KEYWORD,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
        ],
      }
    },
  },
  watch: {
    isSetActiveDate() {
      if (
        this.isSetActiveDate &&
        !this.form.selectedDate[0] &&
        !this.form.selectedDate[1]
      ) {
        this.showErrorRequireDate = true
      }
      if (!this.isSetActiveDate) {
        this.showErrorToDate = this.showErrorRequireDate = false
      }
      const orignal = this.templateEdit.start_date || this.templateEdit.end_date
      if (this.isSetActiveDate === !!orignal) return
      this.canSubmit = true
    },
    form: {
      handler(form) {
        this.canSubmit =
          form.name !== this.templateEdit.name ||
          form.response !== this.templateEdit.response ||
          form.convoType !== this.templateEdit.conversation_type ||
          this.showTextIsKeywordExist ||
          this.showTextHasKeywordExist ||
          !isEqual(form.isKeywords, this.templateEdit.is_keyword) ||
          !isEqual(form.hasKeywords, this.templateEdit.has_keyword) ||
          (form.selectedDate[0] &&
            this.$moment(form.selectedDate[0], 'HH:mm DD/MM/YYYY').format(
              'YYYY-MM-DD HH:mm'
            ) !== this.templateEdit.start_date) ||
          (form.selectedDate[1] &&
            this.$moment(form.selectedDate[1], 'HH:mm DD/MM/YYYY').format(
              'YYYY-MM-DD HH:mm'
            ) !== this.templateEdit.end_date)
        this.showErrorToDate =
          this.isSetActiveDate &&
          form.selectedDate.length &&
          form.selectedDate[0] &&
          form.selectedDate[1] &&
          form.selectedDate[0] === form.selectedDate[1]
        this.showErrorRequireDate =
          this.isSetActiveDate &&
          (!form.selectedDate[0] || !form.selectedDate[1])
      },
      deep: true,
    },
    valueIsKeyword() {
      const value = this.valueIsKeyword.trimStart().trimEnd()
      const isExist = this.checkKeywordExist(value, this.form.isKeywords)
      this.showTextIsKeywordExist = isExist
    },
    valueHasKeyword() {
      const value = this.valueHasKeyword.trimStart().trimEnd()
      const isExist = this.checkKeywordExist(value, this.form.hasKeywords)
      this.showTextHasKeywordExist = isExist
    },
  },
  created() {
    if (this.templateEdit) {
      if (
        this.templateEdit.start_date.length &&
        this.templateEdit.end_date.length
      ) {
        this.isSetActiveDate = true
      }
      this.form = {
        ...this.form,
        name: this.templateEdit.name,
        convoType: this.templateEdit.conversation_type,
        response: this.templateEdit.response,
        isKeywords: [...this.templateEdit.is_keyword],
        hasKeywords: [...this.templateEdit.has_keyword],
        selectedDate: [
          this.templateEdit.start_date.length &&
            this.$moment(this.templateEdit.start_date).format(
              'HH:mm DD/MM/YYYY'
            ),
          this.templateEdit.end_date.length &&
            this.$moment(this.templateEdit.end_date).format('HH:mm DD/MM/YYYY'),
        ],
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleCloseModalRequiredKeywords() {
      this.$refs.modalRequiredKeywords.hide()
    },
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.handleEditTemplate()
        }
      })
    },
    handleEditTemplate() {
      const invalidActiveDate =
        this.isSetActiveDate &&
        (!this.form.selectedDate[0] || !this.form.selectedDate[1])
      if (!this.form.hasKeywords.length && !this.form.isKeywords.length) {
        this.$refs.modalRequiredKeywords.show()
        return
      }
      if (this.showTextIsKeywordExist || this.showTextHasKeywordExist) return
      if (invalidActiveDate) return
      this.handleSubmit()
    },
    async handleSubmit() {
      try {
        if (!this.templateEdit.id || !this.canSubmit) return
        this.isLoading = true
        const { form } = this
        const startDate =
          (this.isSetActiveDate &&
            form.selectedDate.length &&
            this.$moment(form.selectedDate[0], 'HH:mm DD/MM/YYYY').format(
              'YYYY-MM-DD HH:mm'
            )) ||
          ''
        const endDate =
          (this.isSetActiveDate &&
            form.selectedDate.length &&
            this.$moment(form.selectedDate[1], 'HH:mm DD/MM/YYYY').format(
              'YYYY-MM-DD HH:mm'
            )) ||
          ''
        const payload = {
          name: form.name,
          type: 3,
          response: form.response,
          auto_response: 1,
          start_date: startDate,
          end_date: endDate,
          conversation_type: form.convoType ? form.convoType : 0,
          is_keyword: [...form.isKeywords],
          has_keyword: [...form.hasKeywords],
        }
        await this.$api.responseTemplate.updateTemplate(
          payload,
          this.templateEdit.id
        )
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
    handleAddIsKeyword() {
      const value = this.valueIsKeyword.trimStart().trimEnd()
      const isExist = this.checkKeywordExist(value, this.form.isKeywords)
      if (isExist || !value.length) return
      this.form.isKeywords.push(value)
      this.$refs.form.validateField('isKeywords')
      this.valueIsKeyword = ''
    },
    handleRemoveIsKeyword(keyword) {
      const indexKeyword = this.form.isKeywords.findIndex(
        (item) => item === keyword
      )
      if (this.form.isKeywords[indexKeyword] === this.valueIsKeyword) {
        this.showTextIsKeywordExist = false
      }
      if (indexKeyword !== -1) {
        this.form.isKeywords.splice(indexKeyword, 1)
      }
    },
    handleAddHasKeyword() {
      const value = this.valueHasKeyword.trimStart().trimEnd()
      const isExist = this.checkKeywordExist(value, this.form.hasKeywords)
      if (isExist || !value.length) return
      this.form.hasKeywords.push(value)
      this.$refs.form.validateField('hasKeywords')
      this.valueHasKeyword = ''
    },
    handleRemoveHasKeyword(keyword) {
      const indexKeyword = this.form.hasKeywords.findIndex(
        (item) => item === keyword
      )
      if (this.form.hasKeywords[indexKeyword] === this.valueHasKeyword) {
        this.showTextHasKeywordExist = false
      }
      if (indexKeyword !== -1) {
        this.form.hasKeywords.splice(indexKeyword, 1)
      }
    },
    checkKeywordExist(value, keywords = []) {
      if (!value.length) return false
      const findKeywordIsExist = keywords.find((keyword) => keyword === value)
      return !!findKeywordIsExist
    },
    disabledDate(date) {
      return date < new Date(new Date().setHours(0, 0, 0, 0))
    },
    handleChangeDateRange(date) {
      const fromDate = this.$moment(date[0], 'HH:mm DD-MM-YYYY')
      const toDate = this.$moment(date[1], 'HH:mm DD-MM-YYYY')
      if (fromDate < new Date()) {
        this.form.selectedDate[0] = fromDate
          .set({
            hour: new Date().getHours(),
            minute: new Date().getMinutes(),
            second: 0,
            millisecond: 0,
          })
          .format('HH:mm DD/MM/YYYY')
      }
      if (toDate < fromDate) {
        this.form.selectedDate[1] = toDate
          .set({
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 0,
          })
          .format('HH:mm DD/MM/YYYY')
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
  .text-validate {
    color: @red;
    line-height: 1.5;
    font-size: 0.875rem;
    font-weight: 500;
    margin: 0.25rem 0 -1px 0;
    display: block;
  }
  .chip-label {
    font-size: @size-14;
    font-weight: 500;
    line-height: 18px;
    border-radius: 15px;
    padding: 0.375rem 0.75rem;
    border: 1px solid @gray-2;
    background-color: transparent;
    color: @gray-2;
    word-break: break-word;
    max-width: 100%;
    white-space: break-spaces;
    @apply flex items-center mr-2 mt-2;
    .anticon.anticon-close-circle {
      @apply cursor-pointer duration-500;
      &:hover {
        color: @red;
        transform: scale(1.2);
      }
    }
  }
  .label-black {
    color: @black;
  }
  /deep/.custom-datepicker {
    width: 25rem;
    height: @height-field;
    border-color: @black-gray;
    @apply w-full;
    .mx-input {
      height: @height-field;
    }
  }
  /deep/.custom-placeholder {
    background: white;
    position: absolute;
    left: 0;
    top: 2rem;
    width: fit-content;
    z-index: 2;
    height: 1.6rem;
    display: flex;
    align-items: center;
    margin-left: @margin-16;
    font-size: @size-11;
    padding-inline: @padding-4;
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
    /deep/.custom-label {
      font-size: @size-12;
      color: rgba(1, 18, 34, 0.5);
      font-weight: 500;
      line-height: 1rem;
      margin-bottom: 0.5rem;
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
