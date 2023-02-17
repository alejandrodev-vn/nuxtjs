/**
 * How to use:
 *
 * npm i -g shipit-cli shipit-deploy
 *
 * To deploy for production env, just type and enter: shipit production
 */
module.exports = (shipit) => {
  shipit.initConfig({
    default: {
      workspace: '/var/www/cs-fe',
    },
    development: {
      servers: [
        {
          host: "vn-crm-dev",
          user: "ec2-user",
        }
      ],
      branch: "dev",
      tag: "dev",
      workDir: '/home/ec2-user/frontend'
    },
    production: {
      servers: [
        {
          host: "vn-crm-api",
          user: "ec2-user",
        }
      ],
      branch: "master",
      tag: "latest",
      workDir: '/home/ec2-user/frontend'
    },
    'tm-production': {
      servers: [
        {
          host: 'tm-crm-fe',
          user: 'ec2-user',
        },
      ],
      branch: 'sme-master',
      tag: 'tm-latest',
      workDir: '/home/ec2-user/sme-frontend',
    },
    'tm-development': {
      servers: [
        {
          host: 'tm-crm-dev',
          user: 'ec2-user',
        },
      ],
      branch: 'sme-dev',
      tag: 'tm-dev',
      workDir: '/home/ec2-user/frontend-dev-2',
    },
    'agency-production': {
      servers: [
        {
          host: 'tm-crm-fe',
          user: 'ec2-user',
        },
      ],
      branch: 'agency-master',
      tag: 'agency-latest',
      workDir: '/home/ec2-user/frontend',
    },
    'agency-development': {
      servers: [
        {
          host: "vn-crm-dev",
          user: "ec2-user",
        }
      ],
      branch: "agency-dev",
      tag: "agency-dev",
      workDir: '/home/ec2-user/frontend-agency'
    },
  })

  shipit.task('default', async () => {
    const envBranch = shipit.config.branch
    const dockerRepo = 'primehub/cs-sme-frontend'
    const tag = shipit.config.tag
    const workDir = shipit.config.workDir

    if (!tag) return console.error(`No tag configured, stop!`)

    if (!envBranch) return console.error(`No branch configured, stop!`)

    if (!workDir) return console.error(`No workDir configured, stop!`)

    /**
     * Verify with current local branch
     */
    const currentBranch = (
      await shipit.local(`git symbolic-ref --short HEAD`)
    ).stdout.replace(/\s/g, '')
    if (!currentBranch || currentBranch !== envBranch) {
      return console.error(
        `You current branch doesn't match with env branch.
                Your branch: ${currentBranch}
                Required branch from env: ${envBranch}
                Please correct and try-again!`
      )
    }

    /**
     * Local task
     */

    // Local task
    await shipit.local(
      `docker build . -f Dockerfile.${shipit['environment']} -t ${dockerRepo}:${tag}`
    )

    await shipit.local(`docker push ${dockerRepo}:${tag}`)

    /**
     * Remote task
     */
    await shipit.remote(`cd ${workDir} && ./dockerctl update`, {
      tty: true,
    })
  })
}
