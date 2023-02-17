<template>
  <div class="make-orders">
    <h5 class="make-orders__title p-section">{{ $t('makeOrder') }}(1/2)</h5>
    <div class="make-orders__filters p-section">
      <a-row :gutter="12">
        <make-orders-filter-categories
          :selected-category="selectedCategory"
          @changeCategory="handleChangeCategory"
        />
        <make-orders-filter-branches
          :selected-branch="selectedBranch"
          :branches="branches"
          :is-loading="$fetchState.pending"
          @handleClickBranch="handleClickBranch"
        />
      </a-row>
      <a-input
        v-model="searchName"
        show-search
        allow-clear
        :placeholder="`${$t('searchProductName')}`"
        class="custom-search"
      >
        <a-icon slot="prefix" type="search" />
      </a-input>
    </div>
    <div class="scroll-product-list" @scroll="handleScrollProductsList">
      <app-loading v-if="isLoading" />
      <app-no-data v-else-if="!products.length" :text="$t('noDataFound')" />
      <make-orders-product-list
        v-else
        :products="products"
        :cart="cart"
        :is-filter-all-branches="isFilterAllBranches"
        :selected-branch="selectedBranch"
        @handleOpenProductDetail="handleOpenProductDetail"
      />
      <app-loading v-if="isLoadingMoreProducts" />
    </div>
    <make-orders-enough-products
      v-if="isFilterAllBranches && cart.length"
      :branches-enough="branchesEnough"
      :all-branches="branches.length"
    />
    <make-orders-confirm-change-branch
      :visible="isVisibleConfirmChangeBranch"
      :branch="keyBranch"
      @confirmChangeBranch="confirmChangeBranch"
      @closeConfirmChangeBranch="closeConfirmChangeBranch"
    />
    <make-orders-select-branch
      :visible="isVisibleSelectBranch"
      :branches="availableBranches"
      :total-number-branch="branches.length"
      @handleOpenCheckout="handleOpenCheckout"
      @closeSelectBranch="handleCloseSelectBranch"
    />
    <make-orders-footer
      :cart="cart"
      :total-quantity="totalQuantity"
      :sub-total="subTotal"
      :branches-enough="branchesEnough"
      :can-make-order="canMakeOrder"
      :is-filter-all-branches="isFilterAllBranches"
      @onClickCheckout="onClickCheckout"
    />
    <keep-alive>
      <make-orders-checkout
        v-if="isShowCheckout"
        :visible="isShowCheckout"
        :sub-total="subTotal"
        :can-make-order="canMakeOrder"
        :products="detailSubTotal"
        :branch="branch"
        @handleCloseCheckout="handleCloseCheckout"
        @handleOpenProductDetail="handleOpenProductDetail"
        @resetCart="resetCart"
      />
    </keep-alive>

    <make-orders-product-detail
      v-if="isShowProductDetail"
      :visible="isShowProductDetail"
      :product="productDetail"
      :cart="cart"
      :is-filter-all-branches="isFilterAllBranches"
      :selected-branch="selectedBranch"
      @handleCloseProductDetail="handleCloseProductDetail"
    />
  </div>
</template>
<script>
import { intersectionBy, debounce } from 'lodash'
import event from '@/utils/event'

export default {
  name: 'MakeOrders',
  fetchOnServer: false,
  data() {
    return {
      isShowCheckout: false,
      isShowProductDetail: false,
      isVisibleConfirmChangeBranch: false,
      isVisibleSelectBranch: false,
      isLoading: false,
      isLoadingMoreProducts: false,
      selectedCategory: -1,
      selectedBranch: 0,
      keyBranch: 0,
      cart: [],
      subTotal: 0,
      detailSubTotal: [],
      orders: {},
      products: [],
      branches: [],
      availableBranches: [],
      productDetail: null,
      getCartFromStorage: null,
      branch: {},
      page: 1,
      limit: this.$store.state.limit,
      totalPage: 0,
      productsAddedToCart: [],
      searchName: '',
    }
  },
  async fetch() {
    await Promise.all([this.fetchProductsList(), this.fetchBranchesList()])
  },
  computed: {
    guestId() {
      return this.$route.params.guest
    },
    infoFan() {
      return this.$store.state.currentInfoFan
    },
    isFilterAllBranches() {
      return this.selectedBranch === 0
    },
    branchesEnough() {
      return this.availableBranches.length
    },
    noMoreResultsProduct() {
      return !this.isLoadingMoreProducts && this.page >= this.totalPage
    },
    totalQuantity() {
      return !this.cart.length
        ? 0
        : this.cart.reduce(
            (previousValue, currentProduct) =>
              currentProduct.is_active
                ? previousValue + currentProduct.quantity
                : previousValue,
            0
          )
    },
    canMakeOrder() {
      return (
        !this.infoFan?.locked_by ||
        this.infoFan?.locked_by?.id === this.$auth.user.id
      )
    },
    productDetailId() {
      return this.$route.query.product_id
    },
    isFilterAllCategories() {
      return this.selectedCategory === -1
    },
  },

  watch: {
    guestId() {
      if (
        this.getCartFromStorage?.cart?.length &&
        this.getCartFromStorage?.fanId === this.guestId
      ) {
        this.cart = [...this.getCartFromStorage.cart]
      }
      this.selectedBranch = this.getCartFromStorage?.branchId || 0
      this.selectedCategory = this.getCartFromStorage?.categoryId || -1
    },
    searchName() {
      this.handleSearchByName()
    },
    cart() {
      this.getCartFromStorage = JSON.parse(localStorage.getItem('cart'))
    },
    async productDetailId() {
      if (
        (this.productDetailId?.length && !this.productDetail) ||
        this.productDetail?.id + '' !== this.productDetailId
      ) {
        await this.fetchProductSkuDetail()
        if (!this.productDetail) return
        this.isShowProductDetail = true
      }
    },
  },
  created() {
    if (process.browser) {
      this.getCartFromStorage = JSON.parse(localStorage.getItem('cart'))
    }
    this.selectedBranch = this.getCartFromStorage?.branchId || 0
    this.selectedCategory = this.getCartFromStorage?.categoryId || -1
    if (
      this.getCartFromStorage?.cart?.length &&
      this.getCartFromStorage?.fanId === this.guestId
    ) {
      this.cart = [
        ...this.getCartFromStorage.cart.filter((product) => product.is_active),
      ]
      this.calculateTotal()
    }
  },
  async mounted() {
    if (
      (this.productDetailId?.length && !this.productDetail) ||
      this.productDetail?.id + '' !== this.productDetailId
    ) {
      await this.fetchProductSkuDetail()
      if (this.productDetail) {
        this.isShowProductDetail = true
      }
    }
    event.$on('addToCart', (product, quantity) => {
      this.addToCart(product, quantity)
    })
    event.$on('updateProductAvailableBranches', (productAndBranches) => {
      const findProductIsExist = this.productsAddedToCart.findIndex(
        (product) => product.id === productAndBranches.id
      )
      if (findProductIsExist !== -1) {
        this.productsAddedToCart[findProductIsExist] = {
          ...productAndBranches,
        }
      } else {
        this.productsAddedToCart.push({ ...productAndBranches })
      }
      this.cart.length === 0
        ? (this.availableBranches =
            productAndBranches.product_sku_detail_branch.data.map(
              (branch) => branch
            ))
        : (this.availableBranches = intersectionBy(
            ...this.productsAddedToCart.map(
              (productSku) => productSku.product_sku_detail_branch.data
            ),
            'branch_id'
          ))
    })
  },
  destroyed() {
    const query = {
      ...this.$route.query,
    }
    if (query.product_id) {
      delete query.product_id
    }
    this.$router.push({ query })
  },
  methods: {
    async fetchProductsList() {
      try {
        this.isLoading = true
        const params = {
          page: this.page,
          limit: this.limit,
          ...(!this.isFilterAllCategories && {
            'filter[platform_category_id]': this.selectedCategory,
          }),
          ...(this.searchName.length && {
            'search[0][field]': 'name',
            'search[0][value]': this.searchName,
          }),
          include: 'product_skus,currency,category',
          sort: 'name',
        }
        const { data, meta } = await this.$api.product.getProductsList(params)
        if (data) {
          this.products = [...data]
          this.totalPage = meta.pagination.total_pages
        }
      } catch (error) {
      } finally {
        this.isLoading = false
      }
    },
    async fetchMoreProducts() {
      try {
        this.isLoadingMoreProducts = true
        const params = {
          page: this.page,
          limit: this.limit,
          ...(!this.isFilterAllCategories && {
            'filter[platform_category_id]': this.selectedCategory,
          }),
          ...(this.searchName.length && {
            'search[0][field]': 'name',
            'search[0][value]': this.searchName,
          }),
          include: 'product_skus,currency,category',
          sort: 'name',
        }
        const { data, meta } = await this.$api.product.getProductsList(params)
        if (data) {
          this.products = [...this.products, ...data]
          this.totalPage = meta.pagination.total_pages
        }
      } catch (error) {
      } finally {
        this.isLoadingMoreProducts = false
      }
    },
    async fetchProductSkuDetail() {
      try {
        if (!this.productDetailId?.length) return
        const { data } = await this.$api.product.getProductDetail(
          this.productDetailId
        )
        if (data) {
          this.productDetail = { ...data.product_skus.data[0], ...data }
        }
      } catch (error) {}
    },
    async fetchBranchesList() {
      try {
        const params = {
          pagination: false,
        }
        const { data } = await this.$api.branch.getBranchesList(params)
        if (data) {
          this.branches = Object.freeze(
            [...data].map((item) => {
              return { ...item, branch: item, branch_id: item.id }
            })
          )
          this.availableBranches = [...this.branches]
          if (!this.selectedBranch) return
          const findBranch = this.branches.find(
            (branch) => branch.id === this.selectedBranch
          )
          if (!this.branches.length || !findBranch) {
            this.selectedBranch = 0
            this.resetCart()
          }
        }
      } catch (error) {}
    },
    calculateTotal() {
      if (this.cart.length === 0) return (this.subTotal = 0)
      const detailSubTotal = this.cart.map((product) => {
        return {
          ...product,
          subTotal: product.is_active ? product.price * product.quantity : 0,
        }
      })
      const subTotal = detailSubTotal.reduce(
        (previousValue, currentProduct) =>
          currentProduct.is_active
            ? previousValue + currentProduct.subTotal
            : previousValue,
        0
      )
      this.subTotal = subTotal
      this.detailSubTotal = detailSubTotal
    },
    addToCart(product, quantity) {
      if (this.getCartFromStorage?.fanId !== this.guestId) {
        this.cart.length = 0
        localStorage.removeItem('cart')
      }
      const indexItemIsExist = this.cart.findIndex(
        (item) => item.id === product.id
      )
      if (this.cart[indexItemIsExist]) {
        this.cart[indexItemIsExist].quantity = quantity
        if (quantity === 0 || !quantity) {
          this.cart.splice(indexItemIsExist, 1)
        }
      } else {
        this.cart.push({ ...product, quantity })
      }
      const cart = {
        cart: [...this.cart],
        fanId: this.guestId,
        branchId: this.selectedBranch,
        categoryId: this.selectedCategory,
      }
      localStorage.setItem('cart', JSON.stringify(cart))
      this.calculateTotal()
      this.orders.products = [...this.detailSubTotal]
    },
    resetCart() {
      this.cart = []
      this.detailSubTotal = []
      this.subTotal = 0
      this.productsAddedToCart = []
      this.availableBranches = [...this.branches]
      const cart = {
        cart: [],
        fanId: this.guestId,
        branchId: this.selectedBranch,
        categoryId: this.selectedCategory,
      }
      localStorage.setItem('cart', JSON.stringify(cart))
      this.page = 1
      this.totalPage = 0
      this.fetchProductsList()
    },
    handleChangeCategory(value) {
      this.selectedCategory = value
      const cart = {
        cart: [...this.cart],
        fanId: this.guestId,
        branchId: this.selectedBranch,
        categoryId: value,
      }
      localStorage.setItem('cart', JSON.stringify(cart))
      this.page = 1
      this.totalPage = 0
      this.fetchProductsList()
    },
    handleOpenCheckout(selectedBranch) {
      this.branch = this.branches.find((branch) => branch.id === selectedBranch)
      this.isShowCheckout = true
      this.isVisibleSelectBranch = false
    },
    onClickCheckout() {
      if (!this.selectedBranch) {
        this.isVisibleSelectBranch = true
        return
      }
      this.handleOpenCheckout(this.selectedBranch)
    },
    handleCloseCheckout() {
      this.isShowCheckout = false
    },
    handleOpenProductDetail(product) {
      this.productDetail = { ...product }
      if (!this.productDetail) return
      const query = {
        ...this.$route.query,
        product_id: this.productDetail.id,
      }
      this.$router.push({ query })
      this.isShowProductDetail = true
    },
    handleCloseProductDetail() {
      const query = {
        ...this.$route.query,
      }
      if (query.product_id) {
        delete query.product_id
      }
      this.productDetail = null
      this.$router.push({
        query,
      })
      this.isShowProductDetail = false
    },
    handleClickBranch(value) {
      this.keyBranch = value
      this.isVisibleConfirmChangeBranch = true
    },
    confirmChangeBranch(value) {
      this.selectedBranch = value
      this.closeConfirmChangeBranch()
      this.resetCart()
    },
    closeConfirmChangeBranch() {
      this.isVisibleConfirmChangeBranch = false
    },
    handleCloseSelectBranch() {
      this.isVisibleSelectBranch = false
    },
    handleScrollProductsList(e) {
      const { target } = e
      if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 5) {
        this.handleLoadMoreProducts()
      }
    },
    handleLoadMoreProducts() {
      if (
        !this.isLoading &&
        !this.isLoadingMoreProducts &&
        !this.noMoreResultsProduct
      ) {
        this.page++
        this.fetchMoreProducts()
      }
    },
    handleSearchByName: debounce(function () {
      this.page = 1
      this.totalPage = 0
      this.fetchProductsList()
    }, 1000),
  },
}
</script>
<style lang="less" scoped>
.make-orders {
  @apply relative h-full flex flex-col;
  .p-section {
    padding: @padding-12;
  }
  &__title {
    font-size: @size-20;
    color: @black;
    padding: @padding-24 !important;
    border-color: @gray-4;
    @apply text-center font-semibold border-b;
  }

  .scroll-product-list {
    overflow: hidden scroll;
    @apply flex-1;
    &::-webkit-scrollbar {
      width: 8px;
      &:hover {
        width: 11px;
      }
    }
    &::-webkit-scrollbar-track {
      background-color: #eee;
      border-radius: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #aaa;
      border-radius: 6px;
      min-height: 50px;
      &:hover {
        background-color: #999;
      }
    }
  }

  .title-section {
    font-size: 17px;
    line-height: 17px;
    @apply m-0 font-semibold;
  }
  &__filters {
    @apply pb-6;
    /deep/.custom-search {
      @apply mt-2;
    }
    /deep/.ant-input {
      color: @black;
      border-color: @gray-4;
      height: @height-field;
      font-size: @size-16;
      &[disabled] {
        background-color: @white;
        cursor: default;
      }
    }
  }
}
</style>
