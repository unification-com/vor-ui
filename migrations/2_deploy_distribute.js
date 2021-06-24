require("dotenv").config()
const XYDistribution = artifacts.require("XYDistribution")

const { REACT_APP_VORCOORDINATOR_ADDRESS, REACT_APP_XFUND_ADDRESS } = process.env

module.exports = function(deployer, network) {
  switch (network) {
    default:
    case "development":
    case "develop":
        deployer.then(async () => {
          await deployer.deploy(XYDistribution, REACT_APP_VORCOORDINATOR_ADDRESS, REACT_APP_XFUND_ADDRESS)
        });
        break
    case "rinkeby":
    case "rinkeby-fork":
        deployer.then(async () => {
          await deployer.deploy(XYDistribution, "0x6d5Ba663dDCa573557c8420256Dc85F31D9762B0", "0x245330351344F9301690D5D8De2A07f5F32e1149");
        })
        break
  }
}
