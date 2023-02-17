<template>
  <div class="guest-management-table">
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :bordered="true"
      :custom-row="handleClickRow"
      :locale="locale"
      :loading="isLoading"
    >
      <template slot="name" slot-scope="name, record">
        <div class="guest-management-table-name">
          <app-avatar :image="record.image" :full-name="record.short_name" />
          <div class="guest-management-table-name__title">{{ name }}</div>
        </div>
      </template>
      <template slot="level" slot-scope="level">
        <span v-if="level" class="inline-block">
          <app-tag :type="levelColor[level]" style="width: 13rem" nowrap>
            {{ $t(level) }}
          </app-tag>
        </span>
        <span v-else class="inline-block"> -- </span>
      </template>
      <template #footer>
        <app-pagination :page="page" :page-size="limit" :total="total" />
      </template>
    </a-table>

    <a-drawer
      :visible="isShowDrawer"
      :closable="false"
      width="70vw"
      class="drawer-guest-detail"
      @close="handleCloseDrawer"
    >
      <span class="drawer-guest-detail__close" @click="handleCloseDrawer">
        <icon-right class="btn-trigger-collapse" />
      </span>
      <div class="drawer-guest-detail__content">
        <nuxt-child></nuxt-child>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { get, invert } from 'lodash'
import { convertUTCToLocal } from '@/utils/moment'

export default {
  name: 'GuestManagementTable',
  props: {
    guests: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isShowDrawer: false,
      page: 1,
      limit: this.$store.state.limit,
      levelColor: this.$store.state.levelColor,
      sort: '-created_at',
    }
  },
  computed: {
    columns() {
      return [
        {
          title: this.$t('guest-ID'),
          key: 'id',
          dataIndex: 'id',
          scopedSlots: { customRender: 'id' },
        },
        {
          title: this.$t('guest-name'),
          key: 'name',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: this.$t('email'),
          key: 'email',
          dataIndex: 'email',
          scopedSlots: { customRender: 'email' },
        },
        {
          title: this.$t('phone'),
          key: 'phone',
          dataIndex: 'phone',
          scopedSlots: { customRender: 'phone' },
        },
        {
          title: this.$t('city'),
          key: 'city',
          dataIndex: 'city',
          scopedSlots: { customRender: 'city' },
        },
        {
          title: this.$t('nation'),
          key: 'nation',
          dataIndex: 'nation',
          scopedSlots: { customRender: 'nation' },
        },
        {
          title: this.$t('level'),
          key: 'level',
          dataIndex: 'level',
          scopedSlots: { customRender: 'level' },
        },
        {
          title: this.$t('convo'),
          key: 'conversation',
          dataIndex: 'conversation',
          scopedSlots: { customRender: 'conversation' },
          // sorter: (a, b, sortOrder) => {
          //   this.sort =
          //     sortOrder === 'ascend'
          //       ? 'conversation_count'
          //       : '-conversation_count'
          //   return a.conversation_count - b.conversation_count
          // },
          align: 'right',
        },
        // {
        //   title: this.$t('curent-tags'),
        //   key: 'tags',
        //   dataIndex: 'tags',
        //   scopedSlots: { customRender: 'tags' },
        //   // sorter: (a, b, sortOrder) => {
        //   //   this.sort = sortOrder === 'ascend' ? 'tag_count' : '-tag_count'
        //   //   return a.tag_count - b.tag_count
        //   // },
        //   align: 'right',
        // },
        {
          title: this.$t('creation-date'),
          key: 'created_at',
          dataIndex: 'created_at',
          scopedSlots: { customRender: 'created_at' },
          sorter: (a, b, sortOrder) => {
            this.sort = sortOrder === 'ascend' ? 'created_at' : '-created_at'
            return new Date(a.created_at) - new Date(b.created_at)
          },
          defaultSortOrder:
            this.sort === 'created_at'
              ? 'ascend'
              : this.sort === '-created_at'
              ? 'descend'
              : null,
          align: 'center',
        },
        {
          title: this.$t('last-interaction'),
          key: 'date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' },
          // sorter: (a, b, sortOrder) => {
          //   this.sort =
          //     sortOrder === 'ascend' ? 'last_interaction' : '-last_interaction'
          //   return a.last_interaction - b.last_interaction
          // },
          align: 'center',
        },
      ]
    },
    levelType() {
      return invert(this.$store.state.level)
    },
    locale() {
      return {
        emptyText: <app-no-data text={this.$t('no-data')} />,
      }
    },
    dataSource() {
      return this.guests.map((item) => {
        const arrayName = item.full_name
          .split(' ')
          .map((x) => {
            return x.charAt(0).toUpperCase()
          })
          .splice(0, 2)
        const shortName = arrayName.join('')
        const guest = {
          key: item.id,
          id: item.social_profile_id,
          image: item.avatar,
          short_name: shortName,
          name: item.full_name,
          email: item.email || '--',
          phone: item.phone || '--',
          nation: get(item, 'country.data.name', '--') || '--',
          city: get(item, 'province.data.name', '--') || '--',
          level: this.levelType[item.level],
          conversation: item.conversation_count || 0,
          tags: item.tag_count || 0,
          date: item.last_interaction
            ? convertUTCToLocal(item.last_interaction, 'HH:mm DD/MM/YYYY')
            : '--',
          created_at: item.created_at
            ? convertUTCToLocal(item.created_at, 'HH:mm DD/MM/YYYY')
            : '--',
        }
        return guest
      })
    },
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(query) {
        const { page = 1, limit = this.$store.state.limit, sort } = query
        this.page = Number(page)
        this.limit = Number(limit)
        this.sort = sort
      },
    },
    sort() {
      const query = {
        ...this.$route.query,
        sort: this.sort,
      }
      if (!this.sort.length) delete query.sort
      this.$router.push({ query })
    },
  },
  created() {
    const guestID = this.$route.params.id
    if (guestID) {
      this.isShowDrawer = true
    }
  },
  methods: {
    handleClickRow(record) {
      return {
        on: {
          click: () => {
            this.isShowDrawer = true
            const query = {
              ...this.$route.query,
            }
            this.$router.push(
              this.localePath({
                path: `/conversations/guest-management/guest/${record.key}`,
                query,
              })
            )
          },
        },
      }
    },
    handleCloseDrawer() {
      this.isShowDrawer = false
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({ path: '/conversations/guest-management', query })
      )
    },
  },
}
</script>

<style lang="less" scoped>
.guest-management-table {
  /deep/.ant-table-content {
    .ant-table-body {
      table {
        thead {
          tr {
            height: @height-table;
            th {
              background-color: #f2f3f4;
              font-weight: 500;
              font-size: @size-14;
              line-height: 22px;
              color: @black;
              &:nth-child(10),
              &:last-child {
                width: 170px;
              }
            }
          }
        }
        tbody {
          tr {
            height: @height-table;
            @apply cursor-pointer;
            td {
              padding-inline: @padding-16;
              font-size: @size-14;
              line-height: @size-22;
              color: @color-table;
              white-space: nowrap;
              .app-tag {
                font-size: @size-14;
                @apply w-full text-center inline-block font-medium;
              }
            }
          }
        }
      }
    }
  }
}

.guest-management-table-name {
  @apply flex items-center;
  &__avatar {
    flex: 0 0 2.5rem;
    width: 2.5rem;
    height: 2.5rem;
    object-fit: cover;
    border-radius: 50%;
    background-color: @primary-3;
    color: @primary;
    font-size: @size-5;
    line-height: 1;
    @apply flex items-center justify-center font-semibold;
  }
  &__title {
    margin: 0 0.75rem;
  }
}

.drawer-guest-detail {
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
  &__content {
    height: 100%;
    @apply overflow-auto;
  }
  &.ant-drawer-open {
    /deep/.ant-drawer-content {
      @apply overflow-visible;
      .ant-drawer-body {
        height: 100%;
        padding: 0;
        @apply overflow-auto;
      }
    }
  }
}
</style>
