import React from "react"
import { Tooltip, withStyles } from "@material-ui/core"
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

export const sliceString = (str, labelLength) => {
  const side = parseInt(labelLength / 2, 10) || 4
  if (typeof str !== "string") return str
  if (str.length < 15) return str
  const cut = str.slice(side, str.length - side)
  return str.replaceAll(cut, "....")
}

export const StyledTooltip = withStyles({
  tooltip: {
    fontSize: "18px",
    color: "white",
    backgroundColor: "#2196f3",
  },
})(Tooltip)

export const addPopup = (value, labelLength) => {
  return typeof value !== "string" || value.length < 15 ? (
    value
  ) : (
    <StyledTooltip title={value} placement="top">
      <span className="cellValue">{sliceString(value, labelLength)}</span>
    </StyledTooltip>
  )
}
