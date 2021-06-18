require("dotenv").config()
const XYDistribution = artifacts.require("XYDistribution")

const { XFUND_ADDRESS, XFUND_ABI, VORCOORDINATOR_ADDRESS, VORCOORDINATOR_ABI,  } = process.env
KEY_HASH="0x1a7a24165e904cb38eb8344affcf8fdee72ac11b5c542428b35eef5769c409f0"
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = async function(callback) {
  const newtworkType = await web3.eth.net.getNetworkType();
  if(newtworkType !== "private") {
    console.log("run with Ganache")
    process.exit(1)
  }

  const accounts = await web3.eth.getAccounts()
  const xfund = await new web3.eth.Contract(JSON.parse(XFUND_ABI), XFUND_ADDRESS)
  const vorCoord = await new web3.eth.Contract(JSON.parse(VORCOORDINATOR_ABI), VORCOORDINATOR_ADDRESS)
  const consumerOwner = accounts[0]
  const provider = accounts[1]
  const dist = await XYDistribution.deployed();
  const fee = await vorCoord.methods.getProviderGranularFee(KEY_HASH, dist.address).call()
  let fromBlock = 0
  

  console.log("consumerOwner", consumerOwner)
  console.log("provider", provider)
  console.log("keyHash", KEY_HASH)
  console.log("XYDistribution", dist.address)
  console.log("fee", fee.toString())
  await dist.registerMoniker("Sky", { from: accounts[1] });
  await dist.increaseVorAllowance( "100000000000000000000000000", { from: consumerOwner } )
  await xfund.methods.transfer(accounts[1], fee).send({from: consumerOwner})
  await xfund.methods.increaseAllowance(dist.address, fee).send({from: accounts[1]})
  const seed = Date.now()
  try {
    await dist.startDistribute("ipfs://11111", 1000, 500, 1, seed, KEY_HASH, fee, {from: accounts[1]});
  }catch(e) {
    console.log(e);
  }

  console.log("wait....")

  await sleep(8000)

  const evs = await dist.getPastEvents("DistributeResult", {fromBlock: fromBlock, toBlock: "latest"})

  for(let i = 0; i < evs.length; i += 1) {
    console.log(
      "DistributeResult Event - Distribution #",
      evs[i].returnValues.requestID,
      evs[i].returnValues.distID,
      evs[i].returnValues.requester,
      evs[i].returnValues.beginIndex,
      evs[i].returnValues.sourceCount,
      evs[i].returnValues.destCount,
      evs[i].returnValues.dataType,
    );
  }
  callback()
}
