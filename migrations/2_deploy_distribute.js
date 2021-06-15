require("dotenv").config()
const XYDistribution = artifacts.require("XYDistribution")

const { VORCOORDINATOR_ADDRESS, XFUND_ADDRESS } = process.env

module.exports = function(deployer) {
  deployer.deploy(XYDistribution, VORCOORDINATOR_ADDRESS, XFUND_ADDRESS)
}
