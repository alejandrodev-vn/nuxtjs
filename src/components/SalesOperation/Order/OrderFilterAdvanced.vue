<template>
  <app-filter-advanced
    :is-show="isShow"
    :is-loading="isLoading"
    @close="handleClose"
    @save="handleSave"
    @setDefault="handleSetDefault"
  >
    <template slot="form">
      <a-form-model ref="form" class="order-filter" :colon="false">
        <a-form-model-item
          ref="channel"
          prop="channel"
          :label="$t('order-from-channel-account')"
        >
          <staff-select-channel
            :key="keyComponentSelectChannel"
            :channels="channels"
            :ids="filter.checkedChannelIds"
            @input="handleUpdateChannelIds"
          />
        </a-form-model-item>
        <a-form-model-item ref="status" prop="status" :label="$t('status')">
          <a-select v-model="filter.status">
            <template v-for="item in statusOptions">
              <a-select-option :key="item.value" :value="item.value">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-model-item>
        <a-form-model-item ref="range" prop="range" :label="$t('order-date')">
          <app-date-picker
            :value="filter.range"
            :disabled-date="disabledDate"
            :use-query-router="false"
            :placeholder="$t('select-date-range')"
            :append-to-body="false"
            :clearable="false"
            popup-class="placement-right"
            @input="handleChangeRange"
          />
        </a-form-model-item>
        <a-form-model-item
          ref="orderedBy"
          prop="orderedBy"
          :label="$t('ordered-by')"
        >
          <a-select v-model="filter.orderedBy">
            <template v-for="item in userOptions">
              <a-select-option :key="item.value" :value="item.value">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('order-value')">
          <div class="wrap-input-half">
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('from') }}</span>
              <a-input
                v-model="filter.orderValueFrom"
                class="custom-input"
                @change="
                  handleReplaceWord(filter.orderValueFrom, 'orderValueFrom')
                "
              />
            </div>
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('to') }}</span>
              <a-input
                v-model="filter.orderValueTo"
                class="custom-input"
                @change="handleReplaceWord(filter.orderValueTo, 'orderValueTo')"
              />
            </div>
          </div>
        </a-form-model-item>
        <a-form-model-item :label="$t('product-quantity')">
          <div class="wrap-input-half">
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('from') }}</span>
              <a-input
                v-model="filter.quantityFrom"
                class="custom-input"
                @change="handleReplaceWord(filter.quantityFrom, 'quantityFrom')"
              />
            </div>
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('to') }}</span>
              <a-input
                v-model="filter.quantityTo"
                class="custom-input"
                @change="handleReplaceWord(filter.quantityTo, 'quantityTo')"
              />
            </div>
          </div>
        </a-form-model-item>
      </a-form-model>
    </template>
  </app-filter-advanced>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { today, last30Days } from '@/utils/moment'
import regexText from '@/mixins/regexText'
Vue.use(notification)

export default {
  name: 'OrderFilterAdvanced',
  mixins: [regexText],
  fetchOnServer: false,
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    channels: {
      type: Array,
      default: () => [],
    },
    users: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      filter: {
        checkedChannelIds: [],
        status: '',
        orderedBy: '',
        orderValueFrom: '',
        orderValueTo: '',
        quantityFrom: '',
        quantityTo: '',
        range: [new Date(last30Days), new Date(today)],
      },
      filterInit: {
        checkedChannelIds: [],
        status: '',
        orderedBy: '',
        orderValueFrom: '',
        orderValueTo: '',
        quantityFrom: '',
        quantityTo: '',
        range: [new Date(last30Days), new Date(today)],
      },
      keyComponentSelectChannel: 0,
    }
  },
  computed: {
    allChannelIds() {
      return this.channels.map((item) => {
        return item.social_channel_id
      })
    },
    statusOptions() {
      const status = this.$store.state.orderStatus
      const listStatus = Object.keys(status).map((item) => {
        return {
          key: item,
          name: this.$t(item),
          value: `${status[item]}`,
        }
      })
      return [
        { key: '', value: '', name: this.$t('all-status') },
        ...listStatus,
      ]
    },
    userOptions() {
      const users = this.users.map((item) => {
        return {
          key: item.id,
          name: item.name,
          value: `${item.id}`,
        }
      })
      return [{ key: '', value: '', name: this.$t('all-users') }, ...users]
    },
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler() {
        this.handlerFilter()
      },
    },
  },
  methods: {
    handleReplaceWord(value, key) {
      this.filter[key] = this.replaceWord(value)
    },
    handleChangeRange(date = []) {
      this.filter.range = date
      if (!date[0] || !date[1]) {
        this.filter.range = [new Date(last30Days), new Date(today)]
      }
    },
    handlerFilter() {
      const {
        status = '',
        ordered_by = '',
        date_from,
        date_to,
        channel_ids = '',
        order_value_from = '',
        order_value_to = '',
        quantity_from = '',
        quantity_to = '',
      } = this.$route.query
      this.filter.status = status
      this.filter.orderedBy = ordered_by
      this.filter.orderValueFrom = order_value_from
      this.filter.orderValueTo = order_value_to
      this.filter.quantityFrom = quantity_from
      this.filter.quantityTo = quantity_to

      this.filter.checkedChannelIds = channel_ids
        ? channel_ids.split(',').map((id) => {
            return parseInt(id)
          })
        : this.allChannelIds
      if (date_from && date_to) {
        this.filter.range = [new Date(date_from), new Date(date_to)]
      } else {
        this.filter.range = [new Date(last30Days), new Date(today)]
      }
    },
    handleUpdateChannelIds(ids) {
      this.filter.checkedChannelIds = [...ids]
    },
    disabledDate(date) {
      return date > today
    },
    handleClose() {
      this.handlerFilter()
      this.$emit('close')
    },
    handleSave() {
      const fromDate = this.filter.range[0]
        ? this.$moment(this.filter.range[0]).format('YYYY-MM-DD HH:mm')
        : null
      const toDate = this.filter.range[1]
        ? this.$moment(this.filter.range[1]).format('YYYY-MM-DD HH:mm')
        : null
      const query = {
        search_type: this.$route.query.search_type?.length
          ? this.$route.query.search_type
          : 'order-id',
        ...(this.$route.query.search?.length && {
          search: this.$route.query.search,
        }),
        ...(this.filter.status?.length && { status: this.filter.status }),
        ...(this.filter.orderedBy?.length && {
          ordered_by: this.filter.orderedBy,
        }),
        channel_ids: this.filter.checkedChannelIds.join(','),
        ...(fromDate && { date_from: fromDate }),
        ...(toDate && { date_to: toDate }),
        ...(this.filter.orderValueFrom?.length &&
          !isNaN(this.filter.orderValueFrom) && {
            order_value_from: this.filter.orderValueFrom,
          }),
        ...(this.filter.orderValueTo?.length &&
          !isNaN(this.filter.orderValueTo) && {
            order_value_to: this.filter.orderValueTo,
          }),
        ...(this.filter.quantityFrom?.length &&
          !isNaN(this.filter.quantityFrom) && {
            quantity_from: this.filter.quantityFrom,
          }),
        ...(this.filter.quantityTo?.length &&
          !isNaN(this.filter.quantityTo) && {
            quantity_to: this.filter.quantityTo,
          }),
        page: 1,
      }
      this.$router.push({ query })
      this.handleClose()
    },
    handleSetDefault() {
      if (this.allChannelIds?.length) {
        this.filterInit.checkedChannelIds = [...this.allChannelIds]
      }
      this.filter = {
        ...this.filterInit,
      }
      this.keyComponentSelectChannel += 1
    },
  },
}
</script>

<style lang="less" scoped>
.order-filter {
  /deep/.wrap-input-half {
    @apply flex items-center justify-between;
    &-item {
      @apply flex items-center;
      &:first-child {
        margin-right: 24px;
      }
      &__label {
        font-size: @size-16;
        line-height: @size-24;
        color: @black;
      }
      .custom-input,
      .custom-input.ant-input-affix-wrapper {
        height: @height-field;
        flex: 1;
        margin-left: @margin-12;
        @apply mr-2;
        .ant-input {
          color: @black;
          height: 100%;
          .ant-input-suffix {
            font-size: @size-16;
            color: @black;
          }
        }
      }
    }
  }
}
</style>
