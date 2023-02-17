<template>
  <a-modal
    :visible="visible"
    centered
    :footer="null"
    :mask-closable="true"
    width="50%"
    @cancel="hide"
  >
    <div class="channel-modal">
      <div class="channel-modal__header">
        <slot name="title">
          {{ $t('title-channel-modal') }}
        </slot>
      </div>
      <div class="channel-modal__content">
        <slot name="content"></slot>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'ChannelModal',
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    hide() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
.channel-modal {
  &__header {
    color: @black;
    font-size: @size-20;
    margin-bottom: 1rem;
    @apply font-semibold text-center;
  }
  /deep/.anticon {
    color: @gray-3;
    font-size: 30px;
    bottom: 0;
  }
}
.ant-modal-close-x {
  font-size: 2.4rem;
}
</style>
