<template>
  <div class="unsafe-keyword-table">
    <div class="unsafe-keyword-table__header">
      <div class="unsafe-keyword-table__header--selected">
        {{ $t('selected') }}: {{ selectedRows.length }}/{{ total }}
      </div>
      <a-button
        type="link"
        icon="delete"
        :disabled="!selectedRows.length"
        class="unsafe-keyword-table__header--button"
        @click="handleOpenMultipleDeleteKeywords"
      >
        {{ $t('delete') }}
      </a-button>
    </div>
    <div class="unsafe-keyword-table__body">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
        :locale="locale"
      >
        <template slot="action" slot-scope="record">
          <div class="unsafe-keyword-table-actions">
            <app-checkbox
              :item="record"
              @check="handleCheckedKeyword"
              @uncheck="handleUncheckedKeyword"
            />
            <a-dropdown placement="bottomLeft" :trigger="['click']">
              <a
                class="unsafe-keyword-table-actions__dropdown"
                @click="(e) => e.preventDefault()"
              >
                <i class="fas fa-ellipsis-v"></i>
              </a>
              <a-menu slot="overlay">
                <a-menu-item key="edit">
                  <a
                    rel="noopener noreferrer"
                    class="unsafe-keyword-table-actions__dropdown--item"
                    @click="handleOpenEditKeyword(record)"
                  >
                    {{ $t('edit') }}
                  </a>
                </a-menu-item>
                <a-menu-item key="delete">
                  <a
                    rel="noopener noreferrer"
                    class="unsafe-keyword-table-actions__dropdown--item"
                    @click="handleOpenDeleteKeyword(record)"
                  >
                    {{ $t('delete') }}
                  </a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </template>
        <template slot="type" slot-scope="type">
          <div class="unsafe-keyword-table-tag">
            <app-tag :type="getTypeTag(type)" :border="true" :square="true">
              <span>{{ getNameTag(type) }}</span>
            </app-tag>
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
      <template #content>{{ $t('content-delete-unsafe-keyword') }} </template>
    </app-modal>
    <app-modal
      ref="modalMultipleDeleteKeywords"
      type="danger"
      @confirm="handleConfirmMultipleDeleteKeywords"
    >
      <template #title> {{ $t('delete') }} </template>
      <template #content>{{ $t('content-delete-unsafe-keywords') }} </template>
    </app-modal>
  </div>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
import { convertUTCToLocal } from '@/utils/moment'
import UnsafeKeywordEdit from '@/components/Setting/UnsafeKeyword/UnsafeKeywordEdit'
Vue.use(notification)

export default {
  name: 'UnsafeKeywordTable',
  components: {
    edit: UnsafeKeywordEdit,
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
      columns: [
        {
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
        {
          title: this.$t('unsafe-keyword'),
          key: 'disallow_keyword',
          dataIndex: 'disallow_keyword',
          scopedSlots: { customRender: 'disallow_keyword' },
        },
        {
          title: this.renderTitleType(
            this.$t('type'),
            this.$t('type-unsafe-keyword-info')
          ),
          key: 'type',
          dataIndex: 'type',
          scopedSlots: { customRender: 'type' },
          align: 'center',
        },
        {
          title: this.$t('last-edited'),
          key: 'date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' },
          sorter: (a, b) => {
            return new Date(a.updated_at) - new Date(b.updated_at)
          },
          align: 'right',
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
          date: convertUTCToLocal(item.updated_at, 'HH:mm DD/MM/YYYY'),
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
  },
  methods: {
    getTypeTag(type) {
      return type === 2 ? 'danger' : 'warning'
    },
    getNameTag(type) {
      return type === 2 ? this.$t('Banned') : this.$t('Warning')
    },
    renderTitleType(title, tooltipContent) {
      return (
        <div class="flex items-center justify-center">
          <span class="mr-2">{title}</span>
          <a-tooltip overlay-class-name="custom-tooltip-light">
            <template slot="title">{tooltipContent}</template>
            <a-icon type="info-circle" />
          </a-tooltip>
        </div>
      )
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
    async handleConfirmDeleteKeyword() {
      try {
        if (!this.deleteKeywordId) return
        const payload = {
          disallow_keyword_ids: [this.deleteKeywordId],
        }
        const { data } = await this.$api.unsafeKeyword.deleteUnsafeKeyword(
          payload
        )
        if (data) {
          this.selectedRows = []
          this.$emit('reload')
          this.$refs.modalDeleteKeyword.hide()
          notification.success({
            message: this.$t('delete-unsafe-keyword-successfully'),
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
          disallow_keyword_ids: [...this.selectedRows],
        }
        const { data } = await this.$api.unsafeKeyword.deleteUnsafeKeyword(
          payload
        )
        if (data) {
          this.selectedRows = []
          this.$emit('reload')
          this.$refs.modalMultipleDeleteKeywords.hide()
          notification.success({
            message: this.$t('delete-unsafe-keyword-successfully'),
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
.unsafe-keyword-table {
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
                color: @color-table;
                font-size: @size-14;
                &:first-child {
                  width: 8%;
                }
                &:nth-child(2) {
                  width: 52%;
                  word-wrap: break-word;
                  max-width: 52%;
                }
                &:nth-child(3) {
                  width: 15%;
                }
                &:last-child {
                  width: 25%;
                }
                .ant-table-column-title {
                  font-size: @font-size-base;
                  color: @black-blue;
                  @apply font-medium;
                }
              }
            }
          }
          tbody {
            tr {
              height: @height-table;
              td {
                color: @color-table;
                font-size: @size-14;
                padding-inline: @padding-8;
                &:nth-child(2) {
                  word-wrap: break-word;
                  max-width: 80rem;
                }
              }
            }
          }
        }
      }
      .ant-table-placeholder {
        height: 400px;
      }
    }
  }
}

.unsafe-keyword-table-actions {
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

.unsafe-keyword-table-tag {
  /deep/.app-tag {
    width: fit-content;
    margin: 5px auto;
    @apply font-normal;
  }
}
</style>
