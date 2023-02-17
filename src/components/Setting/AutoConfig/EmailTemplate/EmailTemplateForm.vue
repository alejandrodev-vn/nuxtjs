<template>
  <div class="email-template-form">
    <a-form-model ref="form" :model="form" :rules="rules" :colon="false">
      <a-form-model-item
        ref="emailSubject"
        prop="emailSubject"
        :label="$t('email-subject')"
      >
        <a-input v-model="formInline.emailSubject" />
      </a-form-model-item>
      <a-form-model-item
        ref="greetingMessage"
        prop="greetingMessage"
        :label="$t('greeting-message')"
      >
        <a-textarea v-model="formInline.greetingMessage" :rows="4" />
      </a-form-model-item>
      <a-form-model-item
        ref="closingMessage"
        prop="closingMessage"
        :label="$t('closing-message')"
      >
        <a-textarea v-model="formInline.closingMessage" :rows="4" />
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
export default {
  name: 'EmailTemplateForm',
  props: {
    form: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      formInline: {
        ...this.form,
      },
      rules: {},
    }
  },
  watch: {
    formInline: {
      deep: true,
      handler() {
        this.$emit('update', this.formInline)
      },
    },
  },
}
</script>

<style lang="less" scoped>
.email-template-form {
  /deep/textarea {
    height: auto !important;
  }
}
</style>
