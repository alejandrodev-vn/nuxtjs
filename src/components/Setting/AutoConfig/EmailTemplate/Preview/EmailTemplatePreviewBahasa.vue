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
        Maklumat penerima
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="flex justify-between my-1">
            <span class="block">Nama penuh</span>
            <span class="block text-gray">{{ receiverName }}</span>
          </div>
          <div class="flex justify-between my-1">
            <span class="block">Telefon</span>
            <span class="block text-gray">{{ receiverPhone }}</span>
          </div>
          <div class="flex justify-between my-1">
            <span class="block">E-mel</span>
            <span class="block text-gray">{{ receiverEmail }}</span>
          </div>
        </div>
        <div class="flex justify-between my-1">
          <span class="block">Alamat</span>
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
            <span class="block">Status tempahan</span>
            <span class="block" :class="orderStatus.color">
              {{ orderStatus.title }}
            </span>
          </div>
          <div
            v-if="type === 'canceled-order'"
            class="flex justify-between my-1"
          >
            <span class="block">Tarikh pembatalan</span>
            <span class="block">{{ cancelDate }}</span>
          </div>
          <div
            v-else-if="type === 'delivered-order'"
            class="flex justify-between my-1"
          >
            <span class="block">Tarikh penghantaran</span>
            <span class="block">{{ hourTimeDelivery }}</span>
          </div>
          <div
            v-else-if="type === 'failed-order'"
            class="flex justify-between my-1"
          >
            <span class="block">Tarikh gagal</span>
            <span class="block">{{ failedDate }}</span>
          </div>
        </div>
        <div>
          <div class="flex justify-between my-1">
            <span class="block">Tarikh pesanan</span>
            <span class="block">{{ hourTimeOrder }}</span>
          </div>
          <div
            v-if="type === 'canceled-order'"
            class="flex justify-between my-1"
          >
            <span class="block">Nota pembatalan</span>
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
            <span class="mb-0 text-gray">Varian: {{ record.variant }}</span>
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
            <div class="flex justify-between my-1 mb-2">
              <span class="block font-medium">Sub jumlah</span>
              <span class="block">
                <app-currency :price="2100" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex justify-between my-1 mb-2">
              <span class="block font-medium">Diskaun</span>
              <span class="block discount">
                <app-currency :price="-100" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex justify-between my-1 mb-2">
              <span class="block font-medium">Kos penghantaran</span>
              <span class="block">
                <app-currency :price="10" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex justify-between my-1 mb-2">
              <span class="block font-medium">Jumlah</span>
              <span class="block font-bold">
                <app-currency :price="2010" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex justify-between my-1 mb-2">
              <span class="block font-medium">Dipre-bayar</span>
              <span class="block">
                <app-currency :price="0" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex justify-between my-1 mb-2">
              <span class="block font-medium">Bayar selepas penghantaran</span>
              <span class="block">
                <app-currency :price="2010" :currency="symbolCurrency" />
              </span>
            </div>
          </div>
        </template>
      </a-table>
      <div class="grid grid-cols-2 gap-4 mt-2">
        <div>
          <div class="flex justify-between my-1">
            <span class="block">Kaedah pembayaran</span>
            <span class="block text-gray">{{ method }}</span>
          </div>
          <div class="flex justify-between my-1">
            <span class="block">Penyedia penghantaran</span>
            <span class="block text-gray">{{ provider }}</span>
          </div>
        </div>
        <div>
          <div class="flex justify-between my-1">
            <span class="block">Nota dari pembeli</span>
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
  name: 'EmailTemplatePreviewBahasa',
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
      hiCustomerName: 'Hai <nama_penerima>,',
      receiverName: '<nama_pelanggan>',
      receiverPhone: '<telefon_pelanggan>',
      receiverEmail: '<e-mel_pelanggan>',
      receiverAddress: '<alamat_pelanggan>',
      orderInformationTitle: 'Maklumat pesanan - ID Pesanan: <ID Pesanan>',
      cancelDate: '<tarikh_pembatalan>',
      hourTimeDelivery: '<jam_masa_penghantaran>',
      failedDate: '<tarikh_gagal>',
      hourTimeOrder: '<jam_masa_pesanan>',
      cancelNote: '<nota_pembatalan>',
      provider: '<penyedia>',
      method: '<metode>',
      copyright: 'Hak cipta oleh <nama_akaun>',
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
          title: 'Nama produk',
          scopedSlots: { customRender: 'productName' },
        },
        {
          key: 'qty',
          title: 'Kuantiti',
          scopedSlots: { customRender: 'qty' },
          dataIndex: 'qty',
          className: 'col-demo-table-detail-qty',
          align: 'right',
        },
        {
          key: 'unitCost',
          title: 'Harga unit',
          scopedSlots: { customRender: 'unitCost' },
          dataIndex: 'unitCost',
          align: 'right',
        },
        {
          key: 'total',
          title: 'Jumlah',
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
            title: 'Berjaya dipesan',
            color: 'color-green',
          }
        : this.type === 'canceled-order'
        ? {
            title: 'Dibatalkan',
            color: 'color-red',
          }
        : this.type === 'delivered-order'
        ? {
            title: 'Dihantar',
            color: 'color-green',
          }
        : this.type === 'failed-order'
        ? {
            title: 'Gagal',
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
