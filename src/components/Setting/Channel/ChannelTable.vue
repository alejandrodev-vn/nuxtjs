<template>
  <div class="channel-table">
    <div v-if="false" class="channel-table__header">
      <div class="channel-table__header--selected">
        {{ $t('selected') }}: {{ selectedRows.length }}/{{ total }}
      </div>
      <a-button
        type="link"
        icon="delete"
        :disabled="!selectedRows.length"
        class="channel-table__header--button"
        @click="handleOpenDeleteChannels"
      >
        {{ $t('delete') }}
      </a-button>
    </div>
    <div class="channel-table__body">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
        :locale="locale"
      >
        <template slot="action" slot-scope="record">
          <div class="channel-table-actions">
            <!-- <app-checkbox
              :item="record"
              :disabled="record.tokenStatus === 2"
              @check="handleCheckedChannel"
              @uncheck="handleUncheckedChannel"
            />
            <a-dropdown
              placement="bottomLeft"
              :trigger="['click']"
              :disabled="record.tokenStatus === 2"
              :style="{
                cursor: record.tokenStatus === 2 ? 'not-allowed' : '',
              }"
            >
              <a
                class="channel-table-actions__dropdown"
                @click="(e) => e.preventDefault()"
              >
                <i class="fas fa-ellipsis-v"></i>
              </a>
              <a-menu slot="overlay">
                <a-menu-item key="delete">
                  <a
                    rel="noopener noreferrer"
                    class="channel-table-actions__dropdown--item"
                    @click="handleOpenDeleteChannel(record)"
                  >
                    {{ $t('delete') }}
                  </a>
                </a-menu-item>
              </a-menu>
            </a-dropdown> -->
            <app-switch
              :ref="`appSwitch-${record.id}`"
              :checked="record.status === 1"
              :item="record"
              :title="getTitleAppSwitch(record.status)"
              :content="getContentAppSwitch(record.status)"
              :disabled="
                record.tokenStatus === configChannel.token_status.deactive
              "
              :style="{
                cursor:
                  record.tokenStatus === configChannel.token_status.deactive
                    ? 'not-allowed'
                    : '',
              }"
              @confirm="handleUpdateChannelStatus"
            />
          </div>
        </template>
        <template slot="channel" slot-scope="channel">
          <div class="channel-table-channel">
            <img
              :src="require(`~/assets/images/Icon/Icon-${channel}.png`)"
              alt="Prime CRM"
              class="channel-table-channel__icon"
            />
          </div>
        </template>
        <template slot="tokenStatus" slot-scope="tokenStatus">
          <a-tooltip
            v-if="tokenStatus === configChannel.token_status.active"
            overlay-class-name="custom-tooltip-light"
            placement="right"
          >
            <template slot="title">
              <span>{{ $t('token-status-success') }}</span>
            </template>
            <icon-success style="margin-inline: auto" />
          </a-tooltip>
          <a-tooltip
            v-else
            overlay-class-name="custom-tooltip-light"
            placement="right"
          >
            <template slot="title">
              <span>{{ $t('token-status-error') }}</span>
            </template>
            <icon-warning-red style="margin-inline: auto" />
          </a-tooltip>
        </template>
        <template slot="setup" slot-scope="record">
          <app-tag
            :type="
              record.status === configChannel.status.handle
                ? 'primary-status-order'
                : 'dark'
            "
            :pointer="record.status === configChannel.status.handle"
            class="inline-block"
            @click="handleOpenSetup(record)"
          >
            <span>{{ $t('set-up') }}</span>
          </app-tag>
        </template>
        <template v-if="channels.length" #footer>
          <app-pagination :page="page" :page-size="limit" :total="total" />
        </template>
      </a-table>
    </div>

    <app-modal
      ref="modalDeleteChannel"
      type="danger"
      @confirm="handleConfirmDeleteChannel"
    >
      <template #title> {{ $t('delete') }} </template>
      <template #content>
        <p class="mb-0">{{ $t('content-delete-channel') }}</p>
        <p>{{ $t('note-delete-channel-account') }}</p>
      </template>
    </app-modal>
    <app-modal
      ref="modalDeleteChannels"
      type="danger"
      @confirm="handleConfirmDeleteChannels"
    >
      <template #title> {{ $t('delete') }} </template>
      <template #content>
        <p class="mb-0">{{ $t('content-delete-channels') }}</p>
        <p>{{ $t('note-delete-channel-account') }}</p>
      </template>
    </app-modal>
    <channel-setup
      :visible="isVisibleSetup"
      :selected-channel-id="selectedChannelId"
      :selected-channel-data="selectedChannelData"
      @close="handleCloseSetup"
      @changeChannel="handleChangeChannel"
    />
  </div>
</template>

<script>
import { get } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { convertUTCToLocal } from '@/utils/moment'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'ChannelTable',
  props: {
    channels: {
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
      isVisibleSetup: false,
      channelDelete: {},
      selectedChannelId: null,
      selectedChannelData: {},
      columns: [
        {
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
        {
          title: this.$t('account-ID'),
          key: 'id',
          dataIndex: 'id',
          scopedSlots: { customRender: 'id' },
        },
        {
          title: this.$t('account-name'),
          key: 'name',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: this.renderTitleChannel(
            this.$t('channel'),
            this.$t('tooltip-add-channel')
          ),
          key: 'channel',
          dataIndex: 'channel',
          scopedSlots: { customRender: 'channel' },
          align: 'left',
        },
        {
          title: this.$t('status'),
          key: 'tokenStatus',
          dataIndex: 'tokenStatus',
          scopedSlots: { customRender: 'tokenStatus' },
          align: 'center',
        },
        {
          title: this.$t('added-by'),
          key: 'by',
          dataIndex: 'by',
          scopedSlots: { customRender: 'by' },
          sorter: true,
          align: 'right',
        },
        {
          title: this.$t('added-date'),
          key: 'date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' },
          sorter: true,
          align: 'right',
        },
        {
          title: this.$t('action'),
          key: 'setup',
          scopedSlots: { customRender: 'setup' },
          align: 'center',
        },
      ],
      selectedRows: [],
    }
  },
  computed: {
    configChannel() {
      return this.$store.state.configChannel
    },
    channelOptions() {
      return this.channels.map((item) => {
        return {
          key: item.social_channel_id,
          name: item.name,
          type: item.channel_type?.data?.code || '',
        }
      })
    },
    dataSource() {
      return this.channels.map((item) => {
        const channel = {
          config: JSON.parse(item.config),
          key: item.social_channel_id,
          id: item.social_id,
          status: item.status,
          name: item.name,
          channel: get(item, 'channel_type.data.code', '') || '',
          by: get(item, 'user.data.name', '') || '',
          date: convertUTCToLocal(item.created_at, 'HH:mm DD/MM/YYYY'),
          used_channel_id: item.used_channel_id,
          access_token: item.access_token,
          social_image: item.avatar,
          tokenStatus: item.token_status,
          social_channel_id: item.social_channel_id,
        }
        return channel
      })
    },
    locale() {
      return {
        emptyText: <app-no-data text={this.$t('no-date-channel-account')} />,
      }
    },
    configTypeChannel() {
      return {
        facebook: 'fb',
        instagram: 'ig',
        shopee: 'shopee',
      }
    },
  },
  watch: {
    '$route.query': {
      handler(query) {
        const { page = 1, limit = this.$store.state.limit } = query
        this.page = Number(page)
        this.limit = Number(limit)
      },
    },
  },
  methods: {
    handleChangeChannel(channelId) {
      this.selectedChannelId = channelId
      const findChannel = this.dataSource.find(
        (channel) => channel.social_channel_id === channelId
      )
      if (!findChannel) return
      this.selectedChannelData = { ...findChannel }
    },
    handleOpenSetup(channel) {
      if (channel.status !== this.configChannel.status.handle) return
      this.selectedChannelId = channel.social_channel_id
      this.selectedChannelData = { ...channel }
      this.isVisibleSetup = true
    },
    handleCloseSetup() {
      this.selectedChannelId = null
      this.selectedChannelData = {}
      this.isVisibleSetup = false
      this.$emit('reload')
    },
    renderTitleChannel(title, description) {
      return (
        <div class="flex items-center justify-center">
          <span class="mr-2">{title}</span>
          <a-tooltip overlay-class-name="custom-tooltip-light">
            <template slot="title">{description}</template>
            <a-icon type="info-circle" />
          </a-tooltip>
        </div>
      )
    },
    getTitleAppSwitch(status) {
      if (status === 1) {
        return this.$t('deactive')
      }
      return this.$t('active')
    },
    getContentAppSwitch(status) {
      if (status === 1) {
        return this.$t('content-deactivate-channel')
      }
      return this.$t('content-activate-channel')
    },
    handleCheckedChannel(channel) {
      this.selectedRows = this.selectedRows.includes(channel.key)
        ? this.selectedRows
        : [...this.selectedRows, channel.key]
    },
    handleUncheckedChannel(channel) {
      this.selectedRows = this.selectedRows.filter(
        (item) => item !== channel.key
      )
    },
    handleOpenDeleteChannel(channel) {
      this.$refs.modalDeleteChannel.show()
      this.channelDelete = { ...channel }
    },
    async handleConfirmDeleteChannel() {
      try {
        const payload = {
          social_channel_ids: [this.channelDelete.key],
        }
        const { data } = await this.$api.socialChannel.deleteSocialChannels(
          payload
        )
        if (data) {
          this.$emit('reload')
          this.$refs.modalDeleteChannel.hide()
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
        this.$refs.modalDeleteChannel.hide()
      }
    },
    handleOpenDeleteChannels() {
      this.$refs.modalDeleteChannels.show()
    },
    async handleConfirmDeleteChannels() {
      try {
        const payload = {
          social_channel_ids: [...this.selectedRows],
        }
        const { data } = await this.$api.socialChannel.deleteSocialChannels(
          payload
        )
        if (data) {
          this.$emit('reload')
          this.$refs.modalDeleteChannels.hide()
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
        this.$refs.modalDeleteChannels.hide()
      }
    },
    handleUpdateChannelStatus(channel) {
      if (channel.status === 1) {
        this.handleStopChannel(channel)
      } else {
        this.handleStartChannel(channel)
      }
    },
    async handleStartChannel(channel) {
      try {
        const payload = {
          name: channel.name,
          social_id: channel.id,
          oauth_info: {
            access_token: channel.access_token,
          },
          ...(channel.channel !== 'shopee' && {
            used_channel_id: channel.used_channel_id,
          }),
          ...(channel.channel !== 'shopee' && {
            social_image: channel.social_image,
          }),
        }
        const type = this.configTypeChannel[channel.channel]
        if (channel.channel === 'shopee') {
          await this.$api.socialChannel.startHandleShopee(payload, type)
        } else {
          await this.$api.socialChannel.startHandlePage(payload, type)
        }

        this.$emit('reload')
        this.$refs[`appSwitch-${channel.id}`].handleCloseModal()
        notification.success({
          message: this.$t('activated-success'),
          class: 'notification-success',
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
        this.$refs[`appSwitch-${channel.id}`].handleCloseModal()
      }
    },
    async handleStopChannel(channel) {
      try {
        const type = this.configTypeChannel[channel.channel]
        await this.$api.socialChannel.stopHandlePage(channel.key, type)

        this.$emit('reload')
        this.$refs[`appSwitch-${channel.id}`].handleCloseModal()
        notification.success({
          message: this.$t('deactivated-success'),
          class: 'notification-success',
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
        this.$refs[`appSwitch-${channel.id}`].handleCloseModal()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.channel-table {
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
                font-size: @size-14;
                font-weight: 500;
                color: @color-table;
                &:first-child {
                  width: 10%;
                }
              }
            }
          }
          tbody {
            tr {
              height: @height-table;
              td {
                padding: @padding-8;
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

.channel-table-actions {
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

.channel-table-channel {
  @apply flex items-center justify-center;

  &__icon {
    flex: 0 0 @size-32;
    width: @size-32;
    height: @size-32;
    object-fit: contain;
  }
}
</style>
