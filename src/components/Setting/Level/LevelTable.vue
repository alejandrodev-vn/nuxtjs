<template>
  <div class="level-table">
    <div class="level-table__header">
      {{ $t('guest-level-detail') }}
    </div>
    <div class="level-table__body">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
      >
        <template slot="level" slot-scope="level">
          <span class="inline-block">
            <app-tag :type="levelColor[level]">{{ $t(level) }}</app-tag>
          </span>
        </template>
        <template slot="chat" slot-scope="chat">
          <span v-if="chat === 0 || chat === 1">
            {{
              $t('from-number-chat', {
                number: chat,
              })
            }}
          </span>
          <span v-else>
            {{
              $t('from-number-chats', {
                number: chat,
              })
            }}
          </span>
        </template>
        <template slot="comment" slot-scope="comment">
          <span v-if="comment === 0 || comment === 1">
            {{
              $t('from-number-comment', {
                number: comment,
              })
            }}
          </span>
          <span v-else>
            {{
              $t('from-number-comments', {
                number: comment,
              })
            }}
          </span>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LevelTable',
  props: {
    levels: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('guest-level'),
          key: 'level',
          dataIndex: 'level',
          scopedSlots: { customRender: 'level' },
        },
        {
          title: this.$t('chats'),
          key: 'chat',
          dataIndex: 'chat',
          scopedSlots: { customRender: 'chat' },
        },
        {
          title: this.$t('comments'),
          key: 'comment',
          dataIndex: 'comment',
          scopedSlots: { customRender: 'comment' },
        },
      ],
      levelColor: this.$store.state.levelColor,
    }
  },
  computed: {
    dataSource() {
      return this.levels.map((item) => {
        const level = {
          key: item.id,
          level: item.name.toLowerCase(),
          chat: item.message_range,
          comment: item.comment_range,
        }
        return level
      })
    },
  },
}
</script>

<style lang="less" scoped>
.level-table {
  &__header {
    color: @secondary-2;
    font-size: @size-14;
    margin-bottom: 1.5rem;
  }

  /deep/&__body {
    .app-tag {
      font-size: @size-14;
    }
    .ant-table .ant-table-content .ant-table-body .ant-table-thead > tr > th {
      color: @black-blue;
      font-size: @size-14;
      @apply font-medium pl-4;
    }
    .ant-table .ant-table-content .ant-table-body .ant-table-tbody > tr > td {
      font-size: @size-14;
      color: @color-table;
      padding-inline: @padding-8;
      @apply font-normal pl-4;
    }
    tr {
      height: @height-table;
    }
  }
}
</style>
