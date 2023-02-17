<template>
  <a-drawer
    width="30vw"
    :closable="false"
    :visible="isShow"
    class="staff-add"
    @close="handleClose"
  >
    <span class="staff-add__close" @click="handleClose">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <div class="staff-add__content">
      <div class="staff-add-content">
        <div class="staff-add-content__title">
          {{ $t('add-staff') }}
        </div>
        <div class="staff-add-content__form">
          <a-form-model ref="form" :model="form" :rules="rules" :colon="false">
            <a-form-model-item ref="name" prop="name" :label="$t('full-name')">
              <a-input v-model="form.name" :placeholder="$t('placeholder')" />
            </a-form-model-item>
            <a-form-model-item
              ref="email"
              prop="email"
              :style="{ marginBottom: 0 }"
            >
              <label class="flex items-center custom-label">
                <span> {{ $t('login-email') }} </span>
                <a-tooltip overlay-class-name="custom-tooltip-light">
                  <template slot="title">
                    {{ $t('tooltip-add-staff-login-email') }}
                  </template>
                  <a-icon type="info-circle" class="cursor-help ml-2" />
                </a-tooltip>
              </label>
              <a-input v-model="form.email" :placeholder="$t('placeholder')" />
              <small>
                {{
                  $t(
                    'a-new-joining-notice-will-be-sent-to-members-via-this-email'
                  )
                }}
              </small>
            </a-form-model-item>
            <a-form-model-item
              ref="role"
              prop="role"
              :style="{ marginBottom: 0 }"
            >
              <label class="label--bold">
                {{ $t('role') }}
              </label>
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
              prop="permission"
              :style="{ marginBottom: 0 }"
            >
              <label class="label--bold">
                {{ $t('permission') }}
              </label>
              <a-checkbox-group v-model="form.permissions">
                <a-row
                  v-for="(permission, index) in permissionOptions"
                  :key="index"
                >
                  <a-checkbox
                    :checked="form.permissions.includes(permission)"
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
                @input="handleUpdateChannelIds"
              />
            </a-form-model-item>
          </a-form-model>
        </div>
        <div class="staff-add-content__actions">
          <a-button @click="handleClose">
            {{ $t('cancel') }}
          </a-button>
          <a-button type="primary" :disabled="loading" @click="handleSave">
            <a-icon v-if="loading" type="loading" />
            {{ $t('send-invitation') }}
          </a-button>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { uniq } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'StaffAdd',
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    channels: {
      type: Array,
      default: () => [],
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
      form: {
        name: '',
        email: '',
        role: 'manager',
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
  mounted() {
    this.form = {
      ...this.form,
      permissions: this.permissions.manager.filter((item) =>
        this.$auth.user.permissions.includes(item)
      ),
    }
  },
  methods: {
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
          permissions: [
            'home',
            ...this.form.permissions.map((item) => item.replace(' ', '_')),
          ],
          social_channel_ids: [...this.channelIds],
        }
        const { data } = await this.$api.user.addStaff(payload)
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
.staff-add {
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

.staff-add-content {
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
