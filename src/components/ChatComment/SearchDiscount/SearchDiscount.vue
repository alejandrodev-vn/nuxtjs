<template>
  <div class="search-discount">
    <h5 class="search-discount__title">
      {{ $t('searchDiscount') }}
    </h5>
    <div class="search-discount__body">
      <a-select
        v-model="filter.discountType"
        default-value=""
        class="custom-select"
      >
        <a-select-option
          v-for="(type, index) in typeOptions"
          :key="index"
          :value="type.value"
        >
          {{ type.name }}
        </a-select-option>
      </a-select>
      <app-date-picker
        :value="filter.range"
        :use-query-router="false"
        :placeholder="$t('all-time')"
        :append-to-body="false"
        popup-class="placement-right"
        @input="handleChangeRange"
      />
      <a-input
        v-model="filter.code"
        class="input-search-code"
        :placeholder="$t('search-discount-name-or-discount-code')"
      >
        <a-icon slot="prefix" type="search" />
      </a-input>
      <perfect-scrollbar
        :options="{ suppressScrollX: true }"
        class="scroll-discount-list"
        @ps-y-reach-end="handleLoadMore"
      >
        <app-loading v-if="isLoading" />
        <div v-else-if="!discounts.length" class="mt-4">
          <app-no-data :text="$t('noDataFound')" />
        </div>
        <search-discount-list
          v-else
          :discounts="discounts"
          @handleOpenDiscountDetail="handleOpenDiscountDetail"
        />
      </perfect-scrollbar>
    </div>
    <search-discount-detail
      v-if="isShowDiscountDetail"
      :visible="isShowDiscountDetail"
      :discount="discountDetail"
      @handleCloseDiscountDetail="handleCloseDiscountDetail"
    />
  </div>
</template>
<script>
import { debounce } from 'lodash'
import { convertLocalToUTC } from '@/utils/moment'

export default {
  name: 'SearchDiscount',
  fetchOnServer: false,
  data() {
    return {
      isLoading: false,
      isLoadingMore: false,
      channels: [],
      page: 1,
      limit: this.$store.state.limit,
      total: 0,
      filter: {
        range: [],
        code: '',
        discountType: 0,
      },
      isShowDiscountDetail: false,
      discountDetail: null,
      discounts: [],
      isShowAdvancedFilter: false,
    }
  },
  async fetch() {
    await this.fetchDiscounts()
  },
  computed: {
    typeOptions() {
      const type = this.$store.state.discountTypes
      const types = Object.keys(type).map((item) => {
        return {
          key: item,
          name: this.$t(item),
          value: `${type[item]}`,
        }
      })
      return [
        { key: 'all', name: this.$t('all-discount-types'), value: 0 },
        ...types,
      ]
    },
    noMoreResults() {
      return !this.isLoadingMore && this.page >= this.total
    },
    discountId() {
      return this.$route.query.discount_id
    },
  },
  watch: {
    filter: {
      deep: true,
      handler() {
        this.handleFilter()
      },
    },
    async discountId() {
      if (
        (this.discountId?.length && !this.discountDetail) ||
        this.discountDetail?.id + '' !== this.discountId
      ) {
        await this.fetchDiscountDetail()
        if (!this.discountDetail) return
        this.isShowDiscountDetail = true
      }
    },
  },
  async mounted() {
    if (
      (this.discountId?.length && !this.discountDetail) ||
      this.discountDetail?.id + '' !== this.discountId
    ) {
      await this.fetchDiscountDetail()
      if (!this.discountDetail) return
      this.isShowDiscountDetail = true
    }
  },
  destroyed() {
    const query = {
      ...this.$route.query,
    }
    if (query.discount_id) {
      delete query.discount_id
    }
    this.$router.push({ query })
  },
  methods: {
    handleLoadMore() {
      if (
        !this.isLoading &&
        !this.$fetchState.pending &&
        !this.isLoadingMore &&
        !this.noMoreResults
      ) {
        this.isLoadingMore = true
        this.page++
        this.fetchDiscounts()
      }
    },
    async fetchDiscounts() {
      try {
        this.isLoadingMore = true
        const filterDate =
          !this.filter?.range[0] || !this.filter?.range[1]
            ? null
            : {
                date_from: convertLocalToUTC(
                  this.$moment(this.filter.range[0]),
                  'YYYY-MM-DD HH:mm'
                ),
                date_to: convertLocalToUTC(
                  this.$moment(this.filter.range[1]),
                  'YYYY-MM-DD HH:mm'
                ),
              }
        const params = {
          ...(this.filter.code.length && {
            'search[0][field]': 'name',
            'search[0][value]': this.filter.code,
            'search[1][field]': 'code',
            'search[1][value]': this.filter.code,
          }),
          'filter[status]': 1,
          limit: this.limit,
          page: this.page,
          ...(this.filter.discountType && {
            'filter[discount_type_id]': this.filter.discountType,
          }),
          ...(filterDate && { ...filterDate }),
          sort: '-promotions.updated_at',
          include: 'codes',
        }
        const { data, meta } = await this.$api.discount.getDiscounts(params)
        if (data) {
          this.discounts = [...this.discounts, ...data]
          this.total = meta.pagination.total_pages
        }
      } catch (err) {
      } finally {
        this.isLoadingMore = false
      }
    },
    async fetchDiscountDetail() {
      try {
        if (!this.discountId?.length) return
        const params = {
          include: 'codes',
        }
        const { data } = await this.$api.discount.getDiscountDetail(
          this.discountId,
          params
        )
        if (data) {
          this.discountDetail = { ...data }
        }
      } catch (err) {}
    },
    handleChangeRange(date = []) {
      this.filter.range = date
      if (!date[0] || !date[1]) {
        this.range = []
      }
    },
    handleOpenDiscountDetail(discount) {
      this.discountDetail = { ...discount }
      if (!this.discountDetail) return
      const query = {
        ...this.$route.query,
        discount_id: this.discountDetail.id,
      }
      this.$router.push({ query })
      this.isShowDiscountDetail = true
    },
    handleCloseDiscountDetail() {
      const query = {
        ...this.$route.query,
      }
      if (query.discount_id) {
        delete query.discount_id
      }
      this.discountDetail = null
      this.$router.push({
        query,
      })
      this.isShowDiscountDetail = false
    },
    handleFilter: debounce(async function () {
      this.page = 1
      this.total = 0
      this.discounts = []
      this.isLoading = true
      await this.fetchDiscounts()
      this.isLoading = false
    }, 1000),
    showAdvancedFilter() {
      this.isShowAdvancedFilter = true
    },
  },
}
</script>
<style lang="less" scoped>
.search-discount {
  @apply relative h-full flex flex-col;

  &__title {
    font-size: @size-20;
    color: @black;
    padding: @padding-24;
    border-color: @gray-4;
    margin-bottom: 0;
    @apply text-center font-semibold border-b;
  }
  &__body {
    padding: @padding-24;
    @apply flex-1 flex flex-col;
    /deep/.popover-button {
      height: 4rem;
      color: @black;
      margin-bottom: @margin-16;
      .anticon.anticon-down {
        font-size: @size-12;
      }
    }
    /deep/.custom-select {
      color: @black;
      height: @height-field;
      margin-bottom: @margin-16;

      .ant-select-selection {
        border-color: @secondary-2;
        height: @height-field;
      }
      .ant-select-selection__rendered {
        line-height: @height-field;
      }
      .ant-select-arrow {
        color: @black;
      }
    }
    /deep/.mx-datepicker-range {
      height: @height-field;
      margin-bottom: @margin-16;
      width: 100%;
      .mx-input-wrapper {
        @apply h-full;
        .mx-input {
          border: 1px solid @secondary-2;
          color: @black;
          @apply h-full;
        }
      }
    }
    /deep/.input-search-code {
      height: @height-field;
      margin-bottom: @margin-16;

      .ant-input {
        border: 1px solid @secondary-2;
        height: @height-field;
        color: @black;
      }
    }
    .scroll-discount-list {
      @apply flex-1 mt-4 mb-2;
    }
  }
}
</style>
