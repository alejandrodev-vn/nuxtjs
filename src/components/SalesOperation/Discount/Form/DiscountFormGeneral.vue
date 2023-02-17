<template>
  <div class="discount-form-general">
    <div class="discount-form-general__title">
      {{ $t('general') }}
    </div>
    <a-form-model
      ref="formDiscountFormGeneral"
      :model="form"
      :rules="rules"
      :colon="false"
      class="discount-form-general__form discount-form-general-form"
    >
      <div class="discount-form-general-form__code">
        <label class="discount-form-general-form__code--label">
          {{ $t('discount-code') }}
        </label>
        <span
          class="discount-form-general-form__code--action"
          :class="{ 'pointer-events-none': disabled }"
          @click="handleQuickGenerate"
        >
          {{ $t('quick-generate') }}
        </span>
      </div>
      <a-form-model-item ref="code" prop="code">
        <a-input
          v-model="form.code"
          :placeholder="$t('placeholder')"
          :disabled="disabled"
        />
      </a-form-model-item>
      <a-form-model-item ref="name" prop="name" :label="$t('discount-name')">
        <a-input
          v-model="form.name"
          :placeholder="$t('placeholder')"
          :disabled="disabled"
        />
      </a-form-model-item>
      <a-form-model-item
        ref="description"
        prop="description"
        :label="$t('description-optional')"
      >
        <a-textarea v-model="form.description" :disabled="disabled" />
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { get, random } from 'lodash'

export default {
  name: 'DiscountFormGeneral',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        code: '',
        name: '',
        description: '',
      },
      rules: {
        code: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          {
            // eslint-disable-next-line no-useless-escape
            pattern: /[a-zA-Z0-9]$/,
            message: this.$t('format-required', {
              name: this.$t('discount-code'),
            }),
            trigger: 'blur',
          },
        ],
        name: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
        ],
      },
    }
  },
  mounted() {
    const code = get(this.discount, 'codes.data[0].code', '') || ''
    this.form = {
      code,
      name: get(this.discount, 'name', '') || '',
      description: get(this.discount, 'description', '') || '',
    }
  },
  methods: {
    handleQuickGenerate() {
      const number = random(6, 18)
      this.form.code = this.handleGenerateRandomString(number)
    },
    handleGenerateRandomString(length) {
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

      const result = Array.from({ length }, () => {
        return characters.charAt(Math.floor(Math.random() * characters.length))
      }).join('')

      return result
    },
    handleValidate() {
      let isCompleted = false
      this.$refs.formDiscountFormGeneral.validate((valid) => {
        if (valid) {
          isCompleted = true
        }
      })

      return isCompleted
    },
  },
}
</script>

<style lang="less" scoped>
.discount-form-general {
  background-color: #f8f8f8;
  padding: @padding-24 @padding-20;

  &__title {
    font-size: @size-16;
    color: @black;
    margin-bottom: @margin-12;
    @apply font-medium;
  }
}

.discount-form-general-form {
  &__code {
    @apply flex items-center justify-between;

    &--label {
      font-size: @size-14;
      color: @secondary-1;
      line-height: 1;
      margin-bottom: 0.5rem;
      @apply relative inline-block font-medium;

      &::before {
        display: inline-block;
        margin-right: 2px;
        color: #f5222d;
        font-size: @size-14;
        font-family: SimSun, sans-serif;
        line-height: 1;
        content: '*';
      }
    }

    &--action {
      font-size: @size-14;
      color: @primary;
      line-height: 1;
      margin-bottom: 0.5rem;
      @apply inline-block font-medium cursor-pointer;

      &.pointer-events-none {
        color: @secondary-2;
      }
    }
  }

  /deep/textarea {
    height: 60px !important;
  }
}
</style>
