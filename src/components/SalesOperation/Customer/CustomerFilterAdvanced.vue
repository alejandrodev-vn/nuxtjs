<template>
  <app-filter-advanced
    :is-show="isShow"
    :is-loading="isLoading"
    @close="handleClose"
    @save="handleSave"
    @setDefault="handleSetDefault"
  >
    <template slot="form">
      <a-form-model ref="form" class="customer" :colon="false">
        <a-form-model-item
          ref="channel"
          prop="channel"
          :label="$t('channel-account')"
        >
          <staff-select-channel
            :key="keyComponentSelectChannel"
            :channels="channels"
            :ids="filter.checkedChannelIds"
            @input="handleUpdateChannelIds"
          />
        </a-form-model-item>
        <a-form-model-item ref="rank" prop="rank" :label="$t('rank')">
          <a-select v-model="filter.rank">
            <template v-for="item in rankOptions">
              <a-select-option :key="item.value" :value="item.value">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('total-spending')">
          <div class="wrap-input-half">
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('from') }}</span>
              <a-input
                v-model="filter.totalSpendingFrom"
                class="custom-input"
                @change="
                  handleReplaceWord(
                    filter.totalSpendingFrom,
                    'totalSpendingFrom'
                  )
                "
              />
            </div>
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('to') }}</span>
              <a-input
                v-model="filter.totalSpendingTo"
                class="custom-input"
                @change="
                  handleReplaceWord(filter.totalSpendingTo, 'totalSpendingTo')
                "
              />
            </div>
          </div>
        </a-form-model-item>
        <a-form-model-item :label="$t('complete-rate')">
          <div class="wrap-input-half">
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('from') }}</span>
              <a-input
                v-model="filter.completeRateFrom"
                class="custom-input"
                @change="
                  handleReplaceWord(filter.completeRateFrom, 'completeRateFrom')
                "
              >
                <template slot="suffix">
                  <a-icon type="percentage" />
                </template>
              </a-input>
            </div>
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('to') }}</span>
              <a-input
                v-model="filter.completeRateTo"
                class="custom-input"
                @change="
                  handleReplaceWord(filter.completeRateTo, 'completeRateTo')
                "
              >
                <template slot="suffix">
                  <a-icon type="percentage" />
                </template>
              </a-input>
            </div>
          </div>
        </a-form-model-item>
        <a-form-model-item
          ref="range"
          prop="range"
          :label="$t('creation-date')"
        >
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
  name: 'CustomerFilterAdvanced',
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
    ranks: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      filter: {
        checkedChannelIds: [],
        rank: '',
        orderedBy: '',
        totalSpendingFrom: '',
        totalSpendingTo: '',
        completeRateFrom: '',
        completeRateTo: '',
        range: [new Date(last30Days), new Date(today)],
      },
      filterInit: {
        checkedChannelIds: [],
        rank: '',
        orderedBy: '',
        totalSpendingFrom: '',
        totalSpendingTo: '',
        completeRateFrom: '',
        completeRateTo: '',
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
    rankOptions() {
      const ranks = this.ranks.map((item) => {
        return {
          key: item.id,
          name: item.name,
          value: `${item.id}`,
        }
      })
      return [{ key: '', value: '', name: this.$t('all-ranks') }, ...ranks]
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
        rank = '',
        date_from,
        date_to,
        channel_ids = '',
        total_spending_from = '',
        total_spending_to = '',
        complete_rate_from = '',
        complete_rate_to = '',
      } = this.$route.query
      this.filter.rank = rank
      this.filter.totalSpendingFrom = total_spending_from
      this.filter.totalSpendingTo = total_spending_to
      this.filter.completeRateFrom = complete_rate_from
      this.filter.completeRateTo = complete_rate_to
      this.filter.checkedChannelIds = channel_ids
        ? channel_ids.split(',').map((id) => {
            return parseInt(id)
          })
        : []
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
      this.keyComponentSelectChannel += 1
      this.$emit('close')
    },
    handleSave() {
      const fromDate = this.$moment(this.filter.range[0]).format(
        'YYYY-MM-DD HH:mm'
      )
      const toDate = this.$moment(this.filter.range[1]).format(
        'YYYY-MM-DD HH:mm'
      )
      const query = {
        ...(this.$route.query.search?.length && {
          search: this.$route.query.search,
        }),
        ...(this.filter.rank?.length && { rank: this.filter.rank }),
        ...(this.filter.totalSpendingFrom?.length && {
          total_spending_from: this.filter.totalSpendingFrom,
        }),
        ...(this.filter.totalSpendingTo?.length && {
          total_spending_to: this.filter.totalSpendingTo,
        }),
        ...(this.filter.completeRateFrom?.length && {
          complete_rate_from: this.filter.completeRateFrom,
        }),
        ...(this.filter.completeRateTo?.length && {
          complete_rate_to: this.filter.completeRateTo,
        }),
        channel_ids: this.filter.checkedChannelIds.join(','),
        date_from: fromDate,
        date_to: toDate,
        page: 1,
        limit: this.$route.query?.limit || this.$store.state.limit,
      }
      this.$router.push({ query })
      this.handleClose()
    },
    handleSetDefault() {
      this.filterInit.checkedChannelIds = [...this.allChannelIds]

      this.filter = {
        ...this.filterInit,
      }
      this.keyComponentSelectChannel += 1
    },
  },
}
</script>

<style lang="less" scoped>
.customer {
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
        margin-left: @size-12;
        @apply mr-2;
        .ant-input {
          color: @black;
          height: 100%;
        }
        .ant-input-suffix {
          font-size: @size-16;
          color: @black;
        }
      }
    }
  }
}
</style>
