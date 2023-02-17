<template>
  <div class="delivery-page">
    <div class="delivery-page__title">{{ $t('delivery') }}</div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <div v-else class="delivery-page__body">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
        :custom-row="handleClickRow"
      >
        <template slot="provider" slot-scope="provider">
          <div class="flex items-center img-delivery">
            <img
              class="mr-2"
              width="35px"
              height="35px"
              :src="provider.image"
              :alt="provider.name"
            />
            <span>{{ $t(provider.code) }}</span>
          </div>
        </template>
        <template slot="status" slot-scope="status">
          <app-tag
            :style="{ width: 'fit-content' }"
            :type="status === 'already' ? 'success' : 'gray'"
          >
            <span v-if="status === 'already'">{{ $t(status) }}</span>
            <a-tooltip
              v-else
              placement="bottomRight"
              overlay-class-name="custom-tooltip-light"
            >
              <template slot="title">
                {{ $t('tooltip-haven-setup-yet') }}
              </template>
              <span>{{ $t(status) }}</span>
            </a-tooltip>
          </app-tag>
        </template>
        <template slot="method" slot-scope="method">
          <app-tag :style="{ width: 'fit-content' }" type="primary">
            <span> {{ $t(method) }} </span>
          </app-tag>
        </template>
      </a-table>
    </div>
    <component
      :is="isTypeComponent"
      :is-show="isShowDrawer"
      :delivery="delivery"
      :delivery-id="deliveryId"
      :integrated-delivery="deliveryShops.length > 1"
      @reload="handleReloadDataDeliveries"
      @close="handleCloseShippingFeeSetting"
    ></component>
    <a-alert type="info" closable class="delivery-page__alert">
      <!--  v-if="deliveries.length <= 1" -->
      <div slot="description" class="delivery-page__alert--description">
        <div class="circle circle-01"></div>
        <div class="circle circle-02"></div>
        <div class="circle circle-03"></div>
        <div class="circle circle-04"></div>
        <div class="circle circle-05"></div>
        <div class="delivery-page__alert--description__icon">
          <a-icon type="bulb" theme="filled" />
        </div>
        <div
          class="delivery-page__alert--description__text"
          @click="handleOpenTipIntegrate"
        >
          {{ $t('how-to-setup-delivery-provide-rand-shipping-fee') }}
        </div>
      </div>
    </a-alert>
    <delivery-modal-guid
      :is-show="isShowDeliveryModal"
      @close="handleCloseModal"
    />
  </div>
</template>

<script>
import { get, invert } from 'lodash'
import { convertUTCToLocal } from '@/utils/moment'
import ShippingFeeSetting from '@/components/Setting/Delivery/ShippingFeeSetting'
import ShippingFeeSettingFixed from '@/components/Setting/Delivery/ShippingFeeSettingFixed'

export default {
  name: 'SettingDeliveryPage',
  fetchOnServer: false,
  components: {
    set: ShippingFeeSetting,
    setFixed: ShippingFeeSettingFixed,
  },
  asyncData({ app, redirect }) {
    const permissions = get(app, 'store.state.auth.user.permissions', []) || []
    if (!permissions.includes('setting')) {
      const defaultLocale = app.i18n.defaultLocale
      const locale = app.store.state.i18n.locale
      const url =
        locale === defaultLocale
          ? '/setting/account'
          : `/${locale}/setting/account`

      redirect(url)
    }
  },
  data() {
    return {
      deliveryShops: [],
      isShowDrawer: false,
      isShowDeliveryModal: false,
      isTypeComponent: '',
      delivery: {},
      deliveryId: null,
      columns: [
        {
          title: this.$t('delivery-provider'),
          key: 'provider',
          dataIndex: 'provider',
          scopedSlots: { customRender: 'provider' },
          width: '45%',
        },
        {
          title: this.$t('status'),
          key: 'status',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: this.$t('shipping-fee-method'),
          key: 'method',
          dataIndex: 'method',
          scopedSlots: { customRender: 'method' },
        },
        {
          title: this.$t('added-date'),
          key: 'date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' },
          align: 'right',
        },
      ],
    }
  },
  async fetch() {
    await this.fetchDeliveryShops()
  },
  computed: {
    deliveryStatus() {
      return invert(this.$store.state.deliveryStatus)
    },
    shippingFeeMethod() {
      return invert(this.$store.state.shippingFeeMethod)
    },
    // dataSource() {
    //   return this.deliveryShops.map((item) => {
    //     return {
    //       key: item.id,
    //       id: item.id,
    //       name: get(item, 'delivery_provider.data.name'),
    //       code: get(item, 'delivery_provider.data.code'),
    //       shipping_fee_method: item.shipping_fee_method,
    //       is_support_dynamic_fee: item.is_support_dynamic_fee,
    //       is_default: item.is_default,
    //       is_support_cod: item.is_support_cod,
    //       shipping_fee_config: {
    //         condition_type:
    //           get(item, 'shipping_fee_config.condition_type', null) || null,
    //         shipping_fee: get(item, 'shipping_fee_config.shipping_fee'),
    //         condition_value:
    //           get(item, 'shipping_fee_config.condition_value', []) || [],
    //       },
    //       delivery_provider: item.delivery_provider,
    //       config_status: item.config_status,
    //       delivery_provider_id: item.delivery_provider_id,
    //       store_id: item.store_id,
    //       provider: get(item, 'delivery_provider.data', {}) || {},
    //       status: this.deliveryStatus[item.config_status],
    //       method: this.shippingFeeMethod[item.shipping_fee_method],
    //       date: item.created_at
    //         ? convertUTCToLocal(item.created_at, 'HH:mm DD/MM/YYYY')
    //         : '--',
    //     }
    //   })
    // },
    dataSource() {
      const results = []
      this.deliveryShops.forEach((item) => {
        if (item?.delivery_provider?.data?.code !== 'ghn') {
          results.push({
            key: item.id,
            id: item.id,
            name: get(item, 'delivery_provider.data.name'),
            code: get(item, 'delivery_provider.data.code'),
            shipping_fee_method: item.shipping_fee_method,
            is_support_dynamic_fee: item.is_support_dynamic_fee,
            is_default: item.is_default,
            is_support_cod: item.is_support_cod,
            shipping_fee_config: {
              condition_type:
                get(item, 'shipping_fee_config.condition_type', null) || null,
              shipping_fee: get(item, 'shipping_fee_config.shipping_fee'),
              condition_value:
                get(item, 'shipping_fee_config.condition_value', []) || [],
            },
            delivery_provider: item.delivery_provider,
            config_status: item.config_status,
            delivery_provider_id: item.delivery_provider_id,
            store_id: item.store_id,
            provider: get(item, 'delivery_provider.data', {}) || {},
            status: this.deliveryStatus[item.config_status],
            method: this.shippingFeeMethod[item.shipping_fee_method],
            date: item.created_at
              ? convertUTCToLocal(item.created_at, 'HH:mm DD/MM/YYYY')
              : '--',
          })
        }
      })
      return results
    },
  },
  methods: {
    async fetchDeliveryShops() {
      try {
        const params = {
          include: 'delivery_provider',
        }
        const { data } = await this.$api.delivery.getDeliveryShops(params)
        if (data) {
          this.deliveryShops = data
        }
      } catch (e) {}
    },
    handleClickRow(record) {
      return {
        style: {
          cursor: 'pointer',
        },
        on: {
          click: () => {
            this.handleOpenShippingFeeSetting(record)
          }, // click row
        },
      }
    },
    handleCloseShippingFeeSetting() {
      this.isShowDrawer = false
      this.isTypeComponent = ''
    },
    handleOpenShippingFeeSetting(delivery) {
      this.isShowDrawer = true
      this.delivery = { ...delivery }
      if (delivery.is_support_dynamic_fee === 0) {
        this.isTypeComponent = 'setFixed'
      } else {
        this.isTypeComponent = 'set'
      }
    },
    handleReloadDataDeliveries() {
      this.fetchDeliveryShops()
    },
    handleOpenTipIntegrate() {
      this.isShowDeliveryModal = true
    },
    handleCloseModal() {
      this.isShowDeliveryModal = false
    },
  },
}
</script>

<style lang="less" scoped>
.delivery-page {
  padding: @padding-40 @padding-24;
  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }

  &__body {
    margin-top: 1rem;
    /deep/.ant-table-row {
      height: @height-table;
    }
    .img-delivery {
      @apply overflow-hidden;
      img {
        @apply rounded-md;
      }
    }
    /deep/table {
      thead {
        tr {
          height: @height-table;
          th {
            font-size: @size-14 !important;
            color: @color-table;
          }
        }
      }
      tbody {
        tr {
          height: @height-table;
          th {
            font-size: @size-14 !important;
            color: @color-table;
            padding-inline: @padding-8 !important;
          }
        }
      }
    }
  }
  &__alert {
    background: #ffc54d;
    bottom: 0;
    right: 0;
    max-width: 49rem;
    border-radius: 1.25rem;
    border-color: transparent;
    padding: @padding-16 40px;
    margin: 20px;
    @apply absolute bg-center bg-cover bg-no-repeat font-medium text-center;
    &--description {
      position: relative;
      @apply flex;
      &__icon {
        border-radius: 1.5rem;
        background: #f5a909;
        width: 2rem;
        height: 2rem;
        padding: 0.15rem 0;
        margin-right: 1rem;
        z-index: 4;
        @apply flex-none;
      }
      &__text {
        padding: 0.15rem 0;
        cursor: pointer;
        color: white;
        font-size: @size-16;
        @apply flex-auto;
      }
      .circle {
        position: absolute;
        border: 1.14732px solid rgba(255, 255, 255, 0.45);
        border-radius: 50%;
      }
      .circle-01 {
        width: 6.875rem;
        height: 6.875rem;
        left: -4.875rem;
        top: 0.5rem;
      }
      .circle-02 {
        width: 9.75rem;
        height: 9.75rem;
        left: -6.5rem;
        top: -0.5rem;
      }
      .circle-03 {
        width: 6.17rem;
        height: 6.17rem;
        right: -45%;
        top: 0.875rem;
      }
      .circle-04 {
        width: 9.035rem;
        height: 9.035rem;
        right: -43%;
        top: -0.25rem;
      }
      .circle-05 {
        width: 16.0625rem;
        height: 16.134rem;
        right: -63%;
        top: -2.5rem;
      }
    }
    /deep/.anticon-bulb {
      color: white;
      font-size: 1.125rem;
      vertical-align: baseline;
    }
  }
}
</style>
