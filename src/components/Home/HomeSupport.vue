<template>
  <section class="support">
    <div class="support-box support__faq">
      <h2 class="support-title">{{ $t('faq') }}</h2>
      <div class="scroll-faq">
        <a-collapse
          default-active-key="0"
          :bordered="false"
          accordion
          expand-icon-position="right"
          class="custom-collapse"
        >
          <template #expandIcon="props">
            <icon-top-blue v-if="props.isActive" :style="{ top: '50%' }" />
            <icon-right v-else :style="{ transform: 'rotate(90deg)' }" />
          </template>
          <a-collapse-panel
            v-for="(faq, index) in faqs"
            :key="faq.id"
            :style="customCollapse"
          >
            <template #header>
              <div class="question">
                <span class="question__number">{{ index + 1 }}</span>
                <a-tooltip overlay-class-name="custom-tooltip-light">
                  <template slot="title">
                    <div v-html="faq.question"></div>
                  </template>
                  <div class="question__title" v-html="faq.question">
                    {{ faq.question }}
                  </div>
                </a-tooltip>
              </div>
            </template>
            <div class="answer" v-html="faq.answer">
              {{ faq.answer }}
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </div>
    <div class="support-box support__news">
      <h2 class="support-title">{{ $t('news') }}</h2>
      <a-table
        class="custom-table"
        :columns="columns"
        :data-source="news"
        :custom-row="customRow"
        :pagination="false"
        bordered
      >
        <template :slot="getTitle()" slot-scope="record">
          <a target="_blank" class="name">{{ record }}</a>
        </template>
        <template slot="updated_at" slot-scope="text">
          <time class="time">{{
            $moment(new Date(text)).format('DD/MM/YYYY')
          }}</time>
        </template>
        <template slot="footer">
          <a target="_blank" href="https://primecommerce.asia/en/blog">
            {{ $t('seeMore') }}
            <icon-right />
          </a>
        </template>
      </a-table>
    </div>
  </section>
</template>
<script>
export default {
  name: 'HomeSupport',
  data() {
    return {
      activeKey: ['1'],
      customCollapse: 'border: 0; margin-bottom: 0.5rem',
      columns: [
        {
          title: this.$t('titleNews'),
          dataIndex: this.getTitle(),
          key: this.getTitle(),
          scopedSlots: { customRender: this.getTitle() },
          ellipsis: true,
          width: '70%',
        },
        {
          title: this.$t('time'),
          dataIndex: 'updated_at',
          key: 'updated_at',
          align: 'right',
          scopedSlots: { customRender: 'updated_at' },
        },
      ],
      faqs: [],
      news: [],
    }
  },
  async fetch() {
    await Promise.all([await this.fetchFaqs(), await this.fetchNews()])
  },
  methods: {
    async fetchFaqs() {
      try {
        const params = {
          paginate: false,
          'filter[language]': this.$i18n.locale ? this.$i18n.locale : 'en',
        }
        const { data } = await this.$api.common.getFaqs(params)
        if (data) {
          this.faqs = Object.freeze(data)
        }
      } catch (e) {}
    },
    async fetchNews() {
      try {
        const { data } = await this.$axios(
          'https://api.primecommerce.asia/posts?page=1&include=user,tag&limit=4',
          { method: 'GET' }
        )
        if (data.data) {
          const results = await data.data.map((row) => ({
            ...row,
            key: row.id,
          }))
          this.news = Object.freeze(results)
        }
      } catch (e) {}
    },

    getSlug(post) {
      const baseUrl = 'https://primecommerce.asia/en/blog/article'
      const field = `slug_${this.$i18n.locale}`
      return `${baseUrl}/${post[field] || ''}#${post.id}`
    },
    customRow(record) {
      return {
        on: {
          click: () => {
            window.open(this.getSlug(record), '_blank')
          },
        },
      }
    },
    getTitle() {
      return this.$i18n.locale === 'ms'
        ? 'title_en'
        : `title_${this.$i18n.locale}`
    },
  },
}
</script>
<style lang="less" scoped>
.support {
  @apply mt-10;
  .desktop({
    @apply flex flex-row;
  });
  &-title {
    color: @black;
    font-size: @size-20;
    @apply font-bold mb-4;
  }
  &-box {
    border-color: @gray-4;
    @apply border rounded-md pt-6;
  }
  &__faq {
    @apply mb-6 w-full px-4;
    .desktop({
      width: 56%;
      margin-right: 1%;
      @apply mb-0;
    });
    .scroll-faq {
      max-height: 30rem;
      overflow: hidden scroll;
      @apply pr-4;
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
        &:hover {
          background-color: #999;
        }
      }
    }
    /deep/.custom-collapse {
      background-color: unset;
      @apply rounded-xl;
      .question {
        @apply flex items-center;
        &__number {
          width: @size-28;
          height: @size-28;
          background-color: @primary;
          color: @white;
          @apply inline-flex justify-center items-center rounded-full mr-4;
        }
        &__title {
          p {
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            display: -webkit-box;
            word-break: break-word;
            @apply overflow-hidden overflow-ellipsis m-0;
          }
        }
        p {
          @apply m-0;
        }
      }
      .answer {
        pre {
          font-family: 'Inter', sans-serif;
          white-space: pre-line;
          @apply m-0;
          &::-webkit-scrollbar {
            height: 6px;
            &:hover {
              height: 11px;
            }
          }
          &::-webkit-scrollbar-track {
            background-color: #eee;
            border-radius: 6px;
          }
          &::-webkit-scrollbar-thumb {
            background-color: #aaa;
            border-radius: 6px;
            &:hover {
              background-color: #999;
            }
          }
        }
      }
      .ant-collapse-content {
        color: @black;
        @apply mt-4;
      }

      .ant-collapse-header {
        font-size: @size-14;
        padding: @padding-12 @padding-40 @padding-12 @padding-16;
        @apply rounded-lg font-bold;
        svg {
          top: 42%;
        }
      }
      .ant-collapse-item-active {
        .ant-collapse-header {
          color: @primary;
          background-color: @primary-3;
        }
      }
    }
  }
  &__news {
    @apply w-full;
    .desktop({
      width: 42%;
      margin-left: 1%;
    });
    .support-title {
      @apply px-4;
    }
    /deep/.custom-table {
      .ant-table-thead > tr > th {
        background: @primary-4;
        padding: @padding-16;
        font-size: @size-14;
        .ant-table-column-title {
          color: @black;
          @apply font-medium;
        }
      }
      .ant-table-body {
        .ant-table-tbody > tr > td {
          padding: @padding-16;
          padding-bottom: @padding-8;
          font-size: @size-14;
          @apply font-normal;
        }
        .ant-table-row-cell-last {
          @apply pr-12;
        }
        .ant-table-row {
          &:hover {
            td {
              background-color: @primary-3;
            }
          }
        }
        .name {
          color: @black;
          @apply font-normal truncate mb-0;
        }
        .time {
          @apply pr-6;
        }
      }
      .ant-table-footer {
        background: transparent;
        padding: @padding-16;
        @apply text-right;
        a {
          color: @black;
          @apply inline-flex items-center font-bold hover:underline;
          svg {
            @apply ml-2;
          }
        }
      }
    }
  }
}
</style>
