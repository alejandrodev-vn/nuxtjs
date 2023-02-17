<template>
  <div class="staff-table">
    <div class="staff-table__header">
      <div class="staff-table__header--selected">
        {{ $t('selected') }}: {{ selectedRows.length }}/{{ total }}
      </div>
      <a-button
        type="link"
        icon="delete"
        :disabled="!selectedRows.length"
        class="staff-table__header--button"
        @click="handleOpenDeleteStaffs"
      >
        {{ $t('delete') }}
      </a-button>
    </div>
    <div class="staff-table__body">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
        :loading="loading"
      >
        <template slot="action" slot-scope="record">
          <div class="staff-table-actions">
            <app-checkbox
              :item="record"
              :disabled="
                record.is_owner || (!isOwner && userId !== record.createdBy)
              "
              @check="handleCheckedStaff"
              @uncheck="handleUncheckedStaff"
            />
            <a-dropdown
              placement="bottomLeft"
              :trigger="['click']"
              :disabled="
                record.is_owner || (!isOwner && userId !== record.createdBy)
              "
              :style="{
                cursor:
                  record.is_owner || (!isOwner && userId !== record.createdBy)
                    ? 'not-allowed'
                    : '',
              }"
            >
              <a
                class="staff-table-actions__dropdown"
                @click="(e) => e.preventDefault()"
              >
                <i class="fas fa-ellipsis-v"></i>
              </a>
              <a-menu slot="overlay">
                <a-menu-item v-if="record.status === 1" key="edit">
                  <a
                    rel="noopener noreferrer"
                    class="staff-table-actions__dropdown--item"
                    @click="handleOpenEditStaff(record)"
                  >
                    {{ $t('edit') }}
                  </a>
                </a-menu-item>
                <a-menu-item key="delete">
                  <a
                    rel="noopener noreferrer"
                    class="staff-table-actions__dropdown--item"
                    @click="handleOpenDeleteStaff(record)"
                  >
                    {{ $t('delete') }}
                  </a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
            <app-switch
              :ref="`appSwitch-${record.id}`"
              :checked="record.status === 1"
              :item="record"
              :title="getTitleAppSwitch(record.status)"
              :content="getContentAppSwitch(record.status)"
              :disabled="
                record.is_owner || (!isOwner && userId !== record.createdBy)
              "
              :style="{
                cursor:
                  record.is_owner || (!isOwner && userId !== record.createdBy)
                    ? 'not-allowed'
                    : '',
              }"
              @confirm="handleUpdateStaffStatus"
            />
          </div>
        </template>
        <template slot="name" slot-scope="name, record">
          <div class="staff-table-name">
            <app-avatar
              :image="record.image"
              :full-name="record.name"
              class="staff-table-name__avatar"
            />
            <div class="staff-table-name__title">{{ name }}</div>
          </div>
        </template>
        <template slot="assignment" slot-scope="assignment, record">
          <a-popover v-if="record.channels.length" placement="right">
            <template slot="content">
              <template v-for="(channel, index) in record.channels">
                <div :key="index" class="staff-table-assignment">
                  <img
                    :src="
                      require(`~/assets/images/Icon/Icon-${channel.type}.png`)
                    "
                    alt="Prime CRM"
                    class="staff-table-assignment__icon"
                  />
                  <div class="staff-table-assignment__name">
                    {{ channel.name }}
                  </div>
                </div>
              </template>
            </template>
            <span class="cursor-pointer">
              {{ assignment }}
            </span>
          </a-popover>
          <div v-else>{{ assignment }}</div>
        </template>
        <template slot="date" slot-scope="date, record">
          <div class="text-right">
            <span
              v-if="record.is_verify === 0"
              class="resend-invitation"
              @click="handleResendInvitation(record)"
            >
              <a-icon type="sync" class="mr-1" />
              {{ $t('resend-invitation') }}
            </span>
            <span v-else>
              {{ date }}
            </span>
          </div>
        </template>
        <template #footer>
          <app-pagination :page="page" :page-size="limit" :total="total" />
        </template>
      </a-table>
    </div>

    <component
      :is="isTypeComponent"
      :is-show="isShowEditStaff"
      :channels="channels"
      :staff="staffEdit"
      @reload="$emit('reload')"
      @close="handleCloseEditStaff"
    ></component>
    <app-modal
      ref="modalDeleteStaff"
      type="danger"
      @confirm="handleConfirmDeleteStaff"
    >
      <template #title> {{ $t('delete') }} </template>
      <template #content>{{ $t('content-delete-staff') }} </template>
    </app-modal>
    <app-modal
      ref="modalDeleteStaffs"
      type="danger"
      @confirm="handleConfirmDeleteStaffs"
    >
      <template #title> {{ $t('delete') }} </template>
      <template #content>{{ $t('content-delete-staffs') }} </template>
    </app-modal>
  </div>
</template>

<script>
import { get } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { convertUTCToLocal } from '@/utils/moment'
import StaffEdit from '@/components/Setting/Staff/StaffEdit'
Vue.use(notification)

export default {
  name: 'StaffTable',
  components: {
    edit: StaffEdit,
  },
  props: {
    channels: {
      type: Array,
      default: () => [],
    },
    staffs: {
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
      page: 1,
      limit: this.$store.state.limit,
      isTypeComponent: '',
      isShowEditStaff: false,
      staffEdit: {},
      staffDelete: {},
      columns: [
        {
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
        {
          title: this.$t('full-name'),
          key: 'name',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: this.$t('email'),
          key: 'email',
          dataIndex: 'email',
          scopedSlots: { customRender: 'email' },
        },
        {
          title: this.$t('phone'),
          key: 'phone',
          dataIndex: 'phone',
          scopedSlots: { customRender: 'phone' },
          align: 'center',
        },
        {
          title: this.$t('assignment'),
          key: 'assignment',
          dataIndex: 'assignment',
          scopedSlots: { customRender: 'assignment' },
          align: 'right',
        },
        {
          title: this.$t('role'),
          key: 'role',
          dataIndex: 'role',
          scopedSlots: { customRender: 'role' },
          align: 'center',
        },
        {
          title: this.$t('added-by'),
          key: 'createdByName',
          dataIndex: 'createdByName',
          scopedSlots: { customRender: 'createdByName' },
        },
        {
          title: this.$t('last-login'),
          key: 'date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' },
          sorter: true,
          align: 'right',
        },
      ],
      selectedRows: [],
    }
  },
  computed: {
    isOwner() {
      return (
        this.$auth.user?.roles?.length && this.$auth.user.roles[0] === 'owner'
      )
    },
    userId() {
      return this.$auth.user.id
    },
    dataSource() {
      return this.staffs.map((item) => {
        const role = get(item, 'roles[0]', '') || ''
        const channels = get(item, 'social_channels.data', []) || []
        const pages = channels.map((channel) => {
          return {
            type: get(channel, 'channel_type.data.code', '') || '',
            name: channel.name,
          }
        })
        const staff = {
          key: item.id,
          id: item.id,
          status: item.is_active,
          image: item.profile_picture,
          name: item.name,
          email: item.email,
          phone: item.phone ? item.phone : '--',
          assignment: item.assignment_count,
          channels: pages,
          role: this.$t(role),
          is_owner: item.is_owner_sso,
          is_verify: item.is_verify,
          createdByName: item.created_by_name ? item.created_by_name : '--',
          createdBy: item.created_by,
          date: item.last_login_at
            ? convertUTCToLocal(item.last_login_at, 'HH:mm DD/MM/YYYY')
            : '--',
        }
        return staff
      })
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
    getTitleAppSwitch(status) {
      if (status === 1) {
        return this.$t('deactive')
      }
      return this.$t('active')
    },
    getContentAppSwitch(status) {
      if (status === 1) {
        return this.$t('content-deactivate-staff')
      }
      return this.$t('content-activate-staff')
    },
    handleCheckedStaff(staff) {
      this.selectedRows = this.selectedRows.includes(staff.id)
        ? this.selectedRows
        : [...this.selectedRows, staff.id]
    },
    handleUncheckedStaff(staff) {
      this.selectedRows = this.selectedRows.filter((item) => item !== staff.id)
    },
    handleOpenEditStaff(staff) {
      this.isShowEditStaff = true
      this.isTypeComponent = 'edit'
      this.staffEdit = { ...staff }
    },
    handleCloseEditStaff() {
      this.isShowEditStaff = false
      this.isTypeComponent = ''
    },
    handleOpenDeleteStaff(staff) {
      this.$refs.modalDeleteStaff.show()
      this.staffDelete = { ...staff }
    },
    async handleConfirmDeleteStaff() {
      try {
        const payload = {
          user_ids: [this.staffDelete.id],
        }
        const { data } = await this.$api.user.deleteStaffs(payload)
        if (data) {
          this.$emit('reload')
          this.$refs.modalDeleteStaff.hide()
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
          })
        }
      } catch (e) {}
    },
    handleOpenDeleteStaffs() {
      this.$refs.modalDeleteStaffs.show()
    },
    async handleConfirmDeleteStaffs() {
      try {
        const payload = {
          user_ids: [...this.selectedRows],
        }
        const { data } = await this.$api.user.deleteStaffs(payload)
        if (data) {
          this.$emit('reload')
          this.$refs.modalDeleteStaffs.hide()
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
          })
        }
      } catch (e) {}
    },
    async handleUpdateStaffStatus(staff) {
      try {
        const payload = {
          name: staff.name,
          is_active: staff.status === 1 ? 0 : 1,
        }
        const { data } = await this.$api.user.updateUser(staff.id, payload)
        if (data) {
          this.$emit('reload')
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
          })
        }
      } catch (e) {
        notification.error({
          message: `${e.response.data.message}`,
          class: 'notification-error',
        })
      } finally {
        this.$refs[`appSwitch-${staff.id}`].handleCloseModal()
      }
    },
    async handleResendInvitation(staff) {
      try {
        const payload = {
          email: staff.email,
        }
        const { data } = await this.$api.user.reAddStaff(staff.id, payload)

        if (data) {
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
          })
        }
      } catch (e) {}
    },
  },
}
</script>

<style lang="less" scoped>
.staff-table {
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
        color: @gray-3;
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
                @apply font-medium;
                &:first-child {
                  width: 10%;
                }
                &:nth-child(2) {
                  width: 18rem;
                }
                &:nth-child(3) {
                  width: 20rem;
                }
                &:nth-child(7) {
                  width: 15rem;
                }
              }
            }
          }
          tbody {
            tr {
              height: @height-table;
              td {
                padding-inline: @padding-8;
                font-size: @size-14;
                color: @color-table;
              }
            }
          }
        }
      }
    }
  }
}

.staff-table-actions {
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

.staff-table-name {
  @apply flex items-center;
  &__avatar {
    flex: 0 0 @size-32;
    width: @size-32;
    height: @size-32;
    object-fit: cover;
    border-radius: 50%;
    background-color: @primary-3;
    color: @primary;
    font-size: @size-12;
    line-height: 1;
    @apply flex items-center justify-center font-semibold;
  }
  &__title {
    margin: 0 0.75rem;
  }
}

.staff-table-assignment {
  margin: 1rem 0;
  @apply flex items-center;

  &__icon {
    flex: 0 0 @size-24;
    width: @size-24;
    height: @size-24;
    object-fit: contain;
    margin-right: 0.5rem;
  }
}

.resend-invitation {
  color: @primary;
  @apply flex items-center justify-end cursor-pointer;
}
</style>
