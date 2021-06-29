import Notify from "bnc-notify"
import Onboard from "bnc-onboard"

import {
  BLOCKNATIVE_API_KEY,
  WEB3_PROVIDER_HTTP,
  WEB3_PROVIDER_WS,
  NETWORK_ID,
  INFURA_KEY,
} from "./Constants"

const networkId = NETWORK_ID
const rpcUrl = WEB3_PROVIDER_HTTP
const apiUrl = WEB3_PROVIDER_WS
const dappId = BLOCKNATIVE_API_KEY
const infuraKey = INFURA_KEY

export function initOnboard(subscriptions) {
  const onboard = Onboard
  return onboard({
    dappId,
    hideBranding: false,
    networkId,
    apiUrl,
    darkMode: true,
    subscriptions,
    walletSelect: {
      wallets: [
        { walletName: "metamask" },        
      ],
    },
    walletCheck: [
      { checkName: "derivationPath" },
      { checkName: "connect" },
      { checkName: "accounts" },
      { checkName: "network" },
      { checkName: "balance", minimumBalance: "100000" },
    ],
  })
}

export function initNotify() {
  const notify = Notify
  return notify({
    dappId,
    networkId,
    apiUrl,
    onerror: (error) => console.log(`Notify error: ${error.message}`),
  })
}
