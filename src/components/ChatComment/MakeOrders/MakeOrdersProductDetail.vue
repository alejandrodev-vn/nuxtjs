<template>
  <a-drawer
    placement="right"
    destroy-on-close
    get-container=".make-orders"
    width="100%"
    wrap-class-name="product-detail"
    :class="{ visible }"
    :wrap-style="{ position: 'absolute', width: '100%' }"
    :mask="false"
    :closable="false"
    :visible="visible"
    @close="handleCloseProductDetail"
  >
    <template slot="title">
      <div class="product-detail__head">
        <a-icon type="arrow-left" @click="handleCloseProductDetail" />
        <h5 class="product-detail__head__title">{{ $t('productDetail') }}</h5>
        <span></span>
      </div>
    </template>
    <perfect-scrollbar
      :options="{ suppressScrollX: true }"
      class="product-detail__body"
    >
      <div class="info-item">
        <span class="title-left">{{ $t('product-name') }}</span>
        <span class="text-right">{{ product.name }}</span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('barcode') }}</span>
        <span class="text-right">
          {{ product.sku.length ? product.sku : '--' }}
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('product-price') }}</span>
        <span class="text-right">
          <app-currency :price="product.price" :currency="symbolCurrency" />
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('product-cost') }}</span>
        <div class="text-right">
          <app-currency :price="product.cost" :currency="symbolCurrency" />
        </div>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('stock') }}</span>
        <span class="text-right">{{ stockAbout }}</span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('product-category') }}</span>
        <span class="text-right">
          {{ productCategory }}
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('variant') }}</span>
        <span class="text-right">{{ variant }}</span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('description') }}</span>
        <span
          class="text-right"
          v-html="product.content.length ? product.content : '--'"
        >
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('branch') }}</span>
        <a-dropdown v-if="isFilterAllBranches" placement="bottomLeft">
          <span class="text-right">
            {{ product.product_sku_detail_branch.data.length }}
          </span>
          <a-menu slot="overlay" style="width: fit-content">
            <a-menu-item
              v-for="item in product.product_sku_detail_branch.data"
              :key="item.branch_id"
              class="branch-item"
            >
              <div class="flex items-center justify-between">
                <span class="mr-2">{{ item.branch.name }}</span>
                <span class="text-right">{{ item.stock }}</span>
              </div>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
        <span v-else class="text-right">
          {{ branchName }}
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('brand') }}</span>
        <span class="text-right">
          {{ product.brand_name ? product.brand_name : $t('no-brand') }}
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('unit') }}</span>
        <span class="text-right">{{ product.unit ? product.unit : '--' }}</span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('image') }}</span>
        <span
          v-if="!product.product_images || !product.product_images.data.length"
          class="text-right"
        >
          --
        </span>
      </div>
      <div class="product-img">
        <img
          v-for="imgSrc in product.product_images.data"
          :key="imgSrc.id"
          class="product-img__item"
          :src="imgSrc.url"
          :alt="product.name"
        />
      </div>
      <div class="product-qty">
        <span v-if="product.is_active" class="product-qty__title">
          {{ $t('product-qty') }}
        </span>
        <p v-if="!product.is_active">{{ $t('stop-selling') }}</p>
        <div v-else class="flex items-center">
          <a-button
            type="secondary"
            class="btn-minus"
            :class="{
              disabled: quantity <= 1,
            }"
            @click="decreaseQuantity"
          >
            <a-icon type="minus-circle" />
          </a-button>
          <span class="quantity">
            <a-input-number
              ref="inputQuantity"
              v-model="quantity"
              :min="1"
              :max="productStock ? stockLeft : 0"
              class="input-quantity"
              :disabled="!product.sku.length"
              @pressEnter="$refs.inputQuantity.blur()"
              @change="handleChangeQuantity"
            />
          </span>
          <a-button
            type="secondary"
            class="btn-plus"
            :class="{
              disabled:
                stockLeft === 0 ||
                quantity >= stockLeft ||
                !product.is_active ||
                !productStock ||
                !product.sku.length,
            }"
            @click="increaseQuantity"
          >
            <a-icon type="plus-circle" theme="filled" />
          </a-button>
        </div>
        <a-button
          type="primary"
          class="btn-add-to-cart"
          :class="{
            disabled:
              stockLeft === 0 ||
              quantity > stockLeft ||
              !product.is_active ||
              !productStock ||
              !product.sku.length,
          }"
          @click="addToCart"
        >
          {{ $t('add-to-cart') }}
        </a-button>
      </div>
    </perfect-scrollbar>
  </a-drawer>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import event from '@/utils/event'
Vue.use(notification)

export default {
  name: 'MakeOrdersProductDetail',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    product: {
      type: Object,
      default: () => {},
    },
    cart: {
      type: Array,
      default: () => [],
    },
    isFilterAllBranches: {
      type: Boolean,
      default: true,
    },
    selectedBranch: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      quantity: 1,
    }
  },
  computed: {
    symbolCurrency() {
      return `${
        this.product.currency
          ? this.product.currency
          : this.$store.state.configCurrency.vi.symbol
      } `
    },
    quantityAddedInCart() {
      const indexItemIsExist = this.cart.findIndex(
        (item) => item.id === this.product.id
      )
      return this.cart[indexItemIsExist]
        ? this.cart[indexItemIsExist].quantity
        : 0
    },
    productStock() {
      return this.selectedBranch === 0
        ? this.product.product_sku_detail_branch.data.reduce(
            (previousValue, currentBranch) =>
              previousValue + currentBranch.stock,
            0
          )
        : this.product.product_sku_detail_branch.data.find(
            (branch) => branch.branch_id === this.selectedBranch
          )?.stock
    },
    stockAbout() {
      if (!this.selectedBranch) {
        const listStockAllBranch =
          this.product.product_sku_detail_branch.data.map(
            (branch) => branch.stock
          )
        const minValue = Math.min(...listStockAllBranch)
        const maxValue = Math.max(...listStockAllBranch)
        return `${minValue} - ${maxValue}`
      } else {
        const productStockInCurrentBranch =
          this.product.product_sku_detail_branch.data.find(
            (branch) => branch.branch_id === this.selectedBranch
          )
        return productStockInCurrentBranch
          ? productStockInCurrentBranch.stock
          : 0
      }
    },
    maxStockProduct() {
      return Math.max(
        ...this.product.product_sku_detail_branch.data.map(
          (branch) => branch.stock
        )
      )
    },
    stockLeft() {
      return this.productStock - this.quantityAddedInCart
    },
    branchName() {
      return this.product.product_sku_detail_branch.data.find(
        (branch) => branch.branch_id === this.selectedBranch
      )?.name
    },
    productCategory() {
      if (this.product.category && this.product.category.data.name_en)
        return this.product.category.data.name_en
      if (this.product.category && this.product.category.data.name_vn)
        return this.product.category.data.name_vn
      return '--'
    },
    variant() {
      return this.product.variants?.data?.length
        ? this.product.variants.data[0].value.data.name
        : '--'
    },
  },
  methods: {
    handleCloseProductDetail() {
      this.$emit('handleCloseProductDetail')
    },
    handleChangeQuantity() {
      if (this.quantity && this.quantity > this.stockLeft) {
        this.quantity = this.stockLeft
        return
      }
      if (!this.quantity) {
        this.quantity = 1
      }
    },
    increaseQuantity() {
      if (
        this.stockLeft === 0 ||
        this.quantity >= this.stockLeft ||
        !this.product.is_active ||
        !this.productStock ||
        !this.product.sku.length
      )
        return
      this.quantity++
      this.handleChangeQuantity()
    },
    decreaseQuantity() {
      if (this.quantity <= 1) return
      this.quantity--
      this.handleChangeQuantity()
    },
    addToCart() {
      if (
        this.stockLeft === 0 ||
        !this.product.is_active ||
        this.quantity > this.stockLeft ||
        !this.productStock ||
        !this.product.sku.length
      )
        return
      if (this.isFilterAllBranches && this.product.is_active) {
        const availableBranchesInOneProduct =
          this.product.product_sku_detail_branch.data.filter(
            (branch) => branch.stock >= this.quantity + this.quantityAddedInCart
          )
        event.$emit('updateProductAvailableBranches', {
          ...this.product,
          product_sku_detail_branch: {
            data: [...availableBranchesInOneProduct],
          },
        })
      }
      event.$emit(
        'addToCart',
        this.product,
        this.quantity + this.quantityAddedInCart
      )
      notification.success({
        message: `${this.product.name} ${this.$t(
          'has-successfully-added-to-your-cart'
        )}!`,
        class: 'notification-success',
      })
    },
  },
}
</script>
<style lang="less" scoped>
.product-detail {
  @apply hidden;
  &.visible {
    @apply block;
  }
  /deep/.ant-drawer-content-wrapper {
    width: 100% !important;
    box-shadow: none;
    .ant-drawer-header {
      padding: @padding-24;
    }
    .ant-drawer-wrapper-body {
      @apply flex flex-col;
    }
    .ant-drawer-body {
      overflow: hidden;
      @apply flex-1 p-0;
    }
  }

  &__head {
    @apply flex items-center justify-between;
    .anticon-arrow-left {
      font-size: @size-16;
    }
    &__title {
      font-size: @size-20;
      line-height: 1.5;
      @apply m-0 font-semibold;
    }
  }
  &__body {
    @apply relative p-8 flex-1 w-full max-h-full;
    .info-item {
      margin-bottom: @margin-24;
      @apply w-full flex items-start;
      .title-left {
        color: @black;
        width: 35%;
        font-size: @size-16;
        @apply block mr-6;
      }
      .text-right {
        color: @grey;
        font-size: @size-16;
        width: 65%;
        @apply block text-left;
      }
    }
    .product-img {
      @apply w-full flex items-center justify-center flex-wrap;
      &__item {
        width: 30%;
        @apply object-cover rounded-md mb-2 mr-2;
      }
    }
    .product-qty {
      @apply flex flex-col items-center mt-4;
      &__title {
        color: @black;
        @apply font-medium;
      }
      .quantity {
        color: @black;
        font-size: @size-2;
        @apply mx-2;
        /deep/.input-quantity {
          max-width: 70px;
          border: 0;
          box-shadow: 0;
          color: @black;
          @apply p-0 font-medium text-center;
          .ant-input-number-input {
            @apply p-0 text-center;
          }
          .ant-input-number-handler-wrap {
            @apply hidden;
          }
        }
      }
      .btn-minus,
      .btn-plus {
        width: unset;
        height: unset;
        box-shadow: none;
        outline: none;
        border: none;
        background-color: unset;
        @apply p-0;
        &.disabled {
          cursor: not-allowed;
          .anticon-plus-circle {
            color: @gray-5;
          }
        }
      }
      .anticon {
        font-size: @size-2;
        &.anticon-plus-circle {
          color: @primary;
          &.disabled {
            color: @gray-5;
            cursor: not-allowed;
          }
        }
      }
      .text-error {
        color: @red;
      }
      .btn-add-to-cart {
        height: @height-field;
        background-color: @primary !important;
        @apply mt-4 w-full;
        &.disabled {
          background-color: #f5f5f5 !important;
        }
      }
    }
    /deep/.ps__rail-y {
      left: unset !important;
      right: 0 !important;
    }
  }
}
</style>
