<template>
  <a-drawer
    width="30vw"
    :closable="false"
    :visible="isShow"
    class="staff-edit"
    @close="handleClose"
  >
    <span class="staff-edit__close" @click="handleClose">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <div class="staff-edit__content">
      <div v-if="$fetchState.pending" class="mt-8">
        <app-loading />
      </div>
      <div v-else class="staff-edit-content">
        <div class="staff-edit-content__title">
          {{ $t('edit-staff') }}
        </div>
        <div class="staff-edit-content__form">
          <a-form-model ref="form" :model="form" :rules="rules" :colon="false">
            <a-form-model-item ref="name" prop="name" :label="$t('full-name')">
              <a-input v-model="form.name" :placeholder="$t('placeholder')" />
            </a-form-model-item>
            <a-form-model-item ref="email" prop="email">
              <label class="flex items-center custom-label">
                <span> {{ $t('login-email') }} </span>
                <a-tooltip overlay-class-name="custom-tooltip-light">
                  <template slot="title">
                    {{ $t('tooltip-add-staff-login-email') }}
                  </template>
                  <a-icon type="info-circle" class="cursor-help ml-2" />
                </a-tooltip>
              </label>
              <a-input
                v-model="form.email"
                :placeholder="$t('placeholder')"
                disabled
              />
            </a-form-model-item>
            <a-form-model-item ref="role" :label="$t('role')" prop="role">
              <a-radio-group v-model="form.role" @change="handleChangeRole">
                <a-radio
                  v-for="(role, index) in roleOptions"
                  :key="index"
                  :value="role.value"
                >
                  {{ role.label }}
                </a-radio>
              </a-radio-group>
            </a-form-model-item>

            <a-form-model-item
              ref="permission"
              :label="$t('permission')"
              prop="permission"
            >
              <a-checkbox-group v-model="form.permissions">
                <a-row
                  v-for="(permission, index) in permissionOptions"
                  :key="index"
                >
                  <a-checkbox
                    :disabled="permission.disabled"
                    :value="permission.value"
                  >
                    {{ permission.label }}
                  </a-checkbox>
                </a-row>
              </a-checkbox-group>
            </a-form-model-item>
            <a-form-model-item ref="assignment" prop="assignment">
              <label class="flex items-center label--bold">
                <span> {{ $t('assignment') }} </span>
                <a-tooltip overlay-class-name="custom-tooltip-light">
                  <template slot="title">
                    {{ $t('tooltip-add-staff-assignment') }}
                  </template>
                  <a-icon type="info-circle" class="cursor-help ml-2" />
                </a-tooltip>
              </label>
              <label class="custom-label">
                {{ $t('assigned-page-account') }}
              </label>
              <staff-select-channel
                :channels="channels"
                :ids="checkedChannelIds"
                @input="handleUpdateChannelIds"
              >
                <template #title>
                  {{ $t('channel-account') }}
                </template>
              </staff-select-channel>
            </a-form-model-item>
          </a-form-model>
        </div>
        <div class="staff-edit-content__actions">
          <a-button @click="handleClose">
            {{ $t('cancel') }}
          </a-button>
          <a-button type="primary" :disabled="loading" @click="handleSave">
            <a-icon v-if="loading" type="loading" />
            {{ $t('save') }}
          </a-button>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { get, uniq } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'StaffEdit',
  fetchOnServer: false,
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    channels: {
      type: Array,
      default: () => [],
    },
    staff: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      roles: ['manager', 'member', 'client'],
      permissions: {
        manager: ['analytics', 'setting', 'conversation'],
        member: ['conversation'],
        client: [],
      },
      channelIds: [],
      checkedChannelIds: [],
      form: {
        name: '',
        email: '',
        role: '',
        permissions: [],
      },
      rules: {
        name: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          {
            min: 2,
            max: 20,
            message: this.$t('full-name-min-max-length-required'),
            trigger: 'blur',
          },
        ],
        email: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          {
            // eslint-disable-next-line no-useless-escape
            pattern: /^\w+([\.+-]?\w+)*@\w+([\.+-]?\w+)*(\.\w{2,9})+$/,
            // pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: this.$t('email-format-required'),
            trigger: 'blur',
          },
        ],
      },
    }
  },
  async fetch() {
    await this.fetchStaff()
  },
  computed: {
    roleOptions() {
      return this.roles.map((item) => {
        return {
          label: this.$t(item),
          value: item,
        }
      })
    },
    permissionOptions() {
      const permissions = uniq([
        ...this.permissions.manager,
        ...this.permissions.member,
      ])
      return permissions.map((item) => {
        return {
          label: this.$t(item),
          value: item,
          disabled:
            !this.permissions[this.form.role].includes(item) ||
            !this.$auth.user.permissions.includes(item),
        }
      })
    },
  },
  methods: {
    async fetchStaff() {
      try {
        const params = {
          include: 'permissions,social_channels',
        }
        const { data } = await this.$api.user.getStaffDetail(
          this.staff.id,
          params
        )
        if (data) {
          this.form.name = data.name
          this.form.email = data.email
          this.form.role = get(data, 'roles[0]', '') || ''

          const permissions = data.permissions.filter((item) => {
            return this.permissions[this.form.role].includes(item)
          })

          this.form.permissions = [...permissions]

          const channels = get(data, 'social_channels.data', []) || []
          this.checkedChannelIds = channels.map((item) => {
            return item.social_channel_id
          })
        }
      } catch (e) {}
    },
    handleClose() {
      this.$emit('close')
    },
    handleChangeRole(e) {
      const role = e.target.value
      this.form.permissions = this.permissions[role].filter((item) =>
        this.$auth.user.permissions.includes(item)
      )
    },
    handleUpdateChannelIds(ids) {
      this.channelIds = [...ids]
    },
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.handleSubmit()
        }
      })
    },
    async handleSubmit() {
      this.loading = true
      try {
        const payload = {
          name: this.form.name,
          email: this.form.email,
          roles: [this.form.role === 'client' ? 'supervisor' : this.form.role],
          permissions: ['home', ...this.form.permissions],
          social_channel_ids: [...this.channelIds],
        }

        const { data } = await this.$api.user.updateStaff(
          this.staff.id,
          payload
        )

        if (data) {
          this.$emit('reload')
          this.handleClose()
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
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
  },
}
</script>

<style lang="less" scoped>
.staff-edit {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    cursor: pointer;
    z-index: 10;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }

  &.ant-drawer-open {
    /deep/ .ant-drawer-content {
      @apply overflow-visible;
      .ant-drawer-body {
        height: 100%;
        padding: 0;
        @apply overflow-auto;
      }
    }
  }
}

.staff-edit-content {
  min-height: 100vh;
  padding: @padding-40 @padding-24;
  @apply relative;

  &__title {
    color: @black;
    font-size: @size-20;
    margin-bottom: 1rem;
    @apply font-semibold;
  }
  &__form {
    .label {
      &--bold {
        color: @black;
        font-size: @size-16;
        @apply flex items-center font-medium;
      }
    }
    /deep/.ant-checkbox {
      &.ant-checkbox-checked {
        color: @black;
      }
    }
    /deep/.ant-radio-wrapper {
      color: @black;
      @apply font-medium;
    }
  }
  &__actions {
    width: 100%;
    left: 0;
    bottom: 0;
    background-color: @white;
    padding: 1rem 1.5rem;
    box-shadow: 8px 0 24px rgba(25, 32, 56, 0.04);
    @apply absolute text-right;
  }
}
</style>
