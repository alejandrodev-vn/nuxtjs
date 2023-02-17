<template>
  <div class="customer-detail-information">
    <div class="customer-detail-information__left">
      <div class="customer-detail-information__left__rank">
        <img v-if="imageRankCustomer.length" :src="imageRankCustomer" alt="" />
        <span v-else>--</span>
      </div>
      <span class="customer-detail-information__left__name">
        {{ customer.name }}
      </span>
      <span class="customer-detail-information__left__phone">
        {{ $t('customer-phone') }} : {{ customer.phone }}
      </span>
    </div>
    <div class="customer-detail-information__right">
      <a-popover
        v-for="(channel, key) in channels"
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
          class="customer-detail-information__right__channel-item"
        />
      </a-popover>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CustomerDetailInformation',
  props: {
    customer: {
      type: Object,
      default: null,
    },
  },
  computed: {
    imageRankCustomer() {
      return this.customer?.rank?.data?.image
    },
    channels() {
      const channels = this.customer?.social_channels?.data || []
      return channels.length
        ? channels.reduce((group, channel) => {
            const { code } = channel.channel_type.data
            group[code] = group[code] || []
            group[code].push(channel)
            return group
          }, {})
        : {}
    },
  },
}
</script>
<style lang="less" scoped>
.customer-detail-information {
  @apply flex items-center justify-between;
  &__left {
    @apply flex items-center;
    &__rank {
      width: 24px;
      height: 24px;
    }
    &__name {
      color: @black;
      font-size: @size-16;
      line-height: @size-19;
      margin-left: @margin-16;
      @apply font-medium;
    }
    &__phone {
      color: @black;
      font-size: @font-size-base;
      line-height: 17px;
      margin-left: 16px;
    }
  }
  &__right {
    @apply flex items-center;
    img {
      width: @size-32;
      height: @size-32;
    }
    &__channel-item {
      margin-left: @margin-16;
    }
  }
}
</style>
