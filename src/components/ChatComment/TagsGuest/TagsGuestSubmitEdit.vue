<template>
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
</template>
<script>
export default {
  name: 'TagsGuestSubmitEdit',
  props: {
    canSubmit: {
      type: Boolean,
      default: false,
    },
    tagEdit: {
      type: Object,
      default: () => {},
    },
    selectedTag: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    handleSubmit() {
      if (!this.canSubmit || this.tagEdit.id === this.selectedTag.id) return
      this.$emit('submit')
    },
    handleCancel() {
      this.$emit('close')
    },
  },
}
</script>
