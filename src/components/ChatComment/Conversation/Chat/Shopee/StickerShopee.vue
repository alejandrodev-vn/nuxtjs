<template>
  <a-popover
    v-if="!disabled"
    v-model="isVisible"
    class="icon-shopee-sticker"
    overlay-class-name="popup-shopee-sticker"
    placement="topRight"
    trigger="click"
  >
    <template slot="content">
      <a-tabs v-model="activeKey" tab-position="top">
        <a-tab-pane
          v-for="packageItem in packages"
          :key="packageItem.sticker_package_id"
        >
          <template slot="tab">
            <div class="popup-shopee-sticker__package-item">
              <img
                :src="
                  getStickerByCDN(
                    packageItem.domain_url,
                    packageItem.sticker_package_id,
                    'icon',
                    2
                  )
                "
                :alt="packageItem.sticker_package_id"
              />
            </div>
          </template>
          <div class="popup-shopee-sticker__wrap-sticker">
            <div
              v-for="sticker in packageItem.items"
              :key="sticker"
              class="popup-shopee-sticker__sticker-item"
              @click="
                handleClickSticker(packageItem.sticker_package_id, sticker)
              "
            >
              <img
                :src="
                  getStickerByCDN(
                    packageItem.domain_url,
                    packageItem.sticker_package_id,
                    sticker,
                    1
                  )
                "
                :alt="sticker"
              />
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </template>
    <div class="button-emoji">
      <a-icon type="smile" />
    </div>
  </a-popover>
  <div v-else class="button-emoji icon-shopee-sticker disabled">
    <a-icon type="smile" />
  </div>
</template>
<script>
export default {
  name: 'StickerShopee',
  fetchAllServer: false,
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      packages: [],
      activeKey: '',
      isVisible: false,
    }
  },

  computed: {
    configRegionShopee() {
      return this.$store.state.shopee.region
    },
    infoPage() {
      return this.$store.state.currentInfoPage
    },
  },
  watch: {
    infoPage: {
      immediate: true,
      handler() {
        this.fetchStickers()
      },
    },
  },
  methods: {
    async fetchStickers() {
      if (!this.infoPage) return
      const params = {
        region: this.infoPage?.region
          ? this.infoPage.region.toLowerCase()
          : this.configRegionShopee.vn,
      }
      const { data } = await this.$api.conversation.getShopeeStickers(params)
      if (data?.length) {
        this.packages = [...data]
        this.activeKey = this.packages[0].sticker_package_id
      }
    },
    getStickerByCDN(domainUrl, packageId, id, size) {
      return `${domainUrl}/${packageId}/${id}@${size}x.png`
    },
    handleClickSticker(packageId, id) {
      this.$emit('handleClickSticker', packageId, id)
      this.isVisible = false
    },
  },
}
</script>
<style lang="less">
.icon-shopee-sticker {
  margin-bottom: 0.7rem;
  margin-inline: 0.5rem;
  cursor: pointer;
  .anticon {
    color: @black;
    font-size: 2.5rem;
  }
  &.ant-popover-open {
    .anticon {
      color: @red;
    }
  }
  &.disabled {
    filter: invert();
    cursor: not-allowed;
  }
}
.popup-shopee-sticker {
  .ant-popover-inner-content {
    padding: 0 !important;
    width: 35rem;
    .ant-tabs-nav-scroll {
      .ant-tabs-nav {
        .ant-tabs-tab {
          padding: 0.5rem 1rem 0.5rem 1rem;
          margin-right: 0;
          &.ant-tabs-tab-active {
            background-color: #e2e6ef;
          }
        }
        .ant-tabs-ink-bar.ant-tabs-ink-bar-animated {
          background-color: @red;
          height: 4px;
          bottom: 2px;
        }
      }
    }
    .ant-tabs-tab-prev-icon,
    .ant-tabs-tab-next-icon {
      .anticon {
        font-size: 2rem;
        color: @black;
      }
    }
  }
  &__package-item {
    width: 4.8rem;
    height: 4.8rem;
  }
  &__wrap-sticker {
    overflow: hidden scroll;
    height: 24rem;
    &::-webkit-scrollbar {
      width: 6px;
      &:hover {
        width: 11px;
      }
    }
    &::-webkit-scrollbar-track {
      background-color: #eee;
      border-radius: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #aaa;
      border-radius: 6px;
      min-height: 50px;
      &:hover {
        background-color: #999;
      }
    }
    @apply flex flex-wrap items-center;
  }
  &__sticker-item {
    width: 7rem;
    height: 7rem;
    margin: 0.5rem;
    cursor: pointer;
    transition: 0.25s linear;
    &:hover {
      background-color: #e2e6ef;
    }
  }
}
</style>
