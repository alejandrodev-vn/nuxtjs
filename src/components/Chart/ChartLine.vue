<script>
import { Line } from 'vue-chartjs'
import { colorsChart } from '@/utils/chart'
const colors = colorsChart()

export default {
  name: 'ChartLine',
  extends: Line,
  props: {
    data: {
      type: Object,
      default: null,
    },
    options: {
      type: Object,
      default: null,
    },
    isShowNumberYAxes: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    tooltipLine() {
      return {
        id: 'tooltipLine',
        beforeDraw: (chart) => {
          if (chart.tooltip._active && chart.tooltip._active.length) {
            const ctx = chart.ctx
            ctx.save()
            const activePoint = chart.tooltip._active[0]
            ctx.beginPath()
            ctx.setLineDash([5, 7])
            ctx.moveTo(activePoint._view.x, chart.chartArea.top)
            ctx.lineTo(activePoint._view.x, activePoint._view.y)
            ctx.lineWidth = 2
            ctx.strokeStyle = '#fb4e4e'
            ctx.stroke()
            ctx.restore()

            ctx.beginPath()
            ctx.moveTo(activePoint._view.x, activePoint._view.y)
            ctx.lineTo(activePoint._view.x, chart.chartArea.bottom)
            ctx.lineWidth = 2
            ctx.strokeStyle = '#fb4e4e'
            ctx.stroke()
            ctx.restore()
          }
        },
      }
    },
    optionsChartLine() {
      const optionsCommon = {
        type: 'line',
        responsive: true,
        maintainAspectRatio: false,
        hitRadius: 12,
        hoverRadius: 12,
        title: {
          display: false,
          text: this.$t('conversations'),
        },
        legend: {
          display: this.isShowNumberYAxes,
          position: 'bottom',
          align: 'start',
          labels: {
            boxWidth: 12,
            padding: 20,
          },
        },
        tooltips: {
          mode: 'index',
          intersect: false,
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
            title: (tooltipItem) => {
              return `${this.$t('date')} ${tooltipItem[0].label}`
            },
            label: (tooltipItem, data) => {
              let label = data.datasets[tooltipItem.datasetIndex]?.label || ''
              if (label) {
                label += ': '
              }
              label += !tooltipItem.yLabel
                ? `0 ${this.$t('conversation')}`
                : tooltipItem.yLabel === 1
                ? `1 ${this.$t('conversation')}`
                : `${tooltipItem.yLabel} ${this.$t('conversations')}`
              return label
            },
          },
        },
        scales: {
          yAxes: [
            {
              gridLines: {
                display: true,
                color: colors.grid,
                drawBorder: false,
              },
              ticks: {
                beginAtZero: true,
                display: this.isShowNumberYAxes,
                padding: 10,
                fontColor: colors.axes,
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: true,
                color: colors.grid,
              },
              ticks: {
                padding: 10,
                maxRotation: 20,
                fontColor: colors.axes,
              },
              type: 'time',
              time: {
                parser: 'YYYY/MM/DD',
                tooltipFormat: 'DD/MM/YYYY',
                unit: 'day',
                unitStepSize: 1,
                displayFormats: {
                  day: 'DD/MM/YYYY',
                },
              },
            },
          ],
        },
      }
      return { ...optionsCommon, ...this.options }
    },
  },
  watch: {
    data() {
      this.addPlugin(this.tooltipLine)
      this.renderChart(this.data, this.optionsChartLine)
    },
  },
  mounted() {
    this.addPlugin(this.tooltipLine)
    this.renderChart(this.data, this.optionsChartLine)
  },
}
</script>
