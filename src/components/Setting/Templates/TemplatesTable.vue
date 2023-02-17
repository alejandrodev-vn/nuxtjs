<template>
  <div class="template-table">
    <div class="template-table__header">
      <div class="template-table__header--selected">
        {{ $t('selected') }}: {{ selectedRows.length }}/{{ total }}
      </div>
      <a-button
        type="link"
        icon="delete"
        :disabled="!selectedRows.length"
        class="template-table__header--button"
        @click="handleOpenMultipleDeleteTemplates"
      >
        {{ $t('delete') }}
      </a-button>
    </div>
    <div class="template-table__body">
      <a-table
        :columns="columns"
        :locale="locale"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
        :loading="isLoading"
      >
        <template slot="action" slot-scope="record">
          <div class="template-table-actions">
            <app-checkbox
              :item="record"
              @check="handleCheckedTemplate"
              @uncheck="handleUncheckedTemplate"
            />
            <a-dropdown placement="bottomLeft" :trigger="['click']">
              <a
                class="template-table-actions__dropdown"
                @click="(e) => e.preventDefault()"
              >
                <i class="fas fa-ellipsis-v"></i>
              </a>
              <a-menu slot="overlay">
                <a-menu-item key="edit">
                  <a
                    rel="noopener noreferrer"
                    class="template-table-actions__dropdown--item"
                    @click="handleOpenEditTemplate(record)"
                  >
                    {{ $t('edit') }}
                  </a>
                </a-menu-item>
                <a-menu-item key="delete">
                  <a
                    rel="noopener noreferrer"
                    class="template-table-actions__dropdown--item"
                    @click="handleOpenDeleteTemplate(record)"
                  >
                    {{ $t('delete') }}
                  </a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </template>
        <template slot="response" slot-scope="response">
          <a-tooltip
            overlay-class-name="custom-tooltip-light"
            placement="bottomLeft"
          >
            <template slot="title">{{ response }}</template>
            {{ response }}
          </a-tooltip>
        </template>
        <template v-if="templates.length" #footer>
          <app-pagination :page="page" :page-size="limit" :total="total" />
        </template>
      </a-table>
    </div>
    <component
      :is="isTypeComponent"
      :is-show="isShowEditTemplate"
      :templates="templates"
      :template-edit="templateEdit"
      @reload="$emit('reload')"
      @close="handleCloseEditTemplate"
    ></component>
    <app-modal
      ref="modalDeleteTemplate"
      type="danger"
      @confirm="handleConfirmDeleteTemplate"
    >
      <template #title> {{ $t('delete') }} </template>
      <template #content>{{ $t('content-delete-template') }} </template>
    </app-modal>
    <app-modal
      ref="modalMultipleDeleteTemplates"
      type="danger"
      @confirm="handleConfirmMultipleDeleteTemplates"
    >
      <template #title> {{ $t('delete') }} </template>
      <template #content>{{ $t('content-delete-templates') }} </template>
    </app-modal>
  </div>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
import { convertUTCToLocal } from '@/utils/moment'
import TemplateEditNormal from '@/components/Setting/Template/Edit/TemplateEditNormal'
import TemplateEditAuto from '@/components/Setting/Template/Edit/TemplateEditAuto'
Vue.use(notification)

export default {
  name: 'TemplatesTable',
  components: {
    'edit-normal': TemplateEditNormal,
    'edit-auto': TemplateEditAuto,
  },
  props: {
    templates: {
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
    typeTemplate: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      page: 1,
      limit: this.$store.state.limit,
      isTypeComponent: '',
      isShowEditTemplate: false,
      templateEdit: {},
      deleteTemplateId: null,
      selectedRows: [],
      sort: '-updated_at',
      columns: [
        {
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
        {
          title: this.$t('template-name'),
          key: 'name',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: this.$t('response-preview'),
          key: 'response',
          dataIndex: 'response',
          scopedSlots: { customRender: 'response' },
          ellipsis: true,
        },
        {
          title: this.$t('last-edited'),
          key: 'date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' },
          sorter: (a, b, sortOrder) => {
            this.sort = sortOrder === 'ascend' ? 'updated_at' : '-updated_at'
            return new Date(a.updated_at) - new Date(b.updated_at)
          },
          align: 'right',
          defaultSortOrder: 'descend',
        },
      ],
    }
  },
  computed: {
    dataSource() {
      return this.templates.map((item) => {
        const template = {
          ...item,
          key: item.id,
          date: convertUTCToLocal(item.updated_at, 'HH:mm DD/MM/YYYY'),
        }
        return template
      })
    },
    locale() {
      return {
        emptyText: <app-no-data text={this.$t('no-data-template')} />,
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
    handleCheckedTemplate(template) {
      this.selectedRows = this.selectedRows.includes(template.id)
        ? this.selectedRows
        : [...this.selectedRows, template.id]
    },
    handleUncheckedTemplate(template) {
      this.selectedRows = this.selectedRows.filter(
        (item) => item !== template.id
      )
    },
    handleOpenEditTemplate(template) {
      this.isShowEditTemplate = true
      this.isTypeComponent = this.typeTemplate
      this.templateEdit = { ...template }
    },
    handleCloseEditTemplate() {
      this.isShowEditTemplate = false
      this.isTypeComponent = ''
    },
    handleOpenDeleteTemplate(template) {
      this.$refs.modalDeleteTemplate.show()
      this.deleteTemplateId = template.id
    },
    async handleConfirmDeleteTemplate() {
      try {
        if (!this.deleteTemplateId) return
        const payload = {
          response_template_ids: [this.deleteTemplateId],
        }
        const { data } = await this.$api.responseTemplate.deleteTemplate(
          payload
        )
        if (data) {
          this.$emit('reload')
          this.$refs.modalDeleteTemplate.hide()
          notification.success({
            message: `${this.$t('success')}!`,
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
    handleOpenMultipleDeleteTemplates() {
      this.$refs.modalMultipleDeleteTemplates.show()
    },
    async handleConfirmMultipleDeleteTemplates() {
      try {
        if (!this.selectedRows.length) return
        const payload = {
          response_template_ids: [...this.selectedRows],
        }
        const { data } = await this.$api.responseTemplate.deleteTemplate(
          payload
        )
        if (data) {
          this.$emit('reload')
          this.$refs.modalMultipleDeleteTemplates.hide()
          notification.success({
            message: `${this.$t('success')}!`,
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
.template-table {
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
                  width: 6%;
                }
                &:nth-child(2) {
                  width: 15%;
                }
                &:nth-child(4) {
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

.template-table-actions {
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

.template-table-tag {
  /deep/.app-tag {
    width: fit-content;
    margin: 5px auto;
  }
}
</style>
