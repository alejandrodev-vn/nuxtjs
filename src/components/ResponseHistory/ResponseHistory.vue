<template>
  <div class="response-history">
    <div class="response-history__header">
      <div class="response-history__filters">
        <div class="response-history__filters__left">
          <a-input
            :value="filter.search"
            size="large"
            allow-clear
            :disabled="isLoading"
            :loading="isLoading"
            :placeholder="$t('search-by-fan-name-or-response-text')"
            @pressEnter="handleSearchGuest"
            @change="onChangeSearch"
          >
            <a-icon slot="prefix" type="search" />
          </a-input>
          <a-select
            v-model="filter.socialChannelId"
            size="large"
            class="custom-select"
            dropdown-class-name="response-history__social-channels"
            :loading="isLoading"
            :disabled="isLoading"
            :get-popup-container="(trigger) => trigger"
            @change="handleChangeSocialChannelId"
          >
            <a-select-option
              v-for="channel in channels"
              :key="channel.social_channel_id"
              :value="channel.social_channel_id"
            >
              <img
                :src="
                  require(`~/assets/images/Icon/Icon-${channel.channel_type.data.code}.png`)
                "
                class="response-history__social-channels--icon-channels"
              />
              {{ channel.name }}
            </a-select-option>
          </a-select>
          <a-select
            v-model="filter.status"
            size="large"
            class="custom-select"
            dropdown-class-name="response-history__social-channels"
            :loading="isLoading"
            :disabled="isLoading"
            :get-popup-container="(trigger) => trigger"
            @change="handleChangeStatus"
          >
            <a-select-option
              v-for="status in statusOptions"
              :key="status.key"
              :value="status.value"
            >
              {{ status.name }}
            </a-select-option>
          </a-select>
          <app-date-picker
            :value="filter.range"
            :disabled-date="disabledDate"
            :clearable="false"
            :placeholder="$t('response-date')"
            :disabled="isLoading"
            @input="handleChangeRange"
          />
          <a-button type="primary" class="btn-filter" @click="handleShowFilter">
            <icon-filter />
          </a-button>
          <response-history-filter-advanced
            :is-show="isShowFilter"
            :is-loading="isLoading"
            :channels="channels"
            @close="handleCloseFilter"
          />
        </div>
        <div class="response-history__filters__right">
          <export-data-response-history :filters="exportFilters" class="ml-2" />
        </div>
      </div>
    </div>
    <div class="response-history__body">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
        :loading="isLoading"
        :locale="locale"
        :scroll="{ y: '50vh' }"
      >
        <app-loading v-if="isLoading" />
        <template #dataTagsTitle>
          <div class="flex items-center">
            <span class="mr-2">{{ $t('data-tags') }}</span>
            <a-popover :content="$t('tooltip-data-tags')">
              <a-icon type="info-circle" />
            </a-popover>
          </div>
        </template>
        <template slot="action" slot-scope="record">
          <div class="response-history-actions">
            <a-dropdown
              placement="bottomLeft"
              :get-popup-container="(trigger) => trigger"
              :trigger="['hover']"
            >
              <a
                class="response-history-actions__dropdown"
                @click="(e) => e.preventDefault()"
              >
                <i class="fas fa-ellipsis-v"></i>
              </a>
              <a-menu slot="overlay">
                <a-menu-item key="viewDetail">
                  <a
                    rel="noopener noreferrer"
                    class="response-history-actions__dropdown--item"
                    @click="handleViewDetail(record)"
                  >
                    {{ $t('view-detail') }}
                  </a>
                </a-menu-item>
                <a-menu-item key="viewChannel">
                  <a
                    rel="noopener noreferrer"
                    class="response-history-actions__dropdown--item"
                    @click="handleViewOnChannelAccount(record)"
                  >
                    {{ $t('view-on-channel-account') }}
                  </a>
                </a-menu-item>
                <a-menu-item key="showAllHistory">
                  <a
                    rel="noopener noreferrer"
                    class="response-history-actions__dropdown--item"
                    @click="handleOpenHistory(record)"
                  >
                    {{ $t('show-all-history') }}
                  </a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </template>
        <template slot="conversationType" slot-scope="conversationType">
          <div class="flex items-center justify-center opacity-60">
            <a-tooltip
              v-if="conversationType === configConversations.type.chat"
              overlay-class-name="custom-tooltip-light"
              placement="rightBottom"
            >
              <template slot="title">{{ $t('chat') }}</template>
              <icon-messenger class="icon-conversation-type" />
            </a-tooltip>
            <a-tooltip
              v-else
              overlay-class-name="custom-tooltip-light"
              placement="rightBottom"
            >
              <template slot="title">{{ $t('comment') }}</template>
              <icon-comment class="icon-conversation-type" />
            </a-tooltip>
          </div>
        </template>
        <template slot="content" slot-scope="content">
          <a-tooltip
            overlay-class-name="custom-tooltip-light"
            placement="bottomLeft"
          >
            <template slot="title">
              {{ content }}
            </template>
            {{ content }}
          </a-tooltip>
        </template>
        <template slot="histories" slot-scope="histories">
          <a-collapse
            v-if="histories.length > 1"
            default-active-key="0"
            :bordered="false"
            accordion
            expand-icon-position="right"
            class="custom-collapse"
          >
            <template #expandIcon="props">
              <icon-top-blue v-if="props.isActive" :style="{ top: '50%' }" />
              <icon-right
                v-else
                :style="{ transform: 'rotate(90deg) translateX(-50%)' }"
              />
            </template>
            <a-collapse-panel style="border: 0">
              <template #header>
                <div class="custom-collapse-header">
                  <a-tooltip overlay-class-name="custom-tooltip-light">
                    <template slot="title">
                      <p v-html="getContentResponse(histories[0])"></p>
                    </template>
                    <p class="custom-collapse-header__title">
                      {{ getContentResponse(histories[0]) }}
                    </p>
                  </a-tooltip>
                </div>
              </template>
              <template v-for="(response, index) in histories">
                <a-tooltip
                  v-if="index > 0"
                  :key="response.key"
                  overlay-class-name="custom-tooltip-light"
                >
                  <template slot="title">
                    <p v-html="getContentResponse(response)"></p>
                  </template>
                  <p class="custom-collapse-header__title">
                    {{ getContentResponse(response) }}
                  </p>
                </a-tooltip>
              </template>
            </a-collapse-panel>
          </a-collapse>
          <a-tooltip
            v-else-if="histories.length"
            :key="histories[0].key"
            overlay-class-name="custom-tooltip-light"
          >
            <template slot="title">
              <p v-html="getContentResponse(histories[0])"></p>
            </template>
            <p class="custom-collapse-header__title">
              {{ getContentResponse(histories[0]) }}
            </p>
          </a-tooltip>
        </template>
        <template slot="status" slot-scope="status">
          <app-tag
            type="primary-status-order"
            :style="{ fontSize: '1.2rem', borderRadius: '6px', width: '80%' }"
            class="flex items-center justify-center mx-auto"
            nowrap
            square
          >
            {{ $t(invertConversationStatus[status]) }}
          </app-tag>
        </template>
        <template v-if="responses.length" #footer>
          <div class="total-number-conversation">
            <span class="mr-2">{{ $t('total-number-of-conversations') }}:</span>
            <app-tag type="primary" :border="true" :square="true">
              <span>{{ total }}</span>
            </app-tag>
          </div>
          <app-pagination :page="page" :page-size="limit" :total="total" />
        </template>
      </a-table>
    </div>
    <nuxt-child
      :is-visible="isVisibleDetail"
      :data-detail="responseHistoryDetail"
      :is-loading="isLoadingDetail"
      @close="handleCloseDetail"
    ></nuxt-child>
  </div>
</template>

<script>
import Vue from 'vue'
import { invert, debounce } from 'lodash'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
import {
  convertUTCToLocal,
  convertLocalToUTC,
  today,
  last30Days,
} from '@/utils/moment'
Vue.use(notification)

export default {
  name: 'ResponseHistory',
  fetchOnServer: false,
  data() {
    return {
      page: 1,
      limit: this.$store.state.limit,
      responses: [],
      total: 0,
      channels: [],
      isLoading: false,
      filter: {
        search: '',
        socialChannelId: null,
        conversationType: 0,
        respondedBy: 0,
        status: 0,
        // postIds: [],
        postId: '',
        tags: [],
        range: [new Date(last30Days), new Date(today)],
        pageSocialProfileId: '',
        sort: '-publish_time',
      },
      exportFilters: {},
      isShowFilter: false,
      isVisibleDetail: false,
      responseHistoryDetail: {},
      isLoadingDetail: false,
    }
  },
  async fetch() {
    await this.fetchSocialChannels()
  },
  computed: {
    configConversations() {
      return this.$store.state.configConversations
    },
    locale() {
      return {
        emptyText: <app-no-data text={this.$t('no-data')} />,
      }
    },
    columns() {
      return [
        {
          key: 'action',
          scopedSlots: { customRender: 'action' },
          width: '4%',
        },
        {
          title: this.$t('type'),
          key: 'conversationType',
          dataIndex: 'conversationType',
          scopedSlots: { customRender: 'conversationType' },
          align: 'center',
          width: '5%',
        },
        {
          title: this.$t('guest-name'),
          key: 'guestName',
          dataIndex: 'guestName',
          scopedSlots: { customRender: 'guestName' },
          width: '13%',
        },
        {
          title: this.$t('conversation'),
          key: 'content',
          dataIndex: 'content',
          scopedSlots: { customRender: 'content' },
          ellipsis: true,
          align: 'center',
          width: '18%',
        },
        {
          title: this.$t('response'),
          key: 'histories',
          dataIndex: 'histories',
          scopedSlots: { customRender: 'histories' },
          ellipsis: true,
          width: '20%',
        },
        {
          title: this.$t('status'),
          key: 'status',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          align: 'center',
          width: '10%',
        },
        {
          key: 'dataTags',
          dataIndex: 'dataTags',
          scopedSlots: { customRender: 'dataTags' },
          slots: { title: 'dataTagsTitle' },
          ellipsis: true,
          align: 'center',
          width: '10%',
        },
        {
          title: this.$t('last-responded-by'),
          key: 'lastRespondedBy',
          dataIndex: 'lastRespondedBy',
          scopedSlots: { customRender: 'lastRespondedBy' },
          align: 'center',
          width: '10%',
        },
        {
          title: this.$t('creation-date'),
          key: 'creationDate',
          dataIndex: 'creationDate',
          scopedSlots: { customRender: 'creationDate' },
          align: 'center',
          width: '10%',
          sorter: (a, b, sortOrder) => {
            this.filter.sort =
              sortOrder === 'ascend' ? 'publish_time' : '-publish_time'
            return new Date(a.publish_time) - new Date(b.publish_time)
          },
          defaultSortOrder:
            this.filter.sort === 'publish_time'
              ? 'ascend'
              : this.filter.sort === '-publish_time'
              ? 'descend'
              : null,
        },
      ]
    },
    dataSource() {
      return this.responses.map((item) => {
        const response = {
          key: item.id,
          content: item.attachments?.length
            ? this.$t('send-an-attachment')
            : item.content,
          attachments: item.attachments,
          guestId: item.from_id,
          guestName: item.from_name || '--',
          status: item.conversation_status,
          conversationType: item.conversation_type,
          socialPostId: item.social_post_id,
          socialChannelId: item.social_channel_id,
          socialLink: item.social_link,
          socialChannel: item.conversation_mysql.data.social_channel.data,
          keywords:
            item.conversation_mysql.data.progress.data
              .conversation_progress_keywords.data,
          tags: item.conversation_mysql.data.progress.data
            .conversation_progress_tags.data,
          lastRespondedBy: item.updated_by_user?.data?.name,
          dataTags:
            item.conversation_mysql?.data?.progress?.data
              ?.conversation_progress_tags?.data[0]?.tag?.data?.name,
          creationDate: convertUTCToLocal(
            item.publish_time,
            'HH:mm - DD/MM/YYYY'
          ),
          statusHistories: [
            ...item.conversation_mysql.data.progress.data.histories.data,
          ],
          histories: [
            ...item.conversation_mysql.data.progress.data.histories.data,
          ].filter(
            (response) =>
              response.action ===
                this.configConversations.action_type.direct_response ||
              response.action ===
                this.configConversations.action_type.escalated ||
              response.action ===
                this.configConversations.action_type.escalate_response
          ),
        }
        return response
      })
    },
    detailId() {
      return this.$route.params.id
    },
    hasPermissionSetting() {
      const permissions = this.$auth.user.permissions || []
      return permissions.includes('setting')
    },
    invertConversationStatus() {
      return invert(this.configConversations.status)
    },
    statusOptions() {
      const status = this.$store.state.configConversations.status
      const arrayKeyStatus = Object.keys(status).map((status) => status)
      return [
        { key: 0, value: 0, name: this.$t('all-status') },
        {
          key: status.opening,
          name: this.$t(arrayKeyStatus[status.opening]),
          value: status.opening,
        },
        {
          key: status.direct_response,
          name: this.$t(arrayKeyStatus[status.direct_response]),
          value: status.direct_response,
        },
        {
          key: status.direct_skip,
          name: this.$t(arrayKeyStatus[status.direct_skip]),
          value: status.direct_skip,
        },
        {
          key: status.waiting_escalate,
          name: this.$t(arrayKeyStatus[status.waiting_escalate]),
          value: status.waiting_escalate,
        },
        {
          key: status.escalate_response,
          name: this.$t(arrayKeyStatus[status.escalate_response]),
          value: status.escalate_response,
        },
        {
          key: status.escalate_skip,
          name: this.$t(arrayKeyStatus[status.escalate_skip]),
          value: status.escalate_skip,
        },
      ]
    },
  },
  watch: {
    'filter.sort'() {
      const query = {
        ...this.$route.query,
        sort: this.filter.sort,
      }
      if (!this.filter.sort.length) delete query.sort
      this.$router.push({ query })
    },
    detailId: {
      immediate: true,
      handler() {
        if (this.detailId) {
          this.isVisibleDetail = true
        }
      },
    },
    '$route.query'(oldValue, newValue) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        this.handlerFilter()
      }
    },
  },
  created() {
    this.handlerFilter()
  },
  methods: {
    handleCloseDetail() {
      this.isVisibleDetail = false
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: `/conversations/response-history`,
          query,
        })
      )
    },
    handleOpenHistory(record) {
      this.isLoadingDetail = true
      this.isVisibleDetail = true
      this.responseHistoryDetail = { ...record }
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: `/conversations/response-history/${record.key}`,
          query,
        })
      )
      this.isLoadingDetail = false
    },
    onChangeSearch(e) {
      const { value } = e.target
      if (this.filter.search?.length && !value?.length) {
        const query = {
          ...this.$route.query,
          search: this.filter.search,
          page: 1,
        }
        this.filter.search = value
        delete query.search
        this.$router.push({ query })
      }
      this.filter.search = value
    },
    handleSearchGuest: debounce(function () {
      const query = {
        ...this.$route.query,
        search: this.filter.search,
        page: 1,
      }
      if (!this.filter.search?.length) {
        delete query.search
      }
      this.$router.push({ query })
    }, 1000),
    getContentResponse(history) {
      if (history.payload?.message?.length) {
        return history.payload.message
      }
      if (history.payload?.content?.length) {
        return history.payload.content
      }
      if (history.payload?.attachment_type?.length) {
        return this.$t('send-an-attachment')
      }
    },
    async getDetailSocialChannel() {
      if (!this.filter.socialChannelId) return
      const { data } = await this.$api.socialChannel.getSocialChannelDetail(
        this.filter.socialChannelId
      )
      this.filter.pageSocialProfileId = data.social_id
    },
    handleShowFilter() {
      this.isShowFilter = true
    },
    handleCloseFilter() {
      this.isShowFilter = false
    },
    handleChangeRange(date = []) {
      this.filter.range = date
      const query = {
        ...this.$route.query,
        date_from: this.$moment(date[0]).format('YYYY-MM-DD HH:mm'),
        date_to: this.$moment(date[1]).format('YYYY-MM-DD HH:mm'),
        page: 1,
      }
      if (
        query.date_from === 'Invalid date' ||
        query.date_to === 'Invalid date' ||
        !date[0] ||
        !date[1]
      ) {
        query.date_from = this.$moment(new Date(last30Days)).format(
          'YYYY-MM-DD HH:mm'
        )
        query.date_to = this.$moment(today).format('YYYY-MM-DD HH:mm')
        this.filter.range = [new Date(last30Days), new Date(today)]
      }
      this.$router.push({ query })
    },
    handleChangeSocialChannelId(socialChannelId) {
      const query = {
        ...this.$route.query,
        channel_id: socialChannelId,
        page: 1,
      }
      this.$router.push({ query })
    },
    handleChangeStatus(status) {
      const query = {
        ...this.$route.query,
        status,
        page: 1,
      }
      this.$router.push({ query })
    },
    async handlerFilter() {
      const {
        page = 1,
        limit = this.$store.state.limit,
        channel_id,
        responded_by = 0,
        conversation_type = 0,
        date_from,
        date_to,
        search = '',
        status = 0,
        tags = '',
        post_id = '',
        sort = '-publish_time',
      } = this.$route.query
      this.page = Number(page)
      this.limit = Number(limit)
      if (
        channel_id &&
        !isNaN(channel_id) &&
        this.filter.socialChannelId !== parseInt(channel_id)
      ) {
        this.filter.socialChannelId = parseInt(channel_id)
      }
      await this.getDetailSocialChannel()
      this.filter.sort = sort
      this.filter.respondedBy = parseInt(responded_by)
      this.filter.conversationType = parseInt(conversation_type)
      if (status && !isNaN(status)) {
        this.filter.status = parseInt(status)
      }
      this.filter.postId = post_id
      this.filter.tags = tags?.length ? tags.split(',') : []
      if (date_from && date_to) {
        this.filter.range = [new Date(date_from), new Date(date_to)]
        const checkDateFrom = this.$moment(date_from).format('YYYY-MM-DD HH:mm')
        const checkDateTo = this.$moment(date_to).format('YYYY-MM-DD HH:mm')
        if (
          checkDateFrom === 'Invalid date' ||
          checkDateTo === 'Invalid date'
        ) {
          this.handleChangeRange([])
        }
      } else {
        this.handleChangeRange([])
      }
      if (search?.length) {
        this.filter.search = search
      }
      if (this.filter.socialChannelId) {
        this.fetchResponseHistory()
      } else {
        this.responses = []
      }
    },
    async fetchSocialChannels() {
      try {
        const params = {
          paginate: false,
          sort: 'name',
        }
        const { data } = await this.$api.socialChannel.getSocialChannelsByUser(
          params
        )
        if (data) {
          this.channels = Object.freeze(data)
          if (this.channels.length) {
            const isValidQueryChannelId = this.channels.some(
              (channel) =>
                channel.social_channel_id + '' === this.$route.query.channel_id
            )
            if (isValidQueryChannelId) return
            const query = {
              ...this.$route.query,
              channel_id: this.channels[0].social_channel_id,
            }
            this.$router.push({ query })
          }
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    async fetchResponseHistory() {
      try {
        this.isLoading = true
        const fromDate =
          (this.filter.range[0] &&
            convertLocalToUTC(this.filter.range[0], 'YYYY-MM-DD HH:mm')) ||
          null
        const toDate =
          (this.filter.range[1] &&
            convertLocalToUTC(this.filter.range[1], 'YYYY-MM-DD HH:mm')) ||
          null
        const params = {
          action: this.configConversations.actions.view,
          ...(this.filter.search?.length > 1 && {
            search_columns: this.filter.search,
          }),
          ...(this.filter.socialChannelId && {
            'filter[social_channel_id]': this.filter.socialChannelId,
            'filter[from_id]': `!${this.filter.pageSocialProfileId}`,
          }),
          ...(this.filter.conversationType && {
            'filter[conversation_type]': this.filter.conversationType,
          }),
          ...(this.filter.status && {
            'filter[conversation_status]': this.filter.status,
          }),
          ...(this.filter.conversationType ===
            this.configConversations.type.comment &&
            this.filter.postId?.length && {
              'filter[social_post_id]': this.filter.postId,
            }),
          ...(this.filter.tags?.length && {
            'filter[tags]': this.filter.tags[this.filter.tags.length - 1],
          }),
          ...(this.filter.respondedBy && {
            'filter[updated_by]': this.filter.respondedBy,
          }),
          ...(fromDate &&
            toDate && {
              'filter[date][key]': 'publish_time',
              'filter[date][from]': fromDate,
              'filter[date][to]': toDate,
            }),
          sort: this.filter.sort.length ? this.filter.sort : '-publish_time',
          limit: this.limit,
          page: this.page,
          include: 'conversation_mysql,conversation_mysql.social_channel',
        }
        this.exportFilters = {
          ...this.filter,
        }
        const { data, meta } =
          await this.$api.responseHistory.getAgencyResponseHistory(params)
        if (data) {
          this.responses = Object.freeze(data)
          this.total = meta.pagination.total
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.isLoading = false
      }
    },
    disabledDate(date) {
      return date > today
    },
    handleViewOnChannelAccount(response) {
      const url = response?.socialLink || ''
      window.open(url, '_blank')
    },
    handleViewDetail(response) {
      if (!response) return
      const pageId = response.socialChannelId
      const conversationType =
        response.conversationType === this.configConversations.type.chat
          ? 'chat'
          : 'comment'
      const guestId = response.guestId
      const url = `/conversations/chat-comment/${pageId}/${conversationType}/${guestId}`
      if (guestId) {
        this.$router.push(
          this.localePath({
            path: url,
            ...(response.socialPostId?.length && {
              query: { social_post_id: response.socialPostId },
            }),
          })
        )
      }
    },
  },
}
</script>

<style lang="less" scoped>
.response-history {
  &__header {
    margin-bottom: 0.5rem;
    font-size: @size-20;
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
  /deep/&__filters {
    margin-top: 0.5rem;
    @apply w-full flex-wrap flex items-center justify-between mb-4;

    .ant-input-affix-wrapper {
      width: 40rem;
      height: @height-field;
      @apply m-2;
      .ant-input {
        height: 100%;
      }
    }
    .custom-select {
      color: @black;
      font-size: @size-16;
      min-width: 22rem;
      width: fit-content;
      height: @height-field;
      @apply m-2;
      .ant-select-selection {
        border-color: @black-gray;
        height: 100%;
        &__rendered {
          height: 100%;
          line-height: @height-field;
          .ant-select-selection-selected-value {
            display: flex !important;
            @apply items-center;
          }
        }
        .ant-select-selection-selected-value {
          max-width: 25rem;
          @apply pr-2;
        }
        .ant-select-arrow-icon {
          color: @black;
        }
      }
    }
    .mx-datepicker-range {
      width: 38rem;
      height: @height-field;
      border-color: @black-gray;

      @apply m-2;
      .mx-input {
        height: @height-field;
      }
    }
  }
  &__social-channels {
    &--icon-channels {
      width: @size-28;
      height: @size-28;
      margin-right: @margin-8;
      @apply inline-block;
    }
  }
  &__body {
    /deep/.ant-table-content {
      .ant-table-scroll {
        table {
          thead {
            height: @height-table;
            th {
              // &:first-child {
              //   width: 3.5%;
              // }
              // &:nth-child(2) {
              //   width: 4.5%;
              // }
              // &:nth-child(3) {
              //   width: 12%;
              // }
              // &:nth-child(4) {
              //   width: 15%;
              // }
              // &:nth-child(5) {
              //   width: 20%;
              // }
              // &:nth-child(6) {
              //   width: 10.9%;
              // }
              // &:nth-child(7) {
              //   width: 10.3%;
              // }
              // &:last-child {
              //   width: 11.6%;
              // }
              .ant-table-column-title {
                font-size: @size-14;
                color: @black-blue;
                @apply font-semibold;
              }
            }
          }
          tbody {
            tr {
              height: @height-table;
              td {
                color: @black;
                font-size: @size-16;
                padding-inline: @padding-8;
                &:nth-child(5) {
                  padding-left: @padding-16;
                }
              }
            }
            .custom-collapse {
              background: none;
              &-header {
                overflow: hidden;
                max-width: 80%;
                &__title {
                  @apply truncate mb-0;
                }
              }
              .ant-collapse-header {
                padding: 0;
              }
              .ant-collapse-content-box {
                padding: 0;
                color: @black;
                margin-top: 1rem;
                p {
                  &:not(:last-child) {
                    margin-bottom: 1rem;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.response-history-actions {
  @apply flex items-center justify-around;
  &__dropdown {
    color: @secondary-1;
    line-height: 1;
    margin: 0 0.5rem;
    &--item {
      min-width: 9rem;
    }
  }
}
.btn-filter {
  background-color: @gray-6;
  color: @black;
  width: @height-field;
  height: @height-field;
  @apply p-0 border-0 rounded-xl ml-2 inline-flex items-center justify-center;
  svg {
    font-size: @size-14;
    width: @size-14;
    height: @size-14;
  }
}
.icon-conversation-type {
  width: @size-20;
  height: @size-20;
}
/deep/.ant-table-footer {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
}
.total-number-conversation {
  @apply flex items-center;
}
</style>
