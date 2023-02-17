<template>
  <div class="email-template-preview">
    <div class="email-template-preview__title">
      {{ hiCustomerName }}
    </div>
    <div
      class="email-template-preview__greeting-message"
      v-html="form.greetingMessage"
    ></div>
    <div
      class="email-template-preview__receiver-information email-template-preview-receiver-information"
    >
      <div class="email-template-preview-receiver-information__label">
        Receiver information
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="flex justify-between my-1">
            <span class="block">Full name</span>
            <span class="block text-gray">{{ receiverName }}</span>
          </div>
          <div class="flex justify-between my-1">
            <span class="block">Phone</span>
            <span class="block text-gray">{{ receiverPhone }}</span>
          </div>
          <div class="flex justify-between my-1">
            <span class="block">Email</span>
            <span class="block text-gray">{{ receiverEmail }}</span>
          </div>
        </div>
        <div class="flex justify-between my-1">
          <span class="block">Address</span>
          <span class="block text-gray">{{ receiverAddress }}</span>
        </div>
      </div>
    </div>
    <div class="email-template-preview-order-information">
      <div class="email-template-preview-order-information__label">
        {{ orderInformationTitle }}
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="flex justify-between my-1">
            <span class="block">Order status</span>
            <span class="block" :class="orderStatus.color">
              {{ orderStatus.title }}
            </span>
          </div>
          <div
            v-if="type === 'canceled-order'"
            class="flex justify-between my-1"
          >
            <span class="block">Cancel date</span>
            <span class="block">{{ cancelDate }}</span>
          </div>
          <div
            v-else-if="type === 'delivered-order'"
            class="flex justify-between my-1"
          >
            <span class="block">Delivery date</span>
            <span class="block">{{ hourTimeDelivery }}</span>
          </div>
          <div
            v-else-if="type === 'failed-order'"
            class="flex justify-between my-1"
          >
            <span class="block">Failed date</span>
            <span class="block">{{ failedDate }}</span>
          </div>
        </div>
        <div>
          <div class="flex justify-between my-1">
            <span class="block">Order date</span>
            <span class="block">{{ hourTimeOrder }}</span>
          </div>
          <div
            v-if="type === 'canceled-order'"
            class="flex justify-between my-1"
          >
            <span class="block">Cancel note</span>
            <span class="block">{{ cancelNote }}</span>
          </div>
        </div>
      </div>
      <a-table
        :columns="columns"
        :pagination="false"
        :data-source="dataSource"
        :bordered="true"
        class="mt-2"
      >
        <template slot="productName" slot-scope="record">
          <div class="pl-2">
            <p class="mb-0">{{ record.name }}</p>
            <span class="text-gray">Variant: {{ record.variant }}</span>
          </div>
        </template>
        <template slot="unitCost" slot-scope="unitCost">
          <template v-if="unitCost">
            <app-currency :price="unitCost" :currency="symbolCurrency" />
          </template>
        </template>
        <template slot="total" slot-scope="total">
          <template v-if="total">
            <app-currency :price="total" :currency="symbolCurrency" />
          </template>
        </template>
        <template #footer>
          <div class="custom-footer-table">
            <div class="flex justify-between my-1">
              <span class="block font-medium mb-2">Sub total</span>
              <span class="block">
                <app-currency :price="2100000" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex justify-between my-1 mb-2">
              <span class="block font-medium">Discount</span>
              <span class="block discount">
                <app-currency :price="-100000" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex justify-between my-1 mb-2">
              <span class="block font-medium">Shipping fee</span>
              <span class="block">
                <app-currency :price="10000" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex justify-between my-1 mb-2">
              <span class="block font-medium">Total</span>
              <span class="block font-bold">
                <app-currency :price="2010000" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex justify-between my-1 mb-2">
              <span class="block font-medium">Pre-paid</span>
              <span class="block">
                <app-currency :price="0" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex justify-between my-1 mb-2">
              <span class="block font-medium">Pay at delivery</span>
              <span class="block">
                <app-currency :price="2010000" :currency="symbolCurrency" />
              </span>
            </div>
          </div>
        </template>
      </a-table>
      <div class="grid grid-cols-2 gap-4 mt-2">
        <div>
          <div class="flex justify-between my-1">
            <span class="block">Payment method</span>
            <span class="block text-gray">{{ method }}</span>
          </div>
          <div class="flex justify-between my-1">
            <span class="block">Deliver provider</span>
            <span class="block text-gray">{{ provider }}</span>
          </div>
        </div>
        <div>
          <div class="flex justify-between my-1">
            <span class="block">Note from buyer</span>
            <span class="block text-gray">--</span>
          </div>
        </div>
      </div>
    </div>
    <div
      class="email-template-preview__closing-message"
      v-html="form.closingMessage"
    ></div>
    <div class="email-template-preview__copyright">
      {{ copyright }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmailTemplatePreviewEnglish',
  props: {
    type: {
      type: String,
      default: '',
    },
    form: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      hiCustomerName: 'Hi <customer_name>,',
      receiverName: '<customer_name>',
      receiverPhone: '<customer_phone>',
      receiverEmail: '<customer_email>',
      receiverAddress: '<customer_address>',
      orderInformationTitle: 'Order information - Order ID: <Order ID>',
      cancelDate: '<cancel_date>',
      hourTimeDelivery: '<hour_time_delivery>',
      failedDate: '<failed_date>',
      hourTimeOrder: '<hour_time_order>',
      cancelNote: '<cancel_note>',
      provider: '<provider>',
      method: '<method>',
      copyright: 'Copyright© by <account-name>',
      dataSource: [
        {
          key: '1',
          name: 'HeVieFood 250g flexible dried banana',
          qty: 1,
          unitCost: 100000,
          total: 100000,
          variant: '250g',
        },

        {
          key: '2',
          name: 'High-end designer satin nightgown ',
          qty: 2,
          unitCost: 500000,
          total: 1000000,
          variant: 'red',
        },
        {
          key: '3',
          name: 'Sakura Perfect Diary Professional Makeup Moisturizing Lipstick For Girlfriends 10g',
          qty: 2,
          unitCost: 500000,
          total: 1000000,
          variant: 'red',
        },
      ],
      columns: [
        {
          key: 'name',
          title: 'Product name',
          scopedSlots: { customRender: 'productName' },
        },
        {
          key: 'qty',
          title: 'Qty',
          scopedSlots: { customRender: 'qty' },
          dataIndex: 'qty',
          className: 'col-demo-table-detail-qty',
          align: 'right',
        },
        {
          key: 'unitCost',
          title: 'Unit cost',
          scopedSlots: { customRender: 'unitCost' },
          dataIndex: 'unitCost',
          align: 'right',
        },
        {
          key: 'total',
          title: 'Total',
          scopedSlots: { customRender: 'total' },
          dataIndex: 'total',
          align: 'right',
        },
      ],
    }
  },
  computed: {
    symbolCurrency() {
      return `${this.$store.state.configCurrency.vi.symbol} `
    },
    orderStatus() {
      return this.type === 'order-confirmation'
        ? {
            title: 'Ordered successfully',
            color: 'color-green',
          }
        : this.type === 'canceled-order'
        ? {
            title: 'Canceled',
            color: 'color-red',
          }
        : this.type === 'delivered-order'
        ? {
            title: 'Delivered',
            color: 'color-green',
          }
        : this.type === 'failed-order'
        ? {
            title: 'Failed',
            color: 'color-red',
          }
        : {
            title: '',
            color: '',
          }
    },
  },
}
</script>

<style lang="less" scoped>
.email-template-preview {
  border: 1px solid @secondary-2;
  border-radius: 20px;
  color: @black;
  padding: 2rem;

  &__title {
    color: @black;
    font-size: @size-16;
    @apply font-semibold;
  }

  &__greeting-message {
    color: @gray-1;
    font-size: @size-14;
    white-space: pre-line;
    margin-top: 0.5rem;
  }

  &__closing-message {
    white-space: pre-line;
    color: @black;
    font-size: @size-16;
    margin-top: 2rem;
    @apply font-semibold text-center;
  }

  &__copyright {
    color: @gray-1;
    font-size: @size-14;
    margin-top: 0.25rem;
    @apply text-center;
  }

  /deep/.ant-table {
    thead {
      tr {
        th {
          background-color: @secondary-4;
          .ant-table-column-title {
            font-size: @size-12;
            @apply font-medium;
          }
        }
      }
    }
    tbody {
      tr {
        td {
          font-size: @size-12 !important;
          color: @black;
          p,
          span {
            font-size: @size-12;
          }
        }
      }
    }
    .ant-table-footer {
      padding: 0.375rem 0.5rem;
    }
  }
}

.custom-footer-table {
  font-size: @size-12;
  color: @black;
}
.ant-table-footer {
  padding: 10px;
}

.color-green {
  color: @green;
}

.color-red {
  color: @red;
}

.discount {
  color: @red;
}

.text-gray {
  color: @secondary-1;
}

.email-template-preview-receiver-information,
.email-template-preview-order-information {
  font-size: @size-12;
  margin-top: 1rem;
  &__label {
    color: @black;
    font-size: @size-12;
    @apply font-semibold;
  }
}
</style>
