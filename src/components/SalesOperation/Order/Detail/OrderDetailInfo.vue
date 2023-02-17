<template>
  <div class="order-detail-info">
    <img
      :src="require('~/assets/images/Logo/Logo-Prime-CRM-Redirect.png')"
      alt="Prime CRM"
      class="order-detail-info__icon"
    />
    <div class="order-detail-info__item">
      <div class="order-detail-info__item--label">{{ $t('order-ID') }}</div>
      <div class="order-detail-info__item--value">{{ info.orderId }}</div>
    </div>
    <div class="order-detail-info__item">
      <div class="order-detail-info__item--label">
        {{ $t('channel-account') }}
      </div>
      <div
        v-if="info.channel.type"
        class="order-detail-info__item--channel order-detail-info-item-channel"
      >
        <img
          :src="require(`~/assets/images/Icon/Icon-${info.channel.type}.png`)"
          alt="Prime CRM"
          class="order-detail-info-item-channel__icon"
        />
        <div class="order-detail-info-item-channel__name">
          {{ info.channel.name }}
        </div>
      </div>
      <div
        v-else
        class="order-detail-info__item--channel order-detail-info-item-channel"
      >
        --
      </div>
    </div>
    <div class="order-detail-info__item">
      <div class="order-detail-info__item--label">{{ $t('order-date') }}</div>
      <div class="order-detail-info__item--value">{{ info.date }}</div>
    </div>
    <div class="order-detail-info__item">
      <div class="order-detail-info__item--label">{{ $t('status') }}</div>
      <div class="order-detail-info__item--value">
        <app-tag :style="getStyleOrderStatus(info.status)" square>
          {{ $t(info.status) }}
        </app-tag>
      </div>
    </div>
    <div class="order-detail-info__item">
      <div class="order-detail-info__item--label">{{ $t('payment') }}</div>
      <div class="order-detail-info__item--value">{{ info.payment }}</div>
    </div>
    <div class="order-detail-info__item">
      <div class="order-detail-info__item--label">{{ $t('delivery-ID') }}</div>
      <div class="order-detail-info__item--value">{{ info.deliveryId }}</div>
    </div>
    <div class="order-detail-info__item">
      <div class="order-detail-info__item--label">
        {{ $t('delivery-provider') }}
      </div>
      <div class="order-detail-info__item--value">
        {{ $t(info.deliveryProvider) }}
      </div>
    </div>
    <div class="order-detail-info__item">
      <div class="order-detail-info__item--label">{{ $t('guest-name') }}</div>
      <div class="order-detail-info__item--value">{{ info.guestName }}</div>
    </div>
    <div class="order-detail-info__item">
      <div class="order-detail-info__item--label">{{ $t('ordered-by') }}</div>
      <div class="order-detail-info__item--value">{{ info.orderedBy }}</div>
    </div>
    <a-dropdown placement="bottomRight" :trigger="['click']">
      <a
        class="order-detail-info__dropdown"
        @click.stop="(e) => e.preventDefault()"
      >
        {{ $t('action') }}
        <a-icon type="down" />
      </a>
      <a-menu slot="overlay">
        <a-menu-item key="print">
          <a
            rel="noopener noreferrer"
            class="order-detail-info__dropdown--item"
            @click="handlePrintBillOrder"
          >
            {{ $t('print-bill') }}
          </a>
        </a-menu-item>
      </a-menu>
    </a-dropdown>
    <div
      :style="{
        position: 'fixed',
        bottom: '-99999px',
        right: '-99999px',
        visibility: 'hidden',
      }"
    >
      <div ref="printBill">
        <preview-bill
          :form="printData.customer"
          :discount-code="printData.discountCode"
          :discount-value="printData.discountValue"
          :sub-total="printData.subTotal"
          :shipping-fee="printData.shippingFee"
          :payment-method="printData.paymentMethod"
          :delivery="printData.delivery"
          :invoice-date="printData.invoiceDate"
          :ordered-full-address="printData.fullAddress"
          :ordered-social-channel="printData.socialChannel"
          :ordered-products="printData.products"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { get, invert } from 'lodash'
import { Printd } from 'printd'
import { convertUTCToLocal } from '@/utils/moment'
import { styles } from '@/constants/style-preview-bill'

export default {
  name: 'OrderDetailInfo',
  props: {
    order: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      orderStatusColor: this.$store.state.orderStatusColor,
      printData: {
        customer: {},
        products: [],
        discountCode: '',
        discountValue: 0,
        subTotal: 0,
        shippingFee: 0,
        paymentMethod: 1,
        delivery: {},
        socialChannel: {},
        invoiceDate: '',
      },
    }
  },
  computed: {
    orderStatus() {
      return invert(this.$store.state.orderStatus)
    },
    paymentType() {
      return invert(this.$store.state.paymentType)
    },
    info() {
      const channel = {
        type:
          get(this.order, 'social_channel.data.channel_type.data.code', '') ||
          '',
        name: get(this.order, 'social_channel.data.name', '') || '',
      }
      return {
        orderId: this.order.code,
        channel,
        date: this.order.created_at
          ? convertUTCToLocal(this.order.created_at, 'HH:mm DD/MM/YYYY')
          : '--',
        status: this.orderStatus[this.order.status],
        payment: this.$t(this.paymentType[this.order.payment_method_id]),
        deliveryId: get(this.order, 'tracking_code', '--') || '--',
        deliveryProvider:
          get(this.order, 'delivery_provider.data.code', '') || '',
        guestName: this.order.fan_name || '--',
        orderedBy: this.order.created_by_name,
      }
    },
  },
  methods: {
    getStyleOrderStatus(status) {
      return {
        '--color': 'white',
        '--background-color': this.orderStatusColor[status],
      }
    },
    handlePrintBillOrder() {
      try {
        if (!this.order) return
        this.printData = {
          ...this.printData,
          customer: {
            id: this.order.id,
            fullName: this.order.customer_name,
            phone: this.order.customer_phone,
            ...(this.order.comment?.length && { note: this.order.comment }),
            postCode: this.order.shipping_address?.data?.post_code,
          },
          fullAddress: this.order.shipping_address?.data?.full_address,
          products: this.order.order_details?.data
            ? [...this.order.order_details.data]
            : [],
          discountCode: this.order.promotion_code,
          discountValue: this.order.total_discount,
          subTotal: this.order.sub_total,
          shippingFee: this.order.total_shipping,
          paymentMethod: this.order.payment_method_id,
          delivery: { delivery_provider: { ...this.order.delivery_provider } },
          ...(this.order.social_channel?.data && {
            socialChannel: { ...this.order.social_channel.data },
          }),
          invoiceDate: this.order.invoice_date,
        }
        if (!this.$refs.printBill) return
        setTimeout(() => {
          const d = new Printd()
          d.print(this.$refs.printBill, styles)
        }, 500)
      } catch (e) {}
    },
  },
}
</script>

<style lang="less" scoped>
.order-detail-info {
  border: 1px solid @secondary-2;
  border-radius: @border-radius-lg;
  padding: @padding-24 @padding-20;
  @apply flex items-center justify-between;

  &__icon {
    width: 4.5rem;
    height: 4.5rem;
    object-fit: contain;
    margin: 0.25rem;
  }

  &__item {
    margin: 0.25rem;

    &--label {
      color: @black;
      font-size: @size-16;
      margin-bottom: @margin-8;
      @apply font-medium;
    }

    &--value {
      color: @black;
      font-size: @size-14;

      /deep/.app-tag {
        font-size: @size-14;
      }
    }
  }

  &__dropdown {
    color: @black;
    font-size: @size-14;
    border: 1px solid @secondary-2;
    border-radius: @border-radius-base;
    padding: 0.5rem 1rem;
    height: @height-field;
    @apply flex items-center font-medium;

    /deep/.anticon-down {
      margin-left: 0.5rem;
    }
  }
}

.order-detail-info-item-channel {
  @apply flex items-center;

  &__icon {
    width: @size-24;
    height: @size-24;
    object-fit: contain;
    margin-right: 0.5rem;
  }

  &__name {
    color: @black;
    font-size: @size-14;
  }
}
</style>
