<template>
  <a-drawer
    placement="right"
    :closable="false"
    :visible="isVisible"
    destroy-on-close
    class="response-history-detail"
    width="40vw"
    @close="handleClose"
  >
    <span class="response-history-detail__close" @click="handleClose">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <h6 class="response-history-detail__title">
      {{ $t('show-all-history') }}
    </h6>
    <div v-if="isLoading || isFetchLoading" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <response-history-detail-information :data="responseHistoryDetail" />
      <response-history-detail-conversation :data="responseHistoryDetail" />
      <response-history-detail-status-history :data="responseHistoryDetail" />
    </template>
  </a-drawer>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'ResponseHistoryDetail',
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    dataDetail: {
      type: Object,
      default: () => {},
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      responseHistoryDetail: {},
      isFetchLoading: false,
    }
  },
  computed: {
    detailId() {
      return this.$route.params.id
    },
  },
  watch: {
    dataDetail: {
      immediate: true,
      deep: true,
      handler() {
        this.responseHistoryDetail = { ...this.dataDetail }
      },
    },
  },
  created() {
    if (!this.dataDetail?.key) {
      this.fetchResponseHistoryDetail()
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    async fetchResponseHistoryDetail() {
      try {
        if (!this.detailId) return
        this.isFetchLoading = true
        const params = {
          include: 'conversation_mysql,conversation_mysql.social_channel',
        }
        const { data } =
          await this.$api.responseHistory.getAgencyResponseHistoryDetail(
            this.detailId,
            params
          )
        if (data) {
          this.responsesHistoryDetail = Object.freeze(data)
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
        this.handleClose()
      } finally {
        this.isFetchLoading = false
      }
    },
  },
}
</script>
<style lang="less" scoped>
.response-history-detail {
  /deep/.ant-drawer-content {
    overflow: visible;
  }
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    z-index: 10;
    cursor: pointer;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }
  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }
}
</style>
