<template>
  <a-dropdown
    placement="bottomRight"
    :get-popup-container="(trigger) => trigger"
    :trigger="['click']"
  >
    <a-button icon="down"> </a-button>
    <a-menu slot="overlay">
      <perfect-scrollbar
        ref="ps"
        :options="{
          wheelPropagation: false,
          suppressScrollX: false,
        }"
        class="export-list"
        @ps-y-reach-end="handleScroll"
      >
        <div v-if="noData" class="export-file-no-data">
          <app-no-data :text="$t('no-data')" />
        </div>
        <div v-else>
          <a-menu-item v-for="item in files" :key="item.id">
            <div class="export-file">
              <a-icon type="delete" @click="handleDeleteExport(item)" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="22"
                height="22"
                viewBox="0 0 48 48"
                style="fill: #000"
              >
                <path
                  fill="#4CAF50"
                  d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"
                ></path>
                <path
                  fill="#FFF"
                  d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"
                ></path>
                <path fill="#2E7D32" d="M27 42L6 38 6 10 27 6z"></path>
                <path
                  fill="#FFF"
                  d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"
                ></path>
              </svg>
              <span
                rel="noreferrer"
                class="export-file__link"
                target="_blank"
                @click="handleDownloadExport(item.url)"
              >
                {{ item.file_name }}
              </span>
            </div>
          </a-menu-item>
        </div>
        <client-only>
          <div v-if="isLoadingMoreResult" class="mt-8 loadingMore">
            <app-loading />
          </div>
        </client-only>
      </perfect-scrollbar>
    </a-menu>
  </a-dropdown>
</template>

<script>
import { PerfectScrollbar } from 'vue2-perfect-scrollbar'
import 'vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css'

export default {
  name: 'ExportHistory',
  components: {
    PerfectScrollbar,
  },
  props: {
    files: {
      type: Array,
      default: () => [],
    },
    isLoadingMoreResult: {
      type: Boolean,
      default: () => false,
    },
  },
  computed: {
    noData() {
      return !this.isLoadingMoreResult && this.files.length === 0
    },
  },
  methods: {
    handleScroll() {
      this.$emit('loadMore')
    },
    handleDeleteExport(file) {
      this.$emit('delete', file)
    },
    handleDownloadExport(url) {
      window.open(url, '_blank')
    },
  },
}
</script>

<style lang="less" scoped>
.ps {
  max-height: 24.75rem;
}

.export-file {
  color: @black;
  padding: 1rem 1rem 0.5rem 1rem;
  @apply flex items-center;

  /deep/.anticon-delete {
    margin-right: 0.5rem;
  }

  &__link {
    color: @black;
    font-size: @size-4;
    margin-left: 0.5rem;
  }
}

.export-file-no-data {
  padding: 1rem 0.75em;
  min-width: 18rem;
}
</style>
