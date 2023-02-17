<template>
  <div class="order-detail-products">
    <div class="order-detail-products__title">
      {{ $t('ordered-products') }}
    </div>

    <div class="order-detail-products__table">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
      >
        <template slot="name" slot-scope="name, record">
          <div class="order-detail-products-table-name">
            <img
              v-if="record.image"
              :src="record.image"
              alt="Prime CRM"
              class="order-detail-products-table-name__icon"
            />
            <p class="order-detail-products-table-name__name">{{ name }}</p>
          </div>
        </template>
        <template slot="price" slot-scope="price">
          <app-currency
            v-if="price"
            :price="price"
            :currency="`${currency} `"
          />
        </template>
        <template slot="total" slot-scope="total">
          <app-currency :price="total" :currency="`${currency} `" />
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'OrderDetailProducts',
  props: {
    order: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('product-name'),
          key: 'name',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: this.$t('qty'),
          key: 'quantity',
          dataIndex: 'quantity',
          scopedSlots: { customRender: 'quantity' },
          align: 'right',
        },
        {
          title: this.$t('unit-price'),
          key: 'price',
          dataIndex: 'price',
          scopedSlots: { customRender: 'price' },
          align: 'right',
        },
        {
          title: this.$t('total'),
          key: 'total',
          dataIndex: 'total',
          scopedSlots: { customRender: 'total' },
          align: 'right',
        },
      ],
    }
  },
  computed: {
    currency() {
      return get(this.order, 'currency.symbol', '') || ''
    },
    dataSource() {
      const products = get(this.order, 'order_details.data', []) || []
      let totalQuantity = 0
      let totalPrice = 0
      const result = products.map((item) => {
        totalQuantity = totalQuantity + item.quantity
        totalPrice = totalPrice + item.total_price
        return {
          key: item.sku,
          id: item.sku,
          image: item.image,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total_price,
        }
      })

      const dataSource = [
        ...result,
        {
          key: 'lastRow',
          id: 'lastRow',
          image: null,
          name: this.$t('sub-total'),
          quantity: totalQuantity,
          price: null,
          total: totalPrice,
        },
      ]

      return dataSource
    },
  },
}
</script>

<style lang="less" scoped>
.order-detail-products {
  border: 1px solid @secondary-2;
  border-radius: @border-radius-lg;
  @apply overflow-hidden;

  &__title {
    color: @black;
    font-size: @size-20;
    padding: @padding-16;
    padding-top: @padding-24;
    @apply font-semibold;
  }

  &__table {
    /deep/table {
      color: @black;
      thead {
        tr {
          height: @height-table;
          th {
            font-size: @size-14 !important;
            font-weight: 500;
          }
        }
      }
      tbody {
        tr {
          height: @height-table;
          > td {
            padding: @padding-8;
            font-size: @size-14 !important;
            p {
              font-size: @size-14;
              margin: 0;
            }
          }
        }
      }
    }
  }
}

.order-detail-products-table-name {
  @apply flex items-center;

  &__icon {
    width: @size-32;
    height: @size-32;
    object-fit: cover;
    margin-right: 0.75rem;
    border-radius: @border-radius-base;
  }
}
</style>
