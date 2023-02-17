<template>
  <a-select
    size="large"
    class="custom-select"
    dropdown-class-name="chat-comment-select-channel"
    :value="selectedChannel"
    :disabled="loading"
    @change="handleChangeChannel"
  >
    <template slot="suffixIcon">
      <icon-right :style="{ transform: 'rotate(90deg)' }" />
    </template>
    <a-select-option
      v-for="channel in channelOptions"
      :key="channel.key"
      :value="channel.key"
    >
      <img
        :src="require(`~/assets/images/Icon/Icon-${channel.type}.png`)"
        class="chat-comment-select-channel__icon"
      />
      {{ channel.name }}
    </a-select-option>
  </a-select>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'ChatCommentSelectChannel',
  props: {
    channels: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    channelOptions() {
      return this.channels.map((item) => {
        return {
          key: `${item.social_channel_id}`,
          name: item.name,
          type: get(item, 'channel_type.data.code', '') || '',
        }
      })
    },
    selectedChannel() {
      const primaryChannelId = get(this.channelOptions, '0.key', null) || null
      const pageId = this.$route.params.page || primaryChannelId || null
      return pageId
    },
  },
  methods: {
    handleChangeChannel(value) {
      this.$emit('change', value)
    },
  },
}
</script>

<style lang="less" scoped>
.custom-select {
  color: @gray-1;
  font-size: @size-14;
  /deep/.ant-select-selection {
    background-color: @primary-3;
    border: none !important;
    height: @height-field;
    @apply font-medium;
    &__rendered {
      line-height: @height-field;
    }
    .ant-select-arrow-icon {
      color: @black;
    }
  }
}
.chat-comment-select-channel {
  &__icon {
    width: @size-32;
    height: @size-32;
    margin-right: @margin-8;
    @apply inline-block;
  }
}
</style>
