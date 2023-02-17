<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import event from '@/utils/event'
import ExportData from '@/components/Export/ExportData'
import { getResponseErrorMessage } from '@/utils'
import { actionTypes } from '@/constants/action-types-firebase'
Vue.use(notification)

export default {
  name: 'ExportDataDiscount',
  extends: ExportData,
  mounted() {
    event.$on(actionTypes.NOTIFY, (notify) => {
      if (
        !notify ||
        notify.type !== this.configNotify.discount_exported_success
      )
        return
      this.listExport.unshift({ ...notify })
    })
  },
  methods: {
    async fetchExport() {
      try {
        const params = {
          page: this.page,
          limit: this.limit,
          sort: '-created_at',
        }
        const { data, meta } = await this.$api.discount.getExportDiscounts(
          params
        )
        if (data) {
          this.listExport = [...this.listExport, ...data]
          this.total = meta.pagination.total_pages
          this.isLoadingMoreResult = false
        }
      } catch (e) {}
    },
    async handleExport() {
      try {
        this.loading = true
        const params = {
          include: 'codes',
          sort: '-promotions.updated_at',
          date_from: this.filters.date_from,
          date_to: this.filters.date_to,
          ...(this.filters['search[0][field]'] && {
            search: {
              0: {
                field: 'name',
                value: this.filters['search[0][value]'],
              },
              1: {
                field: 'code',
                value: this.filters['search[1][value]'],
              },
            },
          }),
          filter: {
            ...(this.filters['filter[discount_type_id]'] && {
              discount_type_id: this.filters['filter[discount_type_id]'],
            }),
            ...(this.filters['filter[status]'] && {
              status: this.filters['filter[status]'],
            }),
            ...(this.filters['filter[is_limit]'] && {
              is_limit: this.filters['filter[is_limit]'],
            }),
          },
          ...((this.filters['fixed_discount[from]'] ||
            this.filters['fixed_discount[to]']) && {
            fixed_discount: {
              ...(this.filters['fixed_discount[from]'] && {
                from: parseFloat(this.filters['fixed_discount[from]']),
              }),
              ...(this.filters['fixed_discount[to]'] && {
                to: parseFloat(this.filters['fixed_discount[to]']),
              }),
            },
          }),
          ...((this.filters['percent_discount[from]'] ||
            this.filters['percent_discount[to]']) && {
            percent_discount: {
              ...(this.filters['percent_discount[from]'] && {
                from: parseFloat(this.filters['percent_discount[from]']),
              }),
              ...(this.filters['percent_discount[to]'] && {
                to: parseFloat(this.filters['percent_discount[to]']),
              }),
            },
          }),
        }
        const { status } = await this.$api.discount.createExportDiscounts(
          params
        )
        if (status === 201) {
          notification.success({
            message: this.$t('title-processing-export'),
          })
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.loading = false
      }
    },
    async handleDeleteFile(file) {
      try {
        const id = file.id
        const { data } = await this.$api.discount.deleteExportDiscount(id)
        if (data) {
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
          })
          await this.refreshData()
        }
      } catch (e) {
        notification.error({
          message: this.$t('error'),
          class: 'notification-error',
        })
      }
    },
  },
}
</script>
