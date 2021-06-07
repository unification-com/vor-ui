import { ETHERSCAN_URL, XFUND_DECIMAL } from "./Constants"

const BigNumber = require("bignumber.js")

export const openAddress = (address) => {
  return `${ETHERSCAN_URL}/address/${address}`
}

export const openTx = (hash) => {
  return `${ETHERSCAN_URL}/tx/${hash}`
}

export const toXFund = (number) => {
  return BigNumber(number)
    .div(BigNumber(`1e${XFUND_DECIMAL}`))
    .toFixed()
}

export const convertWeiToGwei = (number) => {
  return BigNumber(number).div(BigNumber(`1e9`)).toFixed()
}

export const convertWeiToEth = (number) => {
  return BigNumber(number).div(BigNumber(`1e18`)).toFixed()
}
