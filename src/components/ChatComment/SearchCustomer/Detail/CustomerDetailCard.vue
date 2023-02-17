<template>
  <div class="customer-detail-card">
    <div class="flex items-center">
      <div class="name">
        {{ customerInline.name }}
      </div>
      <img
        :src="require(`~/assets/images/Icon/Icon-${customerInline.rank}.png`)"
        alt="Social CRM"
        class="rank"
      />
      <div class="flex items-center ml-auto">
        <a-popover
          v-for="(channel, key) in customerInline.channels"
          :key="key"
          placement="right"
        >
          <template slot="content">
            <span v-for="page in channel" :key="page.id" class="block py-1">
              {{ page.name }}
            </span>
          </template>
          <img
            :src="require(`~/assets/images/Icon/Icon-${key}.png`)"
            alt="Prime CRM"
            class="channel"
          />
        </a-popover>
      </div>
    </div>
    <div class="flex items-center mt-3">
      <i class="fal fa-phone"></i>
      <div class="phone">
        {{ customerInline.phone }}
      </div>
    </div>
  </div>
</template>

<script>
import { invert } from 'lodash'
import { convertUTCToLocal } from '@/utils/moment'

export default {
  name: 'CustomerDetailCard',
  props: {
    customer: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    customerRank() {
      return invert(this.$store.state.customerRank)
    },
    socialChannels() {
      const channels = this.customer.social_channels?.data
      if (!channels?.length) return {}
      return channels.reduce((group, channel) => {
        const { code } = channel.channel_type.data
        group[code] = group[code] || []
        group[code].push(channel)
        return group
      }, {})
    },
    customerInline() {
      if (!this.customer) return {}
      return {
        id: this.customer.id,
        rank:
          this.customerRank[this.customer.rank?.data?.level] ||
          this.customerRank.bronze,
        name: this.customer.name,
        channels: this.socialChannels,
        phone: this.customer.phone,
        date: convertUTCToLocal(
          this.customer.last_order?.created_at,
          'HH:mm DD/MM/YYYY'
        ),
      }
    },
  },
}
</script>

<style lang="less" scoped>
.customer-detail-card {
  padding: @padding-16 @padding-24;
  border-color: @gray-4;
  @apply border rounded-md mr-4;

  .fa-phone {
    font-size: @size-12;
  }
}

.rank {
  width: @size-24;
  height: @size-24;
  margin-left: 0.5rem;
}

.name {
  line-height: 1;
  font-size: @size-20;
  color: #2650e4;
  @apply font-medium;
}

.channel {
  width: 3rem;
  height: 3rem;
  margin-left: 0.5rem;
}

.phone {
  font-size: @size-12;
  color: @black;
  margin-left: 0.5rem;
}
</style>
