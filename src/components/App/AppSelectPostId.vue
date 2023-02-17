<template>
  <a-select
    show-search
    :allow-clear="allowClear"
    option-filter-prop="children"
    size="large"
    class="custom-select-post-id"
    :placeholder="$t('allPostId')"
    dropdown-class-name="dropdown-custom-select-post-id"
    :disabled="disabled"
    :filter-option="false"
    :value="value"
    :loading="isLoadingMore"
    @search="handleChangeSearchValue"
    @change="handleChangeValue"
    @popupScroll="handleScroll"
  >
    <a-select-option v-if="allowClear" key="" value="">
      {{ $t('allPostId') }}
    </a-select-option>
    <a-select-option
      v-for="post in posts"
      :key="post.social_id"
      :value="post.social_id"
    >
      <div class="dropdown-custom-select-post-id__wrap">
        <div class="dropdown-custom-select-post-id__thumbnail">
          <img
            :src="
              post.thumbnail_image
                ? post.thumbnail_image
                : require('~/assets/images/Icon/No-Image.png')
            "
          />
        </div>
        <div class="flex-1 flex flex-col justify-center overflow-hidden">
          <p class="dropdown-custom-select-post-id__id">
            {{ post.social_id }}
          </p>
          <p class="dropdown-custom-select-post-id__description">
            {{ post.full_description }}
          </p>
        </div>
      </div>
    </a-select-option>
  </a-select>
</template>
<script>
import { debounce } from 'lodash'
export default {
  name: 'AppSelectPostId',
  props: {
    value: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    allowClear: {
      type: Boolean,
      default: false,
    },
    socialChannelId: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      posts: [],
      searchValue: '',
      page: 1,
      totalPages: 0,
      isLoadingMore: false,
    }
  },
  async fetch() {
    await this.fetchPostId()
  },
  watch: {
    socialChannelId() {
      this.searchValue = ''
      this.reset()
      this.fetchPostId()
    },
    searchValue: debounce(function (value) {
      this.searchValue = value
      this.reset()
      this.fetchPostId()
    }, 1000),
  },
  methods: {
    reset() {
      this.posts = []
      this.page = 1
      this.totalPages = 0
    },
    handleChangeSearchValue(value) {
      this.searchValue = value
    },
    handleScroll(e) {
      const { target } = e
      if (
        !this.isLoadingMore &&
        this.page < this.totalPages &&
        target.scrollTop + target.offsetHeight >= target.scrollHeight - 10
      ) {
        this.page++
        this.fetchPostId()
      }
    },
    handleChangeValue(value) {
      if (!value) {
        this.searchValue = ''
      }
      this.$emit('handleChangeValue', value)
    },
    async fetchPostId() {
      try {
        this.isLoadingMore = true
        if (!this.socialChannelId) return
        const params = {
          'filter[social_channel_id]': this.socialChannelId,
          ...(this.searchValue?.length && {
            'filter[social_id]': this.searchValue,
          }),
          sort: '-published_date',
          page: this.page,
          limit: 10,
        }
        const { data, meta } = await this.$api.socialPosts.getSocialPostList(
          params
        )
        if (data) {
          this.posts = [...this.posts, ...data]
          this.totalPages = meta.pagination.total_pages
        }
      } catch (e) {
      } finally {
        this.isLoadingMore = false
      }
    },
  },
}
</script>
<style lang="less" scoped>
.custom-select-post-id {
  color: @black;
  font-size: @size-16;
  height: auto !important;
  width: 100%;
  /deep/.ant-select-selection {
    border-color: @black-gray !important;
    min-height: @height-field !important;
    height: auto !important;
    padding-block: 0;
    &__rendered {
      line-height: @height-field !important;
      .ant-select-selection-selected-value {
        height: @height-field;
        .dropdown-custom-select-post-id {
          @apply h-full;
          &__id {
            max-width: unset;
          }
          &__thumbnail {
            width: 3.6rem;
            height: 3.6rem;
          }
        }
      }
      .ant-select-selection__choice {
        background-color: @primary;
        border-radius: 9999px;
        padding-right: 28px !important;
        &__content {
          color: @white;
        }
        &__remove {
          .anticon-close.ant-select-remove-icon {
            font-size: @size-14;
            border-radius: 50%;
            border: 2px solid white;
            color: @white;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            right: 0.5rem;
            top: 1rem;
            padding: 2px;
            transition: 0.25s linear;
            &:hover {
              color: @red;
              transform: scale(1.3);
              border-color: @red;
            }
          }
        }
      }
    }
  }
  .ant-select-arrow {
    color: @black;
    font-size: @size-10;
    top: 55%;
  }
}
</style>
<style lang="less">
.dropdown-custom-select-post-id {
  &__wrap {
    height: @height-field;
    @apply w-full flex items-center overflow-hidden;
  }
  &__thumbnail {
    width: 4.2rem;
    height: 4.2rem;
    margin-right: @margin-8;
    border: 1px solid @gray-4;
    @apply inline-block rounded-md overflow-hidden;
    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }
  &__id {
    margin-bottom: @margin-8;
    max-width: 80%;
    line-height: @size-16;
    @apply truncate;
  }
  &__description {
    color: #828282;
    font-size: @size-14;
    max-width: 60%;
    line-height: @size-16;
    @apply truncate mb-0;
  }
}
</style>
