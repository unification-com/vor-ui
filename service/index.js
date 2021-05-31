require("dotenv").config()
const arg = require("arg")
const { ProviderOracle } = require("./oracle")

const env = process.env.NODE_ENV || "development"

const args = arg({
  // Types
  "--run": String,
  "--event": String,
  "--test": String,

  // Aliases
  "-r": "--run",
  "-e": "--event",
})

console.log(new Date(), "running in", env)

const run = async () => {
  const runWhat = args["--run"]
  const oracle = new ProviderOracle()

  switch (runWhat) {
    case "run-oracle":
      await oracle.initOracle()
      await oracle.runOracle()
      break
    default:
      console.log(new Date(), "nothing to do")
      process.exit(0)
      break
  }
}

run()