<template>
  <div class="discount-page">
    <div class="discount-page__header discount-page-header">
      <div class="discount-page-header__title">{{ $t('discount') }}</div>
      <div class="discount-page-header__actions">
        <a-button type="primary" icon="plus" @click="handleOpenAddDiscount">
          {{ $t('add-discount') }}
        </a-button>
      </div>
    </div>
    <div class="discount-page__actions">
      <div class="discount-page-filters">
        <div class="discount-page-filters__left">
          <a-input
            v-model="filter.search"
            :placeholder="$t('search-by-discount-code-or-discount-name')"
          >
            <a-icon slot="prefix" type="search" />
          </a-input>
          <a-select
            v-model="filter.discountType"
            class="custom-select"
            style="width: fit-content"
            @change="handleChangeDiscountType"
          >
            <template v-for="item in discountTypeOptions">
              <a-select-option :key="item.value" :value="item.value">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
          <app-date-picker
            :value="filter.range"
            :placeholder="$t('all-time')"
            @input="handleChangeRange"
          />
          <a-button type="primary" class="btn-filter" @click="handleShowFilter">
            <icon-filter />
          </a-button>
          <discount-filter-advanced
            :is-show="isShowFilter"
            :is-loading="isLoading"
            @close="handleCloseFilter"
          />
        </div>
        <div class="discount-page-filters__right">
          <export-data-discount :filters="exportFilters" />
        </div>
      </div>
    </div>
    <div class="discount-page__content">
      <discount-table
        :discounts="discounts"
        :total="total"
        :loading="isLoading"
        @reload="fetchDiscounts"
      ></discount-table>
    </div>

    <component
      :is="isTypeComponent"
      :is-show="isShowAddDiscount"
      @reload="fetchDiscounts"
      @close="handleCloseAddDiscount"
    ></component>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import { convertLocalToUTC } from '@/utils/moment'
import DiscountAdd from '@/components/SalesOperation/Discount/DiscountAdd'

export default {
  name: 'DiscountPage',
  fetchOnServer: false,
  components: {
    add: DiscountAdd,
  },
  data() {
    return {
      page: 1,
      limit: this.$store.state.limit,
      isShowAddDiscount: false,
      isTypeComponent: '',
      discounts: [],
      total: 0,
      exportFilters: {},
      isLoading: false,
      isShowFilter: false,
      filter: {
        search: '',
        discountType: '',
        status: '',
        usageLimits: '',
        range: [],
        fixedFrom: '',
        fixedTo: '',
        percentageFrom: '',
        percentageTo: '',
        sort: '-promotions.updated_at',
      },
    }
  },
  computed: {
    configDiscountType() {
      return this.$store.state.discountTypes
    },
    discountTypeOptions() {
      const type = { ...this.configDiscountType }
      const types = Object.keys(type).map((item) => {
        return {
          key: item,
          name: this.$t(item),
          value: `${type[item]}`,
        }
      })
      return [
        { key: '', value: '', name: this.$t('all-discount-types') },
        ...types,
      ]
    },
    rangeValueDiscount() {
      let rangeValueDiscount = null
      if (!this.filter.discountType) {
        rangeValueDiscount = {
          ...(this.filter.fixedFrom?.length &&
            !isNaN(this.filter.fixedFrom) && {
              'fixed_discount[from]': this.filter.fixedFrom,
            }),
          ...(this.filter.fixedTo?.length &&
            !isNaN(this.filter.fixedTo) && {
              'fixed_discount[to]': this.filter.fixedTo,
            }),
          ...(this.filter.percentageFrom?.length &&
            !isNaN(this.filter.percentageFrom) && {
              'percent_discount[from]': this.filter.percentageFrom,
            }),
          ...(this.filter.percentageTo?.length &&
            !isNaN(this.filter.percentageTo) && {
              'percent_discount[to]': this.filter.percentageTo,
            }),
        }
      } else if (
        parseInt(this.filter.discountType) ===
        this.configDiscountType['percentage-discount']
      ) {
        rangeValueDiscount = {
          ...(this.filter.percentageFrom?.length &&
            !isNaN(this.filter.percentageFrom) && {
              'percent_discount[from]': this.filter.percentageFrom,
            }),
          ...(this.filter.percentageTo?.length &&
            !isNaN(this.filter.percentageTo) && {
              'percent_discount[to]': this.filter.percentageTo,
            }),
        }
      } else if (
        parseInt(this.filter.discountType) ===
        this.configDiscountType['fixed-value-discount']
      ) {
        rangeValueDiscount = {
          ...(this.filter.fixedFrom?.length &&
            !isNaN(this.filter.fixedFrom) && {
              'fixed_discount[from]': this.filter.fixedFrom,
            }),
          ...(this.filter.fixedTo?.length &&
            !isNaN(this.filter.fixedTo) && {
              'fixed_discount[to]': this.filter.fixedTo,
            }),
        }
      }
      return rangeValueDiscount
    },
  },
  watch: {
    '$route.query': {
      handler() {
        this.handlerFilters()
      },
    },
    'filter.search': {
      handler: debounce(function () {
        const query = {
          ...this.$route.query,
          search: this.filter.search,
          page: 1,
        }
        if (!this.filter.search?.length) {
          delete query.search
        }
        this.$router.push({ query })
      }, 1000),
    },
  },
  created() {
    this.handlerFilters()
  },
  methods: {
    handleShowFilter() {
      this.isShowFilter = true
    },
    handleCloseFilter() {
      this.isShowFilter = false
    },
    async fetchDiscounts() {
      try {
        this.isLoading = true
        const params = {
          ...(this.filter.search?.length && {
            'search[0][field]': 'name',
            'search[0][value]': this.filter.search,
            'search[1][field]': 'code',
            'search[1][value]': this.filter.search,
          }),
          ...(this.filter.discountType?.length && {
            'filter[discount_type_id]': this.filter.discountType,
          }),
          ...(this.filter.status?.length && {
            'filter[status]': this.filter.status,
          }),
          ...(this.filter.usageLimits?.length && {
            'filter[is_limit]': this.filter.usageLimits,
          }),
          ...(this.filter.range[0] && {
            date_from: convertLocalToUTC(
              this.filter.range[0],
              'YYYY-MM-DD HH:mm'
            ),
          }),
          ...(this.filter.range[1] && {
            date_to: convertLocalToUTC(
              this.filter.range[1],
              'YYYY-MM-DD HH:mm'
            ),
          }),
          ...this.rangeValueDiscount,
          sort: this.filter.sort,
          limit: this.limit,
          page: this.page,
          include: 'codes',
        }
        this.exportFilters = { ...params }
        const { data, meta } = await this.$api.discount.getDiscounts(params)
        if (data) {
          this.discounts = data
          this.total = meta.pagination.total
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    },
    handlerFilters() {
      const {
        page = 1,
        limit = this.$store.state.limit,
        search = '',
        discount_type = '',
        status = '',
        usage_limits = '',
        date_from,
        date_to,
        fixed_from = '',
        fixed_to = '',
        percentage_from = '',
        percentage_to = '',
        sort = '-promotions.updated_at',
      } = this.$route.query
      this.page = Number(page)
      this.limit = Number(limit)
      this.filter.discountType = discount_type
      this.filter.status = status
      this.filter.usageLimits = usage_limits
      this.filter.fixedFrom = fixed_from
      this.filter.fixedTo = fixed_to
      this.filter.percentageFrom = percentage_from
      this.filter.percentageTo = percentage_to
      if (search?.length) {
        this.filter.search = search
      }
      if (date_from && date_to) {
        this.filter.range = [new Date(date_from), new Date(date_to)]
        const checkDateFrom = this.$moment(date_from).format('YYYY-MM-DD HH:mm')
        const checkDateTo = this.$moment(date_to).format('YYYY-MM-DD HH:mm')
        if (
          checkDateFrom === 'Invalid date' ||
          checkDateTo === 'Invalid date'
        ) {
          this.handleChangeRange([])
        }
      }
      if (
        sort === 'start_date' ||
        sort === '-start_date' ||
        sort === 'end_date' ||
        sort === '-end_date'
      ) {
        this.filter.sort = sort
      } else {
        this.filter.sort = '-promotions.updated_at'
      }
      this.fetchDiscounts()
    },
    handleOpenAddDiscount() {
      this.isShowAddDiscount = true
      this.isTypeComponent = 'add'
    },
    handleCloseAddDiscount() {
      this.isShowAddDiscount = false
      this.isTypeComponent = ''
    },
    handleChangeRange(date = []) {
      this.filter.range = date
      const query = {
        ...this.$route.query,
        date_from: this.$moment(date[0]).format('YYYY-MM-DD HH:mm'),
        date_to: this.$moment(date[1]).format('YYYY-MM-DD HH:mm'),
        page: 1,
      }
      if (
        query.date_from === 'Invalid date' ||
        query.date_to === 'Invalid date' ||
        !date[0] ||
        !date[1]
      ) {
        delete query.date_from
        delete query.date_to
        this.filter.range = []
      }
      this.$router.push({ query })
    },
    handleChangeDiscountType(value) {
      const query = {
        ...this.$route.query,
        discount_type: value,
        page: 1,
      }
      if (!query.discount_type?.length) {
        delete query.discount_type
      }
      this.$router.push({ query })
    },
    handleSearch: debounce(function () {
      const query = {
        ...this.$route.query,
        page: 1,
        search: this.search,
      }
      if (!this.search) {
        delete query.search
      }
      this.$router.push({ query })
    }, 1000),
  },
}
</script>

<style lang="less" scoped>
.discount-page {
  padding: @padding-40 @padding-24;

  &__content {
    padding-top: 24px;
  }
}

.discount-page-header {
  margin-bottom: 1rem;
  @apply flex items-center justify-between;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }
}

.discount-page-filters {
  @apply flex items-center justify-between flex-wrap;

  /deep/.ant-input-affix-wrapper {
    width: 40rem;
    margin-right: 12px;

    .ant-input {
      height: @height-field;
    }
  }

  /deep/ .ant-input-affix-wrapper {
    width: 40rem;
    height: @height-field;
    @apply m-2;
    .ant-input {
      height: 100%;
    }
  }
  /deep/.custom-select {
    color: @gray-1;
    font-size: @size-16;
    min-width: 22rem;
    width: fit-content;
    height: @height-field;
    @apply m-2;
    .ant-select-selection {
      border-color: @black-gray;
      height: 100%;
      &__rendered {
        height: 100%;
        line-height: @height-field;
      }
      .ant-select-selection-selected-value {
        max-width: 25rem;
        @apply pr-2;
      }
      .ant-select-arrow-icon {
        color: @black;
      }
    }
  }

  /deep/.mx-datepicker {
    width: 38rem;
    height: @height-field;
    border-color: @black-gray;
    font-size: @size-16;

    @apply m-2;
    .mx-input {
      height: @height-field;
    }
  }
  .btn-filter {
    background-color: @gray-6;
    color: @black;
    width: @height-field;
    height: @height-field;
    @apply p-0 border-0 rounded-xl ml-2 inline-flex items-center justify-center;
    svg {
      font-size: @size-14;
      width: @size-14;
      height: @size-14;
    }
  }
}
</style>
