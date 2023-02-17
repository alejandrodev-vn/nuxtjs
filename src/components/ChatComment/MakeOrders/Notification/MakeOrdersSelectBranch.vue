<template>
  <a-modal
    class="modal-select-branch"
    :class="{ disabled }"
    centered
    :visible="visible"
    :closable="false"
    :cancel-text="$t('cancel')"
    :ok-text="$t('next')"
    destroy-on-close
    @cancel="handleCancel"
    @ok="handleConfirm"
  >
    <div class="modal-select-branch__head">
      <p class="title">{{ $t('titleSelectBranch') }}</p>
      <p class="note">
        {{ $t('noteSelectBranch') }}
      </p>
    </div>
    <label for="selectBranch">
      {{ $t('availableBranches') }}: {{ branches.length }}/{{
        totalNumberBranch
      }}
    </label>
    <a-select
      id="selectBranch"
      v-model="selectedBranch"
      class="custom-select"
      style="width: 100%"
      :placeholder="`${$t('allBranches')} (${branches.length})`"
      dropdown-class-name="select__dropdown"
    >
      <a-select-option
        v-for="item in branches"
        :key="item.branch_id"
        :value="item.branch_id"
      >
        {{ item.branch.name }}
      </a-select-option>
    </a-select>
  </a-modal>
</template>

<script>
export default {
  name: 'MakeOrdersSelectBranch',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    branches: {
      type: Array,
      default: () => [],
    },
    totalNumberBranch: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      selectedBranch: null,
      disabled: true,
    }
  },
  watch: {
    selectedBranch() {
      if (this.selectedBranch) this.disabled = false
    },
    branches() {
      this.selectedBranch = null
    },
  },
  methods: {
    handleConfirm() {
      if (!this.selectedBranch || this.disabled) {
        return
      }
      this.$emit('handleOpenCheckout', this.selectedBranch)
    },
    handleCancel() {
      this.$emit('closeSelectBranch')
    },
  },
}
</script>

<style lang="less" scoped>
.modal-select-branch {
  /deep/.ant-modal {
    width: 420px !important;
  }
  .title {
    color: @black;
    font-size: @size-16;
    @apply font-semibold mb-2;
  }
  .note {
    color: @gray-4;
    font-size: @size-12;
    font-style: italic;
  }
  label {
    color: @gray-1;
    font-size: @size-12;
    @apply block mb-2 font-medium;
  }
  /deep/.ant-modal-footer {
    border: 0;
    padding: 1.5rem !important;
    padding-top: 0 !important;
  }
  &.disabled {
    /deep/.ant-btn-primary {
      background-color: @gray-4;
      cursor: not-allowed;
      border: none;
    }
  }
  .custom-select {
    color: @black;
    height: @height-field;
    margin-bottom: @margin-12;
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
}
</style>
