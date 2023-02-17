<template>
  <div class="search-facebook-page">
    <div class="search-facebook-page__header">
      <div class="search-facebook-page__filters">
        <div class="search-facebook-page__filters__left">
          <a-input
            v-model="filter.search"
            size="large"
            placeholder="Search by Facebook page name"
          >
            <a-icon slot="prefix" type="search" />
          </a-input>
          <a-button
            type="primary"
            class="ml-4"
            style="height: 4.2rem"
            @click="handleSearch"
          >
            Search
          </a-button>
        </div>
      </div>
    </div>
    <div class="search-facebook-page__body">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
        :loading="isLoading"
      >
        <app-loading v-if="isLoading" />
        <template slot="viewPage" slot-scope="record">
          <span class="button-view-page" @click="handleClickViewPage(record)"
            >View here</span
          >
        </template>
        <template #footer>
          <app-pagination :page="page" :page-size="5" :total="total" />
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
Vue.use(notification)

export default {
  name: 'SearchFacebook',
  fetchOnServer: false,
  data() {
    return {
      page: 1,
      limit: 5,
      responses: [],
      total: 200,
      channels: [],
      isLoading: false,
      filter: {
        search: '',
      },
      exportFilters: {},
      isShowFilter: false,
      dataSource: [
        {
          id: '101053775970694',
          name: 'Dihoo studiowear',
          like: 207,
          follower: 198,
          city: 'Ho Chi Minh',
          country: 'Vietnam',
          location: 'District 1',
          street: 'Nguyen Van Thu',
          link: 'https://www.facebook.com/101053775970694',
        },
        {
          id: '106940510973775',
          name: 'Brooklyn Simmons',
          like: 50,
          follower: 60,
          city: 'Ho Chi Minh',
          country: 'Vietnam',
          location: 'District 3',
          street: 'Nguyen Van Thu',
          link: 'https://www.facebook.com/Facebook-HQ-166793820034304/',
        },
        {
          id: '170601099453775',
          name: 'Marvin McKinney',
          like: 509,
          follower: 677,
          city: 'Ho Chi Minh',
          country: 'Vietnam',
          location: 'District 1',
          street: 'Nguyen Van Thu',
          link: 'https://www.facebook.com/Facebook-HQ-166793820034304/',
        },
        {
          id: '177590105370694',
          name: 'Esther Howard',
          like: 78,
          follower: 152,
          city: 'Ho Chi Minh',
          country: 'Vietnam',
          location: 'District 2',
          street: 'Nguyen Van Thu',
          link: 'https://www.facebook.com/Facebook-HQ-166793820034304/',
        },
        {
          id: '159706901053774',
          name: 'Darrell Steward',
          like: 166,
          follower: 223,
          city: 'Ho Chi Minh',
          country: 'Vietnam',
          location: 'District 2',
          street: 'Nguyen Van Thu',
          link: 'https://www.facebook.com/Facebook-HQ-166793820034304/',
        },
      ],
    }
  },
  computed: {
    columns() {
      return [
        {
          title: 'Page ID',
          key: 'pageId',
          dataIndex: 'id',
          scopedSlots: { customRender: 'pageId' },
          align: 'center',
        },
        {
          title: 'Page name',
          key: 'pageName',
          dataIndex: 'name',
          scopedSlots: { customRender: 'pageName' },
          align: 'center',
        },
        {
          title: 'City',
          key: 'city',
          dataIndex: 'city',
          scopedSlots: { customRender: 'city' },
        },
        {
          title: 'Country',
          key: 'country',
          dataIndex: 'country',
          scopedSlots: { customRender: 'country' },
        },
        {
          title: 'Location',
          key: 'location',
          dataIndex: 'location',
          scopedSlots: { customRender: 'location' },
        },
        {
          title: 'Like',
          key: 'like',
          dataIndex: 'like',
          scopedSlots: { customRender: 'Like' },
        },
        {
          title: 'Follower',
          key: 'follower',
          dataIndex: 'follower',
          scopedSlots: { customRender: 'follower' },
        },
        {
          title: 'View page',
          key: 'viewPage',
          dataIndex: 'link',
          scopedSlots: { customRender: 'viewPage' },
        },
      ]
    },
  },
  methods: {
    handleSearch() {
      this.dataSource = [
        {
          id: '101053775970694',
          name: 'Dihoo studiowear',
          like: 207,
          follower: 198,
          city: 'Ho Chi Minh',
          country: 'Vietnam',
          location: 'District 1',
          street: 'Nguyen Van Thu',
          link: 'https://www.facebook.com/Dihoo-studiowear-101053775970694',
        },
      ]
      this.page = 1
      this.total = 1
    },
    handleClickViewPage(link) {
      window.open(link, '_blank')
    },
  },
}
</script>

<style lang="less" scoped>
.search-facebook-page {
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
    &__left {
      @apply flex items-center;
    }

    .ant-input-affix-wrapper {
      width: 40rem;
      height: 4.2rem;
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
      .ant-table-body {
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

.search-facebook-page-actions {
  @apply flex items-center justify-around;
  &__dropdown {
    color: @secondary-1;
    line-height: 1;
    margin: 0 0.5rem;
    &--item {
      min-width: 9rem;
      @apply text-center;
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
.button-view-page {
  color: @primary;
  text-decoration: underline;
  cursor: pointer;
}
</style>
