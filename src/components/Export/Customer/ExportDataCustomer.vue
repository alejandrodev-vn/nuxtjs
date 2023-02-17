<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import event from '@/utils/event'
import ExportData from '@/components/Export/ExportData'
import { getResponseErrorMessage } from '@/utils'
import { actionTypes } from '@/constants/action-types-firebase'
Vue.use(notification)

export default {
  name: 'ExportDataCustomer',
  extends: ExportData,
  mounted() {
    event.$on(actionTypes.NOTIFY, (notify) => {
      if (
        !notify ||
        notify.type !== this.configNotify.customer_exported_success
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
        const { data, meta } = await this.$api.customer.getExportCustomers(
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
          ...(this.filters.search_columns && {
            search_columns: this.filters.search_columns,
          }),
          ...(this.filters.sort && {
            sort: this.filters.sort,
          }),
          filter: {
            ...(this.filters['filter[social_channel_id]'] && {
              social_channel_id: this.filters['filter[social_channel_id]'] + '',
            }),
            ...(this.filters['filter[rank_id]'] && {
              rank_id: this.filters['filter[rank_id]'],
            }),
          },
          date_from: this.filters.date_from,
          date_to: this.filters.date_to,
          ...((this.filters['total_spending[from]'] ||
            this.filters['total_spending[to]']) && {
            total_spending: {
              ...(this.filters['total_spending[from]'] && {
                from: parseFloat(this.filters['total_spending[from]']),
              }),
              ...(this.filters['total_spending[to]'] && {
                to: parseFloat(this.filters['total_spending[to]']),
              }),
            },
          }),
          ...((this.filters['complete_rate[from]'] ||
            this.filters['complete_rate[to]']) && {
            complete_rate: {
              ...(this.filters['complete_rate[from]'] && {
                from: parseFloat(this.filters['complete_rate[from]']),
              }),
              ...(this.filters['complete_rate[to]'] && {
                to: parseFloat(this.filters['complete_rate[to]']),
              }),
            },
          }),
        }
        const { status } = await this.$api.customer.createExportCustomers(
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
        const { data } = await this.$api.customer.deleteExportCustomer(id)
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
