<template>
  <div class="discount-table">
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :bordered="true"
      :custom-row="handleClickRow"
      :locale="locale"
      :loading="loading"
    >
      <template slot="action" slot-scope="record">
        <div
          class="discount-table-actions mr-4"
          @click.stop="(e) => e.preventDefault()"
        >
          <a-dropdown placement="bottomLeft" :trigger="['click']">
            <a
              class="discount-table-actions__dropdown"
              @click.stop="(e) => e.preventDefault()"
            >
              <i class="fas fa-ellipsis-v"></i>
            </a>
            <a-menu slot="overlay">
              <a-menu-item key="view">
                <a
                  rel="noopener noreferrer"
                  class="discount-table-actions__dropdown--item"
                  @click="handleOpenDetailDiscount(record)"
                >
                  {{ $t('view') }}
                </a>
              </a-menu-item>
              <a-menu-item key="delete">
                <a
                  rel="noopener noreferrer"
                  class="discount-table-actions__dropdown--item"
                  @click="handleOpenDeleteDiscount(record)"
                >
                  {{ $t('delete') }}
                </a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
          <discount-switch
            :ref="`discountSwitch-${record.id}`"
            :checked="record.status === $store.state.discountStatus.active"
            :item="record"
            :title="getTitleDiscountSwitch(record.status)"
            :content="getContentDiscountSwitch(record.status)"
            :expired="record.status === $store.state.discountStatus.expired"
            @confirm="handleUpdateDiscountStatus"
          />
        </div>
      </template>
      <template slot="value" slot-scope="value">
        <app-number :number="value" />
      </template>
      <template #footer>
        <app-pagination :page="page" :page-size="limit" :total="total" />
      </template>
    </a-table>

    <app-modal
      ref="modalDeleteDiscount"
      type="danger"
      @confirm="handleConfirmDeleteDiscount"
    >
      <template #title> {{ $t('delete') }} </template>
      <template #content>{{ $t('content-delete-discount') }} </template>
    </app-modal>

    <a-drawer
      :visible="isShowDrawer"
      :closable="false"
      width="70vw"
      class="drawer-discount-detail"
      @close="handleCloseDrawer"
    >
      <span class="drawer-discount-detail__close" @click="handleCloseDrawer">
        <icon-right class="btn-trigger-collapse" />
      </span>
      <div class="drawer-discount-detail__content">
        <nuxt-child></nuxt-child>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { get, invert } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { convertUTCToLocal } from '@/utils/moment'
Vue.use(notification)

export default {
  name: 'DiscountTable',
  props: {
    discounts: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isShowDrawer: false,
      page: 1,
      limit: this.$store.state.limit,
      discountDelete: {},
      sort: '',
    }
  },
  computed: {
    columns() {
      return [
        {
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
        {
          title: this.$t('discount-code'),
          key: 'code',
          dataIndex: 'code',
          scopedSlots: { customRender: 'code' },
        },
        {
          title: this.$t('discount-name'),
          key: 'name',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: this.$t('discount-type'),
          key: 'type',
          dataIndex: 'type',
          scopedSlots: { customRender: 'type' },
        },
        {
          title: this.$t('discount-value'),
          key: 'value',
          dataIndex: 'value',
          scopedSlots: { customRender: 'value' },
          align: 'right',
        },
        {
          title: this.$t('usage-limits'),
          key: 'limit',
          dataIndex: 'limit',
          scopedSlots: { customRender: 'limit' },
        },
        {
          title: this.$t('used'),
          key: 'used',
          dataIndex: 'used',
          scopedSlots: { customRender: 'used' },
          align: 'right',
        },
        {
          title: this.$t('left'),
          key: 'left',
          dataIndex: 'left',
          scopedSlots: { customRender: 'left' },
          align: 'right',
        },
        {
          title: this.$t('start-date'),
          key: 'start',
          dataIndex: 'start',
          scopedSlots: { customRender: 'start' },
          sorter: (a, b, sortOrder) => {
            this.sort = sortOrder === 'ascend' ? 'start_date' : '-start_date'
          },
          defaultSortOrder:
            this.sort === 'start_date'
              ? 'ascend'
              : this.sort === '-start_date'
              ? 'descend'
              : null,
          align: 'right',
        },
        {
          title: this.$t('end-date'),
          key: 'end',
          dataIndex: 'end',
          scopedSlots: { customRender: 'end' },
          sorter: (a, b, sortOrder) => {
            this.sort = sortOrder === 'ascend' ? 'end_date' : '-end_date'
          },
          defaultSortOrder:
            this.sort === 'end_date'
              ? 'ascend'
              : this.sort === '-end_date'
              ? 'descend'
              : null,
          align: 'right',
        },
      ]
    },
    locale() {
      return {
        emptyText: <app-no-data text={this.$t('no-data')} />,
      }
    },
    discountTypes() {
      return invert(this.$store.state.discountTypes)
    },
    discountUsageLimits() {
      return invert(this.$store.state.discountUsageLimits)
    },
    dataSource() {
      return this.discounts.map((item) => {
        const code = get(item, 'codes.data[0].code', '--') || '--'
        const used = get(item, 'codes.data[0].used', 0) || 0
        const limit = this.discountUsageLimits[item.is_limit]
        const isLimit =
          item.is_limit === this.$store.state.discountUsageLimits.limited
        const discount = {
          key: item.id,
          id: item.id,
          status: item.status,
          code,
          name: item.name,
          type: this.$t(this.discountTypes[item.discount_type_id]),
          value: item.discount_value,
          limit: isLimit ? `${this.$t(limit)} - ${item.limit}` : this.$t(limit),
          used,
          left: isLimit ? item.limit - used : '--',
          start: item.start_date
            ? convertUTCToLocal(item.start_date, 'HH:mm DD/MM/YYYY')
            : '--',
          end: item.end_date
            ? convertUTCToLocal(item.end_date, 'HH:mm DD/MM/YYYY')
            : '--',
        }
        return discount
      })
    },
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(query) {
        const { page = 1, limit = this.$store.state.limit, sort } = query
        this.page = Number(page)
        this.limit = Number(limit)
        this.sort = sort
      },
    },
    sort() {
      const query = {
        ...this.$route.query,
        sort: this.sort,
      }
      this.$router.push({ query })
    },
  },
  created() {
    const discountID = this.$route.params.id
    if (discountID) {
      this.isShowDrawer = true
    }
  },
  methods: {
    getTitleDiscountSwitch(status) {
      if (status === 1) {
        return this.$t('deactive')
      }
      return this.$t('active')
    },
    getContentDiscountSwitch(status) {
      if (status === 1) {
        return this.$t('content-deactivate-discount')
      }
      return this.$t('content-activate-discount')
    },
    handleClickRow(record) {
      return {
        on: {
          click: () => {
            this.isShowDrawer = true
            const query = {
              ...this.$route.query,
            }
            this.$router.push(
              this.localePath({
                path: `/sales-operation/discount/detail/${record.key}`,
                query,
              })
            )
          },
        },
      }
    },
    handleCloseDrawer() {
      this.isShowDrawer = false
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({ path: '/sales-operation/discount', query })
      )
    },
    handleOpenDetailDiscount(discount) {
      this.isShowDrawer = true
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: `/sales-operation/discount/detail/${discount.key}`,
          query,
        })
      )
    },
    handleOpenDeleteDiscount(discount) {
      this.$refs.modalDeleteDiscount.show()
      this.discountDelete = { ...discount }
    },
    async handleConfirmDeleteDiscount() {
      try {
        const { data } = await this.$api.discount.deleteDiscount(
          this.discountDelete.id
        )
        if (data) {
          this.$emit('reload')
          this.$refs.modalDeleteDiscount.hide()
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
          })
        }
      } catch (e) {}
    },
    async handleUpdateDiscountStatus(discount) {
      try {
        const payload = {
          status: discount.status === 1 ? 0 : 1,
        }
        const { data } = await this.$api.discount.updateDiscountStatus(
          discount.id,
          payload
        )
        if (data) {
          this.$emit('reload')
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
          })
        }
      } catch (e) {
        notification.error({
          message: this.$t('error'),
          class: 'notification-error',
        })
      } finally {
        this.$refs[`discountSwitch-${discount.id}`].handleCloseModal()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.discount-table {
  /deep/.ant-table-content {
    .ant-table-body {
      table {
        thead {
          tr {
            height: @height-table;
            th {
              background-color: #f2f3f4;
              font-weight: 500;
              font-size: @size-14;
              line-height: @size-22;
              color: @black;
              &:first-child {
                width: 5rem;
              }
            }
          }
        }

        tbody {
          tr {
            height: @height-table;
            @apply cursor-pointer;

            td {
              color: @color-table;
              font-size: @size-14;
              line-height: @size-22;
              padding: @padding-8;
              &:first-child {
                @apply cursor-default;
              }
            }
          }
        }
      }
    }
  }
}

.discount-table-actions {
  padding: 0.375rem 0.5rem;
  @apply flex items-center justify-between;

  &__dropdown {
    color: @secondary-1;
    line-height: 1;
    margin: 0 0.5rem;

    &--item {
      width: 9rem;
      @apply text-center;
    }
  }
}

.drawer-discount-detail {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    z-index: 10;
    cursor: pointer;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }
  &__content {
    height: 100%;
    @apply overflow-auto;
  }
  &.ant-drawer-open {
    /deep/.ant-drawer-content {
      @apply overflow-visible;
      .ant-drawer-body {
        height: 100%;
        padding: 0;
        @apply overflow-auto;
      }
    }
  }
}
</style>
