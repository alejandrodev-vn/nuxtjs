<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import event from '@/utils/event'
import ExportData from '@/components/Export/ExportData'
import { getResponseErrorMessage } from '@/utils'
import { actionTypes } from '@/constants/action-types-firebase'
Vue.use(notification)

export default {
  name: 'ExportDataOrder',
  extends: ExportData,
  mounted() {
    event.$on(actionTypes.NOTIFY, (notify) => {
      if (!notify || notify.type !== this.configNotify.order_exported_success)
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
        const { data, meta } = await this.$api.order.getExportOrders(params)
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
          ...(this.filters['filter[social_channel_id]'] && {
            filter: {
              social_channel_id: this.filters['filter[social_channel_id]'] + '',
              ...(this.filters['filter[created_by]'] && {
                created_by: this.filters['filter[created_by]'],
              }),
              ...(this.filters['filter[status]'] && {
                status: this.filters['filter[status]'],
              }),
            },
          }),
          ...(this.filters['search[0][field]'] &&
            this.filters['search[0][value]'] && {
              search: {
                0: {
                  field: this.filters['search[0][field]'],
                  value: this.filters['search[0][value]'],
                },
              },
            }),
          ...(this.filters.sort && { sort: this.filters.sort }),
          date_from: this.filters.date_from,
          date_to: this.filters.date_to,
          ...((this.filters['order_value[from]'] ||
            this.filters['order_value[to]']) && {
            order_value: {
              ...(this.filters['order_value[from]'] && {
                from: parseFloat(this.filters['order_value[from]']),
              }),
              ...(this.filters['order_value[to]'] && {
                to: parseFloat(this.filters['order_value[to]']),
              }),
            },
          }),
          ...((this.filters['product_quantity[from]'] ||
            this.filters['product_quantity[to]']) && {
            product_quantity: {
              ...(this.filters['product_quantity[from]'] && {
                from: parseFloat(this.filters['product_quantity[from]']),
              }),
              ...(this.filters['product_quantity[to]'] && {
                to: parseFloat(this.filters['product_quantity[to]']),
              }),
            },
          }),
        }
        const { status } = await this.$api.order.createExportOrders(params)
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
        const { data } = await this.$api.order.deleteExportOrder(id)
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
