require("dotenv").config()

export const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
)
export const SERVICE_API_URL = process.env.REACT_APP_SERVICE_API_URL
export const ETHERSCAN_URL = process.env.REACT_APP_ETHERSCAN_URL
export const IPFS_URL = 'https://gateway.pinata.cloud/ipfs'
export const XFUND_DECIMAL = 9
export const XFUND_ADDRESS = process.env.REACT_APP_XFUND_ADDRESS
export const VORCOORDINATOR_ADDRESS = process.env.REACT_APP_VORCOORDINATOR_ADDRESS
export const XYDistribution_ADDRESS = process.env.REACT_APP_XYDistribution_ADDRESS
export const ONE_TO_ONE_MAPPING = 1
export const X_FROM_Y = 2 
