<template>
  <div class="keyword-table">
    <div class="keyword-table__header">
      <div class="keyword-table__header--selected">
        {{ $t('selected') }}: {{ selectedRows.length }}/{{ total }}
      </div>
      <a-button
        type="link"
        icon="delete"
        :disabled="!selectedRows.length"
        class="keyword-table__header--button"
        @click="handleOpenMultipleDeleteKeywords"
      >
        {{ $t('delete') }}
      </a-button>
    </div>
    <div class="keyword-table__body">
      <a-table
        :columns="columns"
        :locale="locale"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
        :loading="isLoading"
      >
        <template slot="action" slot-scope="record">
          <div class="keyword-table-actions">
            <app-checkbox
              :item="record"
              @check="handleCheckedKeyword"
              @uncheck="handleUncheckedKeyword"
            />
            <a-dropdown placement="bottomLeft" :trigger="['click']">
              <a
                class="keyword-table-actions__dropdown"
                @click="(e) => e.preventDefault()"
              >
                <i class="fas fa-ellipsis-v"></i>
              </a>
              <a-menu slot="overlay">
                <a-menu-item key="edit">
                  <a
                    rel="noopener noreferrer"
                    class="keyword-table-actions__dropdown--item"
                    @click="handleOpenEditKeyword(record)"
                  >
                    {{ $t('edit') }}
                  </a>
                </a-menu-item>
                <a-menu-item key="delete">
                  <a
                    rel="noopener noreferrer"
                    class="keyword-table-actions__dropdown--item"
                    @click="handleOpenDeleteKeyword(record)"
                  >
                    {{ $t('delete') }}
                  </a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
            <a-switch
              :checked="record.status === $store.state.keyword.status.publish"
              @change="handleUpdateKeywordStatus(record)"
            />
          </div>
        </template>
        <template v-if="keywords.length" #footer>
          <app-pagination :page="page" :page-size="limit" :total="total" />
        </template>
      </a-table>
    </div>
    <component
      :is="isTypeComponent"
      :is-show="isShowEditKeyword"
      :keywords="keywords"
      :keyword-edit="keywordEdit"
      @reload="$emit('reload')"
      @close="handleCloseEditKeyword"
    ></component>
    <app-modal
      ref="modalDeleteKeyword"
      type="danger"
      @confirm="handleConfirmDeleteKeyword"
    >
      <template #title> {{ $t('delete') }} </template>
      <template #content>{{ $t('content-delete-keyword') }} </template>
    </app-modal>
    <app-modal
      ref="modalMultipleDeleteKeywords"
      type="danger"
      @confirm="handleConfirmMultipleDeleteKeywords"
    >
      <template #title> {{ $t('delete') }} </template>
      <template #content>{{ $t('content-delete-keywords') }} </template>
    </app-modal>
  </div>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
import { convertUTCToLocal } from '@/utils/moment'
import KeywordEdit from '@/components/Setting/KeywordManagement/KeywordEdit'
Vue.use(notification)

export default {
  name: 'KeywordTable',
  components: {
    edit: KeywordEdit,
  },
  props: {
    keywords: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      page: 1,
      limit: this.$store.state.limit,
      isTypeComponent: '',
      isShowEditKeyword: false,
      keywordEdit: {},
      deleteKeywordId: null,
      selectedRows: [],
      sort: '-created_at',
      columns: [
        {
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
        {
          title: this.$t('keyword-name'),
          key: 'name',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: this.$t('description'),
          key: 'description',
          dataIndex: 'description',
          scopedSlots: { customRender: 'description' },
          ellipsis: true,
        },
        {
          title: this.$t('added-by'),
          key: 'added-by',
          dataIndex: 'user.data.name',
          scopedSlots: { customRender: 'added-by' },
        },
        {
          title: this.$t('added-date'),
          key: 'added-date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'added-date' },
          sorter: (a, b, sortOrder) => {
            this.sort = sortOrder === 'ascend' ? 'created_at' : '-created_at'
            return new Date(a.date) - new Date(b.date)
          },
          align: 'right',
          defaultSortOrder: 'descend',
        },
      ],
    }
  },
  computed: {
    dataSource() {
      return this.keywords.map((item) => {
        const keyword = {
          ...item,
          key: item.id,
          date: convertUTCToLocal(item.created_at, 'HH:mm DD/MM/YYYY'),
        }
        return keyword
      })
    },
    locale() {
      return {
        emptyText: <app-no-data text={this.$t('no-data')} />,
      }
    },
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(query) {
        const { page = 1, limit = this.$store.state.limit } = query
        this.page = Number(page)
        this.limit = Number(limit)
      },
    },
    sort() {
      if (this.sort.length) {
        this.$emit('reload', this.sort)
      }
    },
  },
  methods: {
    handleUpdateKeywordStatus(keyword) {
      if (keyword.status === this.$store.state.keyword.status.publish) {
        this.handleUpdateKeyword(keyword, {
          status: this.$store.state.keyword.status.unpublish,
        })
      } else {
        this.handleUpdateKeyword(keyword, {
          status: this.$store.state.keyword.status.publish,
        })
      }
    },
    handleCheckedKeyword(keyword) {
      this.selectedRows = this.selectedRows.includes(keyword.id)
        ? this.selectedRows
        : [...this.selectedRows, keyword.id]
    },
    handleUncheckedKeyword(keyword) {
      this.selectedRows = this.selectedRows.filter(
        (item) => item !== keyword.id
      )
    },
    handleOpenEditKeyword(keyword) {
      this.isShowEditKeyword = true
      this.isTypeComponent = 'edit'
      this.keywordEdit = { ...keyword }
    },
    handleCloseEditKeyword() {
      this.isShowEditKeyword = false
      this.isTypeComponent = ''
    },
    handleOpenDeleteKeyword(keyword) {
      this.$refs.modalDeleteKeyword.show()
      this.deleteKeywordId = keyword.id
    },
    async handleUpdateKeyword(keyword, payload) {
      try {
        await this.$api.keyword.updateKeyword(payload, keyword.id)
        this.$emit('reload')
        notification.success({
          message:
            payload.status === this.$store.state.keyword.status.publish
              ? this.$t('published-keyword-successfully')
              : this.$t('unpublished-keyword-successfully'),
          class: 'notification-success',
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    async handleConfirmDeleteKeyword() {
      try {
        if (!this.deleteKeywordId) return
        const payload = {
          keyword_ids: [this.deleteKeywordId],
        }
        const { data } = await this.$api.keyword.deleteKeyword(payload)
        if (data) {
          this.$emit('reload')
          this.$refs.modalDeleteKeyword.hide()
          notification.success({
            message: `${this.$t('deleted-keyword-successfully')}!`,
            class: 'notification-success',
          })
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    handleOpenMultipleDeleteKeywords() {
      this.$refs.modalMultipleDeleteKeywords.show()
    },
    async handleConfirmMultipleDeleteKeywords() {
      try {
        if (!this.selectedRows.length) return
        const payload = {
          keyword_ids: [...this.selectedRows],
        }
        this.selectedRows = []
        const { data } = await this.$api.keyword.deleteKeyword(payload)
        if (data) {
          this.$emit('reload')
          this.$refs.modalMultipleDeleteKeywords.hide()
          notification.success({
            message: `${this.$t('deleted-keyword-successfully')}!`,
            class: 'notification-success',
          })
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.keyword-table {
  /deep/.ant-switch {
    width: 3.6rem;
    min-width: 3.6rem;
    height: 2rem;

    &::after {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
  &__header {
    margin-bottom: 0.5rem;
    @apply flex items-center;
    &--selected {
      color: @gray-3;
    }
    &--button {
      height: auto;
      color: @gray-3;
      padding: 0;
      margin-left: 1rem;
      /deep/.anticon {
        color: @red;
        @apply align-text-top;
      }
      &[disabled] {
        color: @secondary-2;
        /deep/.anticon {
          color: @secondary-2;
        }
      }
    }
  }
  &__body {
    /deep/.ant-table-content {
      .ant-table-body {
        table {
          thead {
            tr {
              height: @height-table;
              th {
                font-size: @size-14;
                &:first-child {
                  width: 10%;
                }
                &:nth-child(2) {
                  width: 20%;
                }
                &:nth-child(3) {
                  width: 50%;
                }
                .ant-table-column-title {
                  font-size: @font-size-base;
                  color: @black-blue;
                  @apply font-semibold;
                }
              }
            }
          }
          tbody {
            tr {
              td {
                color: @color-table;
                font-size: @size-14;
                height: @height-field;
                padding-inline: @padding-8;
              }
            }
          }
        }
      }
    }
  }
}

.keyword-table-actions {
  @apply flex items-center justify-around;
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

.keyword-table-tag {
  /deep/.app-tag {
    width: fit-content;
    margin: 5px auto;
  }
}
</style>
