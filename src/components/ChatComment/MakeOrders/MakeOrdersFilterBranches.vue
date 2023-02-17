<template>
  <a-col :span="12">
    <a-select
      :value="selectedBranch"
      class="custom-select"
      style="width: 100%"
      :placeholder="`${$t('allBranches')} (${branches.length})`"
      dropdown-class-name="select__dropdown"
      default-value=""
      :loading="isLoading"
    >
      <a-select-option :value="0" @click="handleClickBranch">
        {{ $t('allBranches') }} ({{ branches.length }})
      </a-select-option>
      <a-select-option
        v-for="branch in branches"
        :key="branch.id"
        :value="branch.id"
        @click="handleClickBranch"
      >
        {{ branch.name }}
      </a-select-option>
    </a-select>
  </a-col>
</template>
<script>
export default {
  name: 'MakeOrdersFilterBranches',
  props: {
    selectedBranch: {
      type: Number,
      default: 0,
    },
    branches: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleClickBranch(e) {
      if (e.key === this.selectedBranch) return
      this.$emit('handleClickBranch', e.key)
    },
  },
}
</script>
<style lang="less" scoped>
.custom-select {
  color: @black;
  height: @height-field;
  margin-bottom: @margin-12;
  &.ant-select-disabled {
    .ant-select-selection {
      background-color: @white;
      cursor: default;
    }
  }
  /deep/.ant-select-selection {
    height: @height-field !important;
    border-color: @gray-4;
    &__rendered {
      line-height: @height-field;
    }
  }
  /deep/.ant-select-arrow {
    color: @black;
  }
}
</style>
