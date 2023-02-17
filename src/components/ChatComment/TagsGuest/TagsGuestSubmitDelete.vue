<template>
  <transition name="float-up">
    <div class="tags-edit__footer">
      <a-button type="secondary" class="btn-cancel" @click="handleCancel">
        {{ $t('cancel') }}
      </a-button>
      <a-button
        type="primary"
        class="btn-save"
        :class="{ disabled: !canSubmit }"
        @click="handleSubmit"
      >
        {{ $t('save') }}
      </a-button>
    </div>
  </transition>
</template>
<script>
export default {
  name: 'TagsGuestSubmitDelete',
  props: {
    canSubmit: {
      type: Boolean,
      default: false,
    },
    tag: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    handleSubmit() {
      if (!this.canSubmit) return
      this.$emit('submit')
    },
    handleCancel() {
      this.$emit('close')
    },
  },
}
</script>
