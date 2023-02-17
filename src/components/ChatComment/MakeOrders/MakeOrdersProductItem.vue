<template>
  <div class="product-item">
    <div class="product-item__left">
      <div class="product-item__left__img">
        <img
          v-if="productSku.product_sku_image.url.length"
          :src="productSku.product_sku_image.url"
          :alt="product.name"
          @click="handleOpenProductDetail"
        />
        <img
          v-else
          src="@/assets/images/Icon/No-Image.png"
          :alt="product.name"
          @click="handleOpenProductDetail"
        />
      </div>
      <div class="product-item__left__info">
        <a-tooltip>
          <template slot="title">
            {{ product.name }}
          </template>
          <span class="name" @click="handleOpenProductDetail">
            {{ product.name }}
          </span>
        </a-tooltip>
        <div class="price">
          <app-currency :price="productSku.price" :currency="symbolCurrency" />
        </div>
        <div class="stock">
          <div class="stock__archive">
            <a-dropdown v-if="isFilterAllBranches" placement="bottomLeft">
              <icon-archive />
              <a-menu slot="overlay" style="width: fit-content">
                <a-menu-item
                  v-for="item in productSku.product_sku_detail_branch.data"
                  :key="item.branch_id"
                  class="branch-item"
                >
                  <span class="mr-2">{{ item.branch.name }}</span>
                  <span class="text-right">{{ item.stock }}</span>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
            <icon-archive v-else />
          </div>
          <span class="stock__number">{{ productStock }}</span>
        </div>
      </div>
    </div>
    <div class="product-item__right">
      <span v-if="!product.is_active" class="product-item__right__stop-selling">
        {{ $t('stop-selling') }}
      </span>
      <div
        v-else-if="!isChoosingThisProduct"
        class="product-item__right__add-to-cart"
      >
        <a-icon
          type="plus-circle"
          theme="filled"
          class="btn-add-to-cart"
          :class="{ disabled: productStock === 0 || !productSku.sku.length }"
          @click="addToCart"
        />
      </div>
      <div
        v-else-if="isChoosingThisProduct && product.is_active"
        class="product-item__right__action"
      >
        <a-button type="secondary" class="btn-minus" @click="decreaseQuantity">
          <a-icon type="minus-circle" />
        </a-button>
        <span class="quantity">
          <a-input-number
            ref="inputQuantity"
            v-model="quantity"
            :min="0"
            :max="maxStockProduct"
            class="input-quantity"
            :default-value="1"
            @pressEnter="$refs.inputQuantity.blur()"
            @blur="() => handleChangeQuantity()"
          />
        </span>
        <a-button
          type="secondary"
          class="btn-plus"
          :class="{
            disabled:
              productStock === 0 ||
              quantity === maxStockProduct ||
              !productSku.sku.length,
          }"
          @click="increaseQuantity"
        >
          <a-icon type="plus-circle" theme="filled" />
        </a-button>
      </div>
      <div class="product-item__right__barcode">
        <a-tooltip overlay-class-name="custom-tooltip-light" placement="bottom">
          <template slot="title">{{ productSku.sku }} </template>
          <span class="barcode">{{ productSku.sku }}</span>
        </a-tooltip>
        <a-icon class="icon-barcode" type="barcode" />
      </div>
    </div>
  </div>
</template>
<script>
import event from '@/utils/event'
export default {
  name: 'MakeOrdersProductItem',
  props: {
    product: {
      type: Object,
      default: () => {},
    },
    productSku: {
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
      isChoosingThisProduct: false,
      quantity: 0,
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
    productStock() {
      return this.selectedBranch === 0
        ? this.productSku.product_sku_detail_branch.data.reduce(
            (previousValue, currentBranch) =>
              previousValue + currentBranch.stock,
            0
          )
        : this.productSku.product_sku_detail_branch.data.find(
            (branch) => branch.branch_id === this.selectedBranch
          )?.stock
        ? this.productSku.product_sku_detail_branch.data.find(
            (branch) => branch.branch_id === this.selectedBranch
          ).stock
        : 0
    },
    maxStockProduct() {
      return Math.max(
        ...this.productSku.product_sku_detail_branch.data.map(
          (branch) => branch.stock
        )
      )
    },
  },
  watch: {
    cart: {
      deep: true,
      handler() {
        const indexItemIsExist = this.cart.findIndex(
          (item) => item.id === this.productSku.id
        )
        if (this.cart[indexItemIsExist]) {
          this.quantity = this.cart[indexItemIsExist].quantity
          this.isChoosingThisProduct = this.quantity > 0
          return
        }
        this.isChoosingThisProduct = false
      },
    },
  },
  created() {
    const indexItemIsExist = this.cart.findIndex(
      (item) => item.id === this.productSku.id
    )
    if (this.cart[indexItemIsExist]) {
      this.quantity = this.cart[indexItemIsExist].quantity
    }
    if (this.quantity > 0) this.isChoosingThisProduct = true
    if (
      this.isFilterAllBranches &&
      this.product.is_active &&
      this.quantity > 0
    ) {
      const availableBranchesInOneProduct =
        this.productSku.product_sku_detail_branch.data.filter(
          (branch) => branch.stock >= this.quantity
        )
      event.$emit('updateProductAvailableBranches', {
        ...this.productSku,
        product_sku_detail_branch: {
          data: [...availableBranchesInOneProduct],
        },
      })
    }
  },
  methods: {
    handleChangeQuantity() {
      if (this.quantity < 1) this.isChoosingThisProduct = false
      if (this.quantity > this.maxStockProduct)
        this.quantity = this.maxStockProduct
      const availableBranchesInOneProduct =
        this.productSku.product_sku_detail_branch.data.filter(
          (branch) => branch.stock >= this.quantity
        )
      if (this.isFilterAllBranches && this.product.is_active) {
        event.$emit('updateProductAvailableBranches', {
          ...this.productSku,
          product_sku_detail_branch: {
            data: [...availableBranchesInOneProduct],
          },
        })
      }
      event.$emit(
        'addToCart',
        {
          name: this.product.name,
          is_active: this.product.is_active,
          ...this.productSku,
        },
        this.quantity
      )
    },
    increaseQuantity() {
      if (
        this.productStock === 0 ||
        this.quantity === this.maxStockProduct ||
        !this.productSku.sku.length
      )
        return
      this.quantity++
      this.handleChangeQuantity()
    },
    decreaseQuantity() {
      this.quantity--
      this.handleChangeQuantity()
    },
    addToCart() {
      if (
        this.productStock === 0 ||
        !this.product.is_active ||
        !this.productSku.sku.length
      )
        return
      this.quantity = 1
      this.isChoosingThisProduct = true
      const availableBranchesInOneProduct =
        this.productSku.product_sku_detail_branch.data.filter(
          (branch) => branch.stock >= this.quantity
        )
      if (this.isFilterAllBranches && this.product.is_active) {
        event.$emit('updateProductAvailableBranches', {
          ...this.productSku,
          product_sku_detail_branch: {
            data: [...availableBranchesInOneProduct],
          },
        })
      }
      event.$emit(
        'addToCart',
        {
          name: this.product.name,
          is_active: this.product.is_active,
          ...this.productSku,
        },
        this.quantity
      )
    },
    handleOpenProductDetail() {
      this.$emit('handleOpenProductDetail', {
        ...this.productSku,
        ...this.product,
      })
    },
  },
}
</script>
<style lang="less" scoped>
.product-item {
  border-color: @gray-4;
  padding: @padding-16;
  @apply flex items-end justify-between border-b;
  &__left {
    @apply w-4/6 flex;
    &__img {
      width: 6rem;
      height: 6rem;
      background-color: @gray-6;
      flex-shrink: 0;
      @apply mr-2 rounded-md overflow-hidden cursor-pointer;
      img {
        @apply w-full h-full object-contain;
      }
    }
    &__info {
      margin-left: @margin-12;
      @apply flex flex-col truncate;
      .name {
        font-size: @font-size-base;
        color: @black;
        @apply font-normal truncate cursor-pointer;
        &:hover {
          color: @primary;
        }
      }
      .price {
        font-size: @size-14;
        color: @black;
        margin-block: 0.1rem;
        @apply font-semibold;
      }
      .stock {
        @apply flex items-center;
        &__archive {
          @apply mr-2 cursor-pointer;
        }
        &__number {
          color: @grey;
        }
      }
    }
  }
  &__right {
    @apply w-2/6 text-right;
    &__action {
      @apply flex items-center justify-end mb-2;
      .quantity {
        color: @black;
        font-size: @size-20;
        @apply mx-2;
        /deep/.input-quantity {
          width: 3rem;
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
        font-size: @size-20;
        &.anticon-plus-circle {
          color: @primary;
        }
      }
    }
    &__add-to-cart {
      height: @size-32;
      @apply flex justify-end items-center mb-2;
      .anticon {
        font-size: @size-20;
        &.anticon-plus-circle {
          color: @primary;
          &.disabled {
            color: @gray-5;
            cursor: not-allowed;
          }
        }
      }
    }
    &__stop-selling {
      color: @gray-3;
      font-size: @size-12;
    }
    &__barcode {
      @apply flex items-center justify-end truncate;
      .barcode {
        font-size: @size-14;
        letter-spacing: -0.5px;
        @apply mr-2 truncate;
      }
    }
  }
}
/deep/.branch-item {
  @apply flex justify-between items-center;
  span {
    color: @black;
    @apply font-medium;
  }
}
</style>
