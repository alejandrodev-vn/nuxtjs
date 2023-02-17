<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import event from '@/utils/event'
import ExportData from '@/components/Export/ExportData'
import { actionTypes } from '@/constants/action-types-firebase'
Vue.use(notification)

export default {
  name: 'ExportDataResponseHistory',
  extends: ExportData,
  mounted() {
    event.$on(actionTypes.NOTIFY, (notify) => {
      if (
        !notify ||
        notify.type !== this.configNotify.conversation_history_exported_success
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
        const { data, meta } =
          await this.$api.responseHistory.getExportResponseHistory(params)
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
          ...(this.filters.search?.length && {
            search_columns: this.filters.search,
          }),
          filter: {
            ...(this.filters.socialChannelId && {
              social_channel_id: this.filters.socialChannelId,
              from_id: `!${this.filters.pageSocialProfileId}`,
            }),
            ...(this.filters.conversationType && {
              conversation_type: this.filters.conversationType,
            }),
            ...(this.filters.respondedBy && {
              updated_by: this.filters.respondedBy,
            }),
            ...(this.filters.conversationType ===
              this.$store.state.configConversations.type.comment &&
              this.filters.postId?.length && {
                social_post_id: this.filters.postId,
              }),
            ...(this.filters.status && {
              conversation_status: this.filters.status,
            }),
            ...(this.filters.tags?.length && {
              tags: this.filters.tags[this.filters.tags.length - 1],
            }),
            ...(this.filters.range[0] &&
              this.filters.range[1] && {
                date: {
                  key: 'publish_time',
                  from: this.$moment(this.filters.range[0])
                    .utc()
                    .format('YYYY-MM-DD HH:mm'),
                  to: this.$moment(this.filters.range[1])
                    .utc()
                    .format('YYYY-MM-DD HH:mm'),
                },
              }),
          },
          sort: '-publish_time',
          include: 'conversation_mysql',
        }
        const { status } =
          await this.$api.responseHistory.createExportAgencyResponseHistory(
            params
          )
        if (status === 201) {
          notification.success({
            message: this.$t('title-processing-export'),
          })
        }
      } catch (e) {
        notification.error({
          message: this.$t('title-export-error'),
          class: 'notification-error',
        })
      } finally {
        this.loading = false
      }
    },
    async handleDeleteFile(file) {
      try {
        const id = file.id
        const { data } =
          await this.$api.responseHistory.deleteExportResponseHistory(id)
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
