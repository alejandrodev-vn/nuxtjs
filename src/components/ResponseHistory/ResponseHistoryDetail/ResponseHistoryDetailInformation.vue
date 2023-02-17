<template>
  <div class="information">
    <div class="information-header">
      <div class="information-header__left">
        <div class="guest">
          <div class="guest__avatar">
            <app-avatar :image="null" :full-name="data.guestName" :size="42" />
          </div>
          <p class="guest__name">{{ data.guestName }}</p>
        </div>
      </div>
      <div class="information-header__right">
        <div v-if="data.socialChannel" class="social-channel">
          <div class="social-channel__icon">
            <img
              :src="
                require(`~/assets/images/Icon/Icon-${data.socialChannel.channel_type.data.code}.png`)
              "
            />
          </div>
          <span class="social-channel__name">
            {{ data.socialChannel.name }}
          </span>
        </div>
        <div class="social-channel">
          <div class="social-channel__icon">
            <icon-messenger
              v-if="
                invertConfigConversationType[data.conversationType] ===
                configConversation.typeString.chat
              "
            />
            <icon-comment v-else />
          </div>
          <span class="social-channel__name">
            {{ $t(invertConfigConversationType[data.conversationType]) }}
          </span>
        </div>
      </div>
    </div>
    <div class="information-body">
      <app-loading v-if="isLoading" />
      <template v-else>
        <div class="groups">
          <div class="groups__label">
            <span>{{ $t('keyword') }}</span>
          </div>
          <div class="groups__list">
            <template v-if="data.keywords.length">
              <app-tag
                v-for="keyword in data.keywords"
                :key="keyword.id"
                type="primary-status-order"
                rounded
              >
                <a-tooltip
                  overlay-class-name="custom-tooltip-light"
                  placement="bottom"
                >
                  <template slot="title">
                    {{ keyword.keyword.data.name }}
                  </template>
                  {{ keyword.keyword.data.name }}
                </a-tooltip>
              </app-tag>
            </template>
            <span v-else>--</span>
          </div>
        </div>
        <div class="groups">
          <div class="groups__label">
            <span>{{ $t('data-tags') }}</span>
          </div>
          <div class="groups__list">
            <template v-if="tags.length">
              <div
                v-for="tag in tags"
                :key="tag.id"
                class="data-tag-item"
                :class="{ active: tag.id === data.tags[0].tag.data.id }"
              >
                <span class="data-tag-item__text">
                  {{ tag.name }}
                </span>
              </div>
            </template>
            <span v-else>--</span>
          </div>
        </div>
        <div class="creation-date">
          <span class="creation-date__label">{{ $t('creation-date') }}:</span>
          <time class="creation-date__time">{{ data.creationDate }}</time>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import { invert } from 'lodash'

export default {
  name: 'ResponseHistoryDetailInformation',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      isLoading: false,
      tags: [],
    }
  },
  computed: {
    configConversation() {
      return this.$store.state.configConversations
    },
    invertConfigConversationType() {
      return invert(this.configConversation.type)
    },
  },
  created() {
    if (this.data?.tags?.length && this.data?.tags[0]?.tag?.data) {
      this.findParentTag(this.data.tags[0].tag.data)
    }
  },
  methods: {
    formatParent(tag) {
      Object.keys(tag).forEach(async (key) => {
        if (key === 'parent' && tag.parent) {
          if (tag.level === 1) return
          await this.tags.unshift(tag.parent.data)
          this.formatParent(tag.parent.data)
        }
      })
    },
    async findParentTag(tag) {
      try {
        this.isLoading = true
        this.tags.push({ ...tag })
        if (!tag || !tag.parent_id) return
        const params = {
          include: 'parent',
        }
        const { data } = await this.$api.tags.getTagsChildren(tag.id, params)
        this.formatParent(data)
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
<style lang="less" scoped>
.information {
  border-radius: 8px;
  border: 1px solid @gray-5;
  overflow: hidden;
  margin-bottom: @margin-12;
  &-header {
    background-color: @gray-6;
    padding: @padding-8 2.2rem;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    @apply flex items-center justify-between;
    &__left {
      .guest {
        @apply flex items-center;
        &__avatar {
          margin-right: @margin-12;
        }
        &__name {
          color: @black;
          font-size: @size-20;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          @apply font-semibold m-0;
        }
      }
    }
    &__right {
      @apply flex items-center;
      .social-channel {
        margin-left: @margin-24;
        @apply flex items-center;
        &__icon {
          width: 2.4rem;
          height: 2.4rem;
          margin-right: @margin-12;
          flex-shrink: 0;
          svg {
            filter: sepia(150%) hue-rotate(180deg) saturate(10000%);
          }
          img {
            width: 100%;
            height: 100%;
          }
        }
        &__name {
          color: @gray-1;
          font-size: @size-16;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 25rem;
        }
      }
    }
  }
  &-body {
    padding: 1.8rem 2.4rem;
    .groups {
      margin-bottom: 1.4rem;
      @apply flex;
      &:nth-child(2) {
        margin-bottom: @margin-8;
      }
      &__label {
        color: @black;
        font-size: @size-16;
        margin-right: @margin-12;
        list-style: none;
        line-height: 30px;
        flex-shrink: 0;
      }
      &__list {
        @apply flex items-center flex-wrap flex-1;
        .app-tag {
          margin-right: 1.6rem;
          margin-bottom: 1rem;
          max-width: 40%;
          @apply truncate;
        }
        .data-tag-item {
          background-color: @gray-6;
          // border-radius: 3px 0 0 3px;
          color: @gray-2;
          display: inline-block;
          height: 30px;
          line-height: 30px;
          padding: 0 10px 0 30px;
          position: relative;
          text-decoration: none;
          -webkit-transition: color 0.2s;
          margin-right: @margin-24;
          margin-bottom: 1rem;
          max-width: 40%;
          &__text {
            overflow: hidden;
            display: block;
            @apply truncate;
          }
          &.active {
            background-color: @positive;
            color: @white;
            &::after {
              border-left: 20px solid @positive;
            }
          }
          &::before {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 0;
            height: 0;
            border-left: 20px solid @white;
            border-top: 16px solid transparent;
            border-bottom: 14px solid transparent;
          }
          &::after {
            content: '';
            position: absolute;
            right: -20px;
            bottom: 0;
            width: 0;
            height: 0;
            border-left: 20px solid @gray-6;
            border-top: 16px solid transparent;
            border-bottom: 14px solid transparent;
          }
        }
      }
    }
    .creation-date {
      text-align: right;
      &__label {
        font-size: @size-16;
        color: @black;
        margin-right: @margin-12;
      }
      &__time {
        font-size: @size-16;
        columns: @gray-3;
      }
    }
  }
}
</style>
