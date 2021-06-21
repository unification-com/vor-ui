import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { makeStyles } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"
import { useHistory } from "react-router"
import { getRequests, getOracles } from "../api"
import { ETHERSCAN_URL } from "../utils/Constants"
import { addPopup, convertWeiToGwei, openTx, toXFund } from "../utils/common"
import Header from "../components/WalletHeader/Header"
import { ethers } from 'ethers'
import VConsole from 'vconsole'
import getSigner from '../utils/signer'
import { initOnboard, initNotify } from '../utils/services'
import {MockERC20ABI, VORCoordinatorABI, XYDistributionABI} from '../abis/abis'
import { TextField } from "@material-ui/core"
import AccountCircle from '@material-ui/icons/AccountCircle';
import InputAdornment from '@material-ui/core/InputAdornment';

const useStyles = makeStyles({
  wrapper: {
    marginTop: 30,
  },  
  inputField: {
    fontFamily: "Poppins, sans-serif",
    flex: 1,
    fontSize: 32,
    marginBottom: 22,
  },
  registerWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
  },
  bottomBtn: {
    height: 69,
    lineHeight: "25px",
    fontFamily: "Poppins",
    fontStyle: "normal",
    fontWeight: 500,
    fontSize: 22,
    background: "#41A0E6",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    cursor: "pointer",
    "&:hover": {
      background: "#1482d4",
    },
  },
})


let provider

let xFundContract
let XYDistContract
let VORCoordinator

function App() {
  const classes = useStyles();
  const history = useHistory()
  const [address, setAddress] = useState(null)
  const [network, setNetwork] = useState(null)
  const [balance, setBalance] = useState(null)
  const [wallet, setWallet] = useState({})
  const [moniker, setMonicker] = useState(null)

  const [onboard, setOnboard] = useState(null)
  const [notify, setNotify] = useState(null)

  const [darkMode, setDarkMode] = useState(false)
  const [desktopPosition, setDesktopPosition] = useState('bottomRight')
  const [mobilePosition, setMobilePosition] = useState('top')

  const [toAddress, setToAddress] = useState('0x33e15B3A2d110A30f0b8C932CDA63A5A0115dE39')

  useEffect(() => {
    const onboard = initOnboard({
      address: setAddress,
      network: setNetwork,
      balance: setBalance,
      wallet: wallet => {
        if (wallet.provider) {
          setWallet(wallet)

          const ethersProvider = new ethers.providers.Web3Provider(
            wallet.provider
          )

          provider = ethersProvider

          xFundContract = new ethers.Contract(
            '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab',
            MockERC20ABI,
            getSigner(ethersProvider)
          )
          VORCoordinator = new ethers.Contract(
            '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
            VORCoordinatorABI,
            getSigner(ethersProvider)
          )
          XYDistContract = new ethers.Contract(
            '0x4bf749ec68270027C5910220CEAB30Cc284c7BA2',
            XYDistributionABI,
            getSigner(ethersProvider)
          )
          getMoniker()

          window.localStorage.setItem('selectedWallet', wallet.name)
        } else {
          provider = null
          setWallet({})
        }
      }
    })

    setOnboard(onboard)

    setNotify(initNotify())
  }, [])

  useEffect(() => {
    const previouslySelectedWallet = window.localStorage.getItem(
      'selectedWallet'
    )

    if (previouslySelectedWallet && onboard) {
      onboard.walletSelect(previouslySelectedWallet)
    }
  }, [onboard])

  async function readyToTransact() {
    if (!provider) {
      const walletSelected = await onboard.walletSelect()
      if (!walletSelected) return false
    }

    const ready = await onboard.walletCheck()
    return ready
  }

  async function sendHash() {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }

    const signer = getSigner(provider)

    const { hash } = await signer.sendTransaction({
      to: toAddress,
      value: 1
    })

    const { emitter } = notify.hash(hash)

    emitter.on('txPool', transaction => {
      return {
        // message: `Your transaction is pending, click <a href="https://rinkeby.etherscan.io/tx/${transaction.hash}" rel="noopener noreferrer" target="_blank">here</a> for more info.`,
        // or you could use onclick for when someone clicks on the notification itself
        onclick: () =>
          window.open(`https://rinkeby.etherscan.io/tx/${transaction.hash}`)
      }
    })

    emitter.on('txSent', console.log)
    emitter.on('txConfirmed', console.log)
    emitter.on('txSpeedUp', console.log)
    emitter.on('txCancel', console.log)
    emitter.on('txFailed', console.log)

  }

  async function transferXFund() {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }
    console.log(xFundContract);
    const { hash } = await xFundContract.transfer(
      toAddress,
      1000000000000000,
    )

    const { emitter } = notify.hash(hash)

    emitter.on('txSent', console.log)
    emitter.on('txPool', console.log)
    emitter.on('txConfirmed', console.log)
    emitter.on('txSpeedUp', console.log)
    emitter.on('txCancel', console.log)
    emitter.on('txFailed', console.log)
  }

  async function getMoniker() {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }
    const result = await XYDistContract.getMoniker()
    setMonicker(result)
    console.log(result);
  }

  async function registerMoniker() {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }
    console.log(xFundContract);
    const { hash } = await XYDistContract.registerMoniker(
      "Sky"
    )

    const { emitter } = notify.hash(hash)

    emitter.on('txSent', console.log)
    emitter.on('txPool', console.log)
    emitter.on('txConfirmed', console.log)
    emitter.on('txSpeedUp', console.log)
    emitter.on('txCancel', console.log)
    emitter.on('txFailed', console.log)
  }



  async function startDistribute() {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
      return
    }
    console.log(VORCoordinator,  XYDistContract.address);
    const KEY_HASH = '0x1a7a24165e904cb38eb8344affcf8fdee72ac11b5c542428b35eef5769c409f0'
    const fee = await VORCoordinator.getProviderGranularFee(KEY_HASH, XYDistContract.address)
    console.log("fee", fee.toString())
    const seed = Date.now()

    const {hash} = await XYDistContract.increaseVorAllowance(fee)
    setTimeout(async () => {
      const { hash } = await XYDistContract.startDistribute("ipfs://11111", 1000, 500, 1, seed, KEY_HASH, fee)
      console.log(hash)
    }, 10000)

    const { emitter } = notify.hash(hash)

    emitter.on('txSent', console.log)
    emitter.on('txPool', console.log)
    emitter.on('txConfirmed', console.log)
    emitter.on('txSpeedUp', console.log)
    emitter.on('txCancel', console.log)
    emitter.on('txFailed', console.log)
  }


  async function sendTransaction() {
    if (!toAddress) {
      alert('An Ethereum address to send Eth to is required.')
    }

    const signer = getSigner(provider)

    const txDetails = {
      to: toAddress,
      value: 1000000000000000
    }

    const sendTransaction = () =>
      signer.sendTransaction(txDetails).then(tx => tx.hash)

    const gasPrice = () => provider.getGasPrice().then(res => res.toString())

    const estimateGas = () =>
      provider.estimateGas(txDetails).then(res => res.toString())

    const { emitter } = await notify.transaction({
      sendTransaction,
      gasPrice,
      estimateGas,
      balance: onboard.getState().balance,
      txDetails
    })

    emitter.on('txRequest', console.log)
    emitter.on('nsfFail', console.log)
    emitter.on('txRepeat', console.log)
    emitter.on('txAwaitingApproval', console.log)
    emitter.on('txConfirmReminder', console.log)
    emitter.on('txSendFail', console.log)
    emitter.on('txError', console.log)
    emitter.on('txUnderPriced', console.log)
    emitter.on('txSent', console.log)
    emitter.on('txPool', console.log)
    emitter.on('txConfirmed', console.log)
    emitter.on('txSpeedUp', console.log)
    emitter.on('txCancel', console.log)
    emitter.on('txFailed', console.log)
  }

  function gotoRequest() {
    history.push(`/portal/request`)
  }

  return onboard && notify ? (
    <div>
      <Header onWalletConnect={() => {
        onboard.walletSelect()
      }} onWalletDisconnect={() => {
        onboard.walletReset()
      }} address={address} balance={balance} network={networkName(network)}/>
      {
        !address? <div>Please connect your wallet first to access the portal</div> :
        <div>
          {moniker == null ? <div className={classes.registerWrapper}>
            <TextField
              variant="filled"
              className={classes.inputField}
              id="input-with-icon-textfield"
              placeholder="Please input your moniker"
              onChange={() => {}}
              InputProps={{
              }}
            />
            <Button className={classes.bottomBtn} onClick={() => {registerMoniker()}}>Register Moniker</Button>
          </div> : <div>
            <Button onClick={() => {gotoRequest()}}>Request Randomness</Button>
            <Button onClick={() => {transferXFund()}}>Send Transaction</Button>
            <Button onClick={() => {startDistribute()}}>Start Distribute</Button>
          </div>}
        </div>
      }
    </div>
  ) : (
    <div>Loading...</div>
  )
}

function networkName(id) {
  switch (Number(id)) {
    case 1:
      return 'main'
    case 3:
      return 'ropsten'
    case 4:
      return 'rinkeby'
    case 5:
      return 'goerli'
    case 42:
      return 'kovan'
    case 100:
      return 'xdai'
    case 'localhost':
      return 'localhost'
    default:
      return 'local'
  }
}

export default App