const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    projectId: 'crm-agency',
    baseUrl: 'http://localhost:4000',
    viewportWidth: 1920,
    viewportHeight: 1080,
    defaultCommandTimeout: 30000,
    env: {},
    video: true,
    reporter: 'junit',
    reporterOptions: {
      mochaFile: 'cypress/reports/test-report-[hash].xml',
      toConsole: true,
    },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config)
      return config
    },
  },
})
