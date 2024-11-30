const { exec } = require('child_process')

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr)
        reject(error)
      }
      console.log(stdout)
      resolve()
    })
  })
}

async function build() {
  try {
    await runCommand('npm install')
    await runCommand('docker-compose up -d postgres')
    console.log('Waiting for Postgres to start...')
    await new Promise((resolve) => setTimeout(resolve, 5000))
    await runCommand('node index.js --test')
    process.exit(0)
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

build()
