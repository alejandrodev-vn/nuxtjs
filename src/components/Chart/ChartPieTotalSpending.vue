<script>
import { Pie } from 'vue-chartjs'
import { colorsChart } from '@/utils/chart'
import { today, last30Days } from '@/utils/moment'
const colors = colorsChart()

export default {
  name: 'ChartPieTotalSpending',
  extends: Pie,
  props: {
    data: {
      type: Object,
      default: null,
    },
    options: {
      type: Object,
      default: null,
    },
    range: {
      type: Array,
      default: () => [new Date(last30Days), new Date(today)],
    },
  },
  computed: {
    optionsChartLine() {
      const optionsCommon = {
        type: 'pie',
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          arc: {
            backgroundColor: '#22313F',
          },
        },
        title: {
          display: false,
          text: this.$t('total-spending'),
        },
        legend: {
          position: 'right',
          align: 'center',
          labels: {
            boxWidth: 16,
            padding: 20,
            fontSize: 14,
            fontColor: '#22313F',
          },
        },
        tooltips: {
          mode: 'index',
          intersect: true,
          position: 'nearest',
          backgroundColor: colors.tooltip,
          titleFontColor: 'black',
          titleFontSize: 16,
          titleFontFamily: 'Inter',
          titleMarginBottom: 10,
          bodyFontFamily: 'Inter',
          bodyFontSize: 14,
          bodyFontColor: 'black',
          xPadding: 15,
          yPadding: 15,
          caretPadding: 20,
          bodySpacing: 10,
          borderWidth: 0.5,
          borderColor: '#bdbdbd',
          callbacks: {
            title: (tooltipItem, data) => {
              return `${this.$t('date')} ${this.$moment(this.range[0]).format(
                'DD/MM/YYYY'
              )} - ${this.$moment(this.range[1]).format('DD/MM/YYYY')}`
            },
            label: (tooltipItem, data) => {
              let label = data.labels[tooltipItem.index] || ''
              if (label) {
                label += ': '
              }
              label +=
                new Intl.NumberFormat('ms-MS', {
                  style: 'currency',
                  currency: 'MYR',
                })
                  .format(
                    data.datasets[tooltipItem.datasetIndex].data[
                      tooltipItem.index
                    ]
                  )
                  .replace('.00', '') || 0
              return label
            },
          },
        },
      }
      return { ...optionsCommon, ...this.options }
    },
  },
  watch: {
    data() {
      this.renderChart(this.data, this.optionsChartLine)
    },
  },
  mounted() {
    this.renderChart(this.data, this.optionsChartLine)
  },
}
</script>
