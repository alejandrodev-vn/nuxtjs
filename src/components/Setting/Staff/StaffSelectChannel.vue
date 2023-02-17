<template>
  <a-popover v-model="visible" placement="bottomLeft" trigger="click">
    <template slot="content">
      <div class="popover-content">
        <div class="flex items-center justify-between">
          <a-button type="link" @click="handleCheckAll">
            {{ $t('select-all') }}
          </a-button>
          <a-button type="link" @click="handleClearAll">
            {{ $t('clear') }}
          </a-button>
        </div>
        <a-tree
          v-model="checkedKeys"
          checkable
          default-expand-all
          :tree-data="treeData"
          @check="handleCheck"
        >
        </a-tree>
      </div>
    </template>
    <div class="popover-button">
      <div class="popover-button__text">{{ textDropdown }}</div>
      <a-icon type="down" />
    </div>
  </a-popover>
</template>

<script>
import { get } from 'lodash'
export default {
  name: 'StaffSelectChannel',
  fetchOnServer: false,
  props: {
    channels: {
      type: Array,
      default: () => [],
    },
    ids: {
      type: Array,
      default: () => null,
    },
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      visible: false,
      checkedKeys: [],
    }
  },
  computed: {
    allKeys() {
      return this.channels.map((channel) => {
        return channel.social_channel_id
      })
    },
    textDropdown() {
      return this.$t(this.title.length ? this.title : 'all-channel-account', {
        checked: this.checkedKeys.length,
        total: this.channels.length,
      })
    },
    typeChannels() {
      const typeChannels = {
        facebook: [],
        instagram: [],
        shopee: [],
        whatsapp: [],
        zalo: [],
      }
      this.channels.forEach((channel) => {
        const channelType = get(channel, 'channel_type.data.code', '') || ''
        const item = {
          type: channelType,
          key: channel.social_channel_id,
          title: channel.name,
        }
        typeChannels[channelType] = [...typeChannels[channelType], item]
      })
      return typeChannels
    },
    treeData() {
      const channels = Object.keys(this.typeChannels).reduce((result, item) => {
        const channel = {
          title: this.$t(item),
          key: item,
          children: [...this.typeChannels[item]],
        }
        if (!this.typeChannels[item].length) {
          return [...result]
        }
        return [...result, channel]
      }, [])
      return channels
    },
  },
  watch: {
    checkedKeys() {
      this.$emit('input', this.checkedKeys)
    },
  },
  mounted() {
    this.handleCheckKeys()
  },
  methods: {
    handleCheckKeys() {
      this.checkedKeys = this.ids ? this.ids : this.allKeys
    },
    handleCheck(checkedKeys) {
      this.checkedKeys = checkedKeys.filter((item) => Number.isInteger(item))
    },
    handleCheckAll() {
      this.checkedKeys = this.allKeys
    },
    handleClearAll() {
      this.checkedKeys = []
    },
  },
}
</script>
<style lang="less" scoped>
.popover-button {
  height: @height-field;
  border: 1px solid @secondary-2;
  border-radius: @border-radius-base;
  font-size: @size-16;
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  @apply flex items-center justify-between;

  &__text {
    margin-right: 0.5rem;
  }
  /deep/.anticon.anticon-down {
    font-size: @size-12;
  }
}
.popover-content {
  min-width: 16rem;
  max-height: 250px;
  overflow-y: auto;
}
</style>
