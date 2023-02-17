<template>
  <div class="customer-card" @click="handleOpenCustomerDetail">
    <div class="infomation">
      <div class="infomation__left">
        <img
          :src="require(`~/assets/images/Icon/Icon-${customerInline.rank}.png`)"
          alt="Social CRM"
          class="rank"
        />
        <div class="flex flex-col ml-4">
          <p class="name">
            {{ customerInline.name }}
          </p>
          <div class="phone">
            {{ customerInline.phone }}
          </div>
        </div>
      </div>
      <div class="infomation__right">
        <div class="flex">
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
              alt="Social CRM"
              class="channel"
            />
          </a-popover>
        </div>
        <div class="date">{{ customerInline.date }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { invert } from 'lodash'
import { convertUTCToLocal } from '@/utils/moment'

export default {
  name: 'CustomerCard',
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
      if (!channels.length) return {}
      return channels.reduce((group, channel) => {
        const { code } = channel.channel_type.data
        group[code] = group[code] || []
        group[code].push(channel)
        return group
      }, {})
    },
    customerInline() {
      return {
        id: this.customer.id,
        rank: this.customerRank[this.customer.rank.data.level],
        name: this.customer.name,
        channels: this.socialChannels,
        phone: this.customer.phone,
        date: convertUTCToLocal(
          this.customer.last_order.created_at,
          'HH:mm DD/MM/YYYY'
        ),
      }
    },
    pageId() {
      return this.$route.params.page
    },

    conversationType() {
      return this.$route.params.type
    },
    guestId() {
      return this.$route.params.guest
    },
  },
  methods: {
    handleOpenCustomerDetail() {
      this.$emit('handleOpenCustomerDetail', { ...this.customer })
    },
  },
}
</script>

<style lang="less" scoped>
.customer-card {
  padding: @padding-12 @padding-16;
  @apply flex items-start cursor-pointer;
}

.rank {
  width: @size-25;
  height: @size-25;
}

.infomation {
  flex: 1;
  @apply flex items-center justify-between;

  &__left {
    @apply flex;
  }
  &__right {
    @apply flex flex-col items-end;
  }
}

.name {
  line-height: 1;
  font-size: @size-14;
  color: @black;
  margin-bottom: @margin-8;

  @apply font-medium;
}

.channel {
  width: @size-24;
  height: auto;
  margin-left: 0.5rem;
  margin-bottom: @margin-12;
}

.phone {
  font-size: @size-14;
  color: @secondary-1;
}

.date {
  font-size: @size-14;
  color: @secondary-1;
  margin-left: 0.5rem;
}
</style>
