require("dotenv").config()
const XYDistribution = artifacts.require("XYDistribution")

const { VORCOORDINATOR_ADDRESS, XFUND_ADDRESS } = process.env

module.exports = function(deployer, network) {
  switch (network) {
    default:
    case "development":
    case "develop":
        deployer.deploy(XYDistribution, VORCOORDINATOR_ADDRESS, XFUND_ADDRESS)
        break
    case "rinkeby":
    case "rinkeby-fork":
        deployer.deploy(XYDistribution, "0x6d5Ba663dDCa573557c8420256Dc85F31D9762B0", "0x245330351344F9301690D5D8De2A07f5F32e1149");
        break
  }
}
