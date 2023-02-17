<template>
  <div class="app-pagination">
    <div class="app-pagination__limit">
      <span class="app-pagination__limit--label">
        {{ $t('items-per-page') }}
      </span>
      <a-dropdown :trigger="['click']">
        <span class="app-pagination__limit--number">
          {{ pageSize }}
          <a-icon type="caret-down"></a-icon>
        </span>
        <a-menu slot="overlay">
          <a-menu-item
            v-for="limit in limitOptions"
            :key="limit"
            @click="() => handleChangeLimit(limit)"
          >
            {{ limit }}
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <a-pagination
      :current="page"
      :page-size="pageSize"
      :total="total"
      @change="handleChangePage"
    />
  </div>
</template>

<script>
export default {
  name: 'AppPagination',
  props: {
    page: {
      type: Number,
      default: () => 1,
    },
    pageSize: {
      type: Number,
      default: () => 30,
    },
    total: {
      type: Number,
      default: () => 1,
    },
  },
  data() {
    return {
      limitOptions: [30, 40, 50],
    }
  },
  methods: {
    handleChangePage(page) {
      const query = {
        ...this.$route.query,
        page,
      }
      this.$router.push({ query })
    },
    handleChangeLimit(pageSize) {
      const query = {
        ...this.$route.query,
        page: 1,
        limit: pageSize,
      }
      this.$router.push({ query })
    },
  },
}
</script>

<style lang="less" scoped>
.app-pagination {
  font-size: @size-4;
  @apply flex items-center justify-end;
  &__limit {
    margin-right: 1rem;
    &--label {
      color: @black;
      margin-right: 0.5rem;
      font-size: @size-12;
    }
    &--number {
      color: @black;
      font-size: @size-12;
      @apply font-medium;
      i {
        @apply cursor-pointer align-middle;
      }
    }
  }
}

/deep/.ant-pagination {
  .ant-pagination-item-active {
    background-color: rgba(@primary, 0.1);
  }
}
/deep/.ant-pagination-item-link {
  @apply flex items-center justify-center;
}
</style>
