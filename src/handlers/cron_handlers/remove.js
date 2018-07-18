const logger = require('riverpig')('codius-cli:removeCronHandler')
const ora = require('ora')
const statusIndicator = ora({ text: '', color: 'blue', spinner: 'point' })
const crontab = require('crontab')
const { getCodiusState } = require('../../common/codius-state.js')
const inquirer = require('inquirer')
const { promisify } = require('util')
const fse = require('fs-extra')

async function removeCron (options) {
  try {
    const { codiusStateJson } = await getCodiusState(statusIndicator, options)
    const manifestHash = codiusStateJson.manifestHash

    statusIndicator.start('Getting existing cron job(s)')
    const load = promisify(crontab.load)
    const cron = await load()

    let jobs
    if (options.all) {
      const notice = ' This line has been auto-generated by the codius cli'
      jobs = await cron.jobs({comment: notice})
    } else {
      jobs = await cron.jobs({comment: manifestHash})
    }
    if (jobs.length < 1) {
      throw new Error('No cron jobs exist for the uploaded pod(s)')
    }
    statusIndicator.succeed()
    console.info('Existing cron job(s):')
    jobs.map((job) => { console.info(job.toString()) })

    if (!options.assumeYes) {
      const userResp = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueToRemoveCron',
          message: `Do you want to proceed with removing the cron job(s)?`,
          default: false
        }
      ])
      if (!userResp.continueToRemoveCron) {
        statusIndicator.start(`User declined to remove cron job(s)`)
        throw new Error('Cron job removal aborted by user')
      }
    }

    statusIndicator.start('Removing cron job(s)')
    cron.remove(jobs)
    cron.save()
    statusIndicator.succeed()

    statusIndicator.start('Updating Codius State File')
    codiusStateJson.status.cronJobs = []
    await fse.writeJson(options.codiusStateFile, codiusStateJson)
    statusIndicator.succeed(`Codius State File: ${options.codiusStateFile} updated`)
    process.exit(0)
  } catch (err) {
    statusIndicator.fail()
    logger.error(err.message)
    logger.debug(err)
    process.exit(1)
  }
}

module.exports = {
  removeCron
}
