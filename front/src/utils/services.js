import Notify from "bnc-notify"
import Onboard from "bnc-onboard"

const networkId = 696969
const rpcUrl = "https://localhost:8545"
const apiUrl = "ws://localhost:8545"
const dappId = "6a157fb1-a2dc-4fd7-b29e-fdd854a18cd7"

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
        {
          walletName: "trezor",
          appUrl: "https://reactdemo.blocknative.com",
          email: "aaron@blocknative.com",
          rpcUrl,
        },
        {
          walletName: "ledger",
          rpcUrl,
        },
        {
          walletName: "walletConnect",
          infuraKey: "cea9deb6467748b0b81b920b005c10c1",
        },
        { walletName: "cobovault", appName: "React Demo", rpcUrl },
        {
          walletName: "lattice",
          appName: "Onboard Demo",
          rpcUrl,
        },
        { walletName: "coinbase" },
        { walletName: "status" },
        { walletName: "walletLink", rpcUrl },
        {
          walletName: "portis",
          apiKey: "b2b7586f-2b1e-4c30-a7fb-c2d1533b153b",
        },
        { walletName: "fortmatic", apiKey: "pk_test_886ADCAB855632AA" },
        { walletName: "torus" },
        { walletName: "trust", rpcUrl },
        { walletName: "opera" },
        { walletName: "operaTouch" },
        { walletName: "imToken", rpcUrl },
        { walletName: "meetone" },
        { walletName: "mykey", rpcUrl },
        { walletName: "wallet.io", rpcUrl },
        { walletName: "huobiwallet", rpcUrl },
        { walletName: "hyperpay" },
        { walletName: "atoken" },
        { walletName: "liquality" },
        { walletName: "frame" },
        { walletName: "tokenpocket", rpcUrl },
        { walletName: "authereum", disableNotifications: true },
        { walletName: "ownbit" },
        { walletName: "gnosis" },
        { walletName: "bitpie" },
        { walletName: "xdefi" },
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
