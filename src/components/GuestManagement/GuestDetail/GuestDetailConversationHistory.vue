<template>
  <div class="guest-detail-conversation-history">
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
      >
        <template #title>
          {{ $t('conversation-history') }}
        </template>
        <template slot="type" slot-scope="type">
          <div class="flex items-center justify-center opacity-60">
            <a-tooltip
              v-if="type === configConversations.type.chat"
              overlay-class-name="custom-tooltip-light"
              placement="rightBottom"
            >
              <template slot="title">{{ $t('chat') }}</template>
              <icon-messenger />
            </a-tooltip>
            <a-tooltip
              v-else
              overlay-class-name="custom-tooltip-light"
              placement="rightBottom"
            >
              <template slot="title">{{ $t('comment') }}</template>
              <icon-comment />
            </a-tooltip>
          </div>
        </template>
        <template slot="conversation" slot-scope="conversation">
          <a-tooltip
            overlay-class-name="custom-tooltip-light"
            placement="bottomLeft"
          >
            <template slot="title">
              {{ conversation }}
            </template>
            {{ conversation }}
          </a-tooltip>
        </template>
        <template #footer>
          <a-pagination v-model="page" :page-size="limit" :total="total" />
        </template>
      </a-table>
    </template>
  </div>
</template>

<script>
import { convertUTCToLocal } from '@/utils/moment'

export default {
  name: 'GuestDetailConversationHistory',
  fetchOnServer: false,
  props: {
    guest: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      page: 1,
      limit: this.$store.state.limit,
      total: 0,
      histories: [],
      sort: '-publish_time',
      columns: [
        {
          title: this.$t('type'),
          key: 'type',
          dataIndex: 'type',
          scopedSlots: { customRender: 'type' },
          align: 'center',
        },
        {
          title: this.$t('conversation'),
          key: 'conversation',
          dataIndex: 'conversation',
          scopedSlots: { customRender: 'conversation' },
        },
        {
          title: this.$t('date'),
          key: 'date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' },
          sorter: (a, b, sortOrder) => {
            this.sort =
              sortOrder === 'ascend' ? 'publish_time' : '-publish_time'
          },
          defaultSortOrder: 'descend',
          align: 'right',
        },
      ],
    }
  },
  async fetch() {
    await this.fetchConversationHistory()
  },
  computed: {
    configConversations() {
      return this.$store.state.configConversations
    },
    dataSource() {
      return this.histories.map((item) => {
        const conversation = item.content_types.some(
          (type) =>
            parseInt(type) === this.configConversations.content_type.unknown
        )
          ? this.$t('unsupported-message-type')
          : item.content.length
          ? item.content
          : this.$t('send-an-attachment')
        const history = {
          key: item.id,
          type: item.conversation_type,
          conversation,
          date: item.publish_time
            ? convertUTCToLocal(item.publish_time, 'HH:mm DD/MM/YYYY')
            : '--',
        }
        return history
      })
    },
  },
  watch: {
    page() {
      this.fetchConversationHistory()
    },
    sort() {
      this.fetchConversationHistory()
    },
  },
  methods: {
    async fetchConversationHistory() {
      try {
        const params = {
          action: this.configConversations.actions.view,
          limit: this.limit,
          page: this.page,
          'filter[social_channel_id]': this.guest.social_channel_id,
          'filter[from_id]': this.guest.social_profile_id,
          sort: this.sort,
        }
        const { data, meta } =
          await this.$api.conversation.getConversationHistory(params)
        if (data) {
          this.histories = data
          this.total = meta.pagination.total
        }
      } catch (e) {}
    },
  },
}
</script>

<style lang="less" scoped>
.guest-detail-conversation-history {
  /deep/.ant-table-title {
    color: @black;
    font-size: @size-20;
    padding: @padding-16 @padding-24;
    @apply font-semibold;
  }

  /deep/.ant-table-content {
    .ant-table-body {
      table {
        thead {
          height: @height-table;
          th {
            font-size: @size-14;

            &:first-child {
              width: 5%;
            }
          }
        }
        tbody {
          tr {
            height: @height-table;
            td {
              padding-inline: @padding-8;
              font-size: @size-14;
            }
          }
        }
      }
    }
  }
}
</style>
