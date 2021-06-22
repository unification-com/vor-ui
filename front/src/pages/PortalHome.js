import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { makeStyles } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"
import { useHistory } from "react-router"
import { getDistRequesters, getDistRequests } from "../api"
import { VORCOORDINATOR_ADDRESS, XFUND_ADDRESS, XYDistribution_ADDRESS } from "../utils/Constants"
import { openAddress, openIPFS, openTx, toXFund } from "../utils/common"
import Header from "../components/WalletHeader/Header"
import { ethers } from 'ethers'
import getSigner from '../utils/signer'
import { initOnboard, initNotify } from '../utils/services'
import {MockERC20ABI, VORCoordinatorABI, XYDistributionABI} from '../abis/abis'
import { TextField } from "@material-ui/core"
import CustomPaginationActionsTable from "../components/PaginationTable"

const useStyles = makeStyles({
  container: {
    padding: 18
  },
  wrapper: {
    marginTop: 30,
  },  
  inputField: {
    fontFamily: "Poppins, sans-serif",
    flex: 1,
    fontSize: 32,
    marginBottom: 22,
  },
  monikerRow: {
    fontFamily: "Poppins, sans-serif",
    // font-style: normal,
    fontWeight: "normal",
    fontSize: 24,
    marginBottom: 11,
    lineHeight: "36px",
    color: "#000000",
  },
  centerAlign: {
    display: 'flex',
    justifyContent: "center",
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
  tableHeader: {
    fontFamily: "Poppins, sans-serif",
    // font-style: normal,
    fontWeight: "normal",
    fontSize: 24,
    marginBottom: 11,
    lineHeight: "36px",
    color: "#000000",
  },
})

let provider
let XYDistContract

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
          XYDistContract = new ethers.Contract(
            XYDistribution_ADDRESS,
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
  
  async function getMoniker() {
    const result = await XYDistContract.getMoniker()
    
    if (result)
      setMonicker(result)
  }

  async function registerMoniker() {
    if (!moniker)
      return alert("Moniker is required")
    if (moniker.length > 30)
      return alert("Moniker should be less than 30 characters")

    const { hash } = await XYDistContract.registerMoniker(
      moniker
    )

    const { emitter } = notify.hash(hash)

    emitter.on('txSent',  console.log)
    emitter.on('txPool', console.log)
    emitter.on('txConfirmed', () => {
      getMoniker()
    })
    emitter.on('txSpeedUp', console.log)
    emitter.on('txCancel', console.log)
    emitter.on('txFailed', console.log)
  }

  function gotoRequest() {
    history.push(`portal/request`)
  }

  return onboard && notify ? (
    <div className={classes.container}>
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
              onChange={(e) => {setMonicker(e.target.value)}}
              InputProps={{
              }}
            />
            <Button className={classes.bottomBtn} onClick={() => {registerMoniker()}}>Register Moniker</Button>
          </div> : <div>
            <div className={classes.monikerRow}>Your moniker: {moniker}</div>
            <div className={classes.centerAlign}>
              <Button className={classes.bottomBtn} onClick={() => {gotoRequest()}}>Request Randomness</Button>
            </div>
            <h3 className={classes.tableHeader}>My Requests</h3>
            <RequestTable address={address} history={history}/>
            <h3 className={classes.tableHeader}>All requesters</h3>
            {<RequesterTable address={address} history={history}/>}
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


function RequestTable({ address, history }) {
  const [reload, setReload] = useState(1)
  const loadData = (page, rowsPerPage) => {
    return getDistRequests(address, page, rowsPerPage).then((res) => {
      const { requests } = res
      const { count, rows } = requests
      const parsedRows = rows.map((item, index) => {
        const pItem = {
          id: item.requestID,
          index: index + 1,
          keyHash: item.keyHash,
          requestID: item.requestID,
          distID: item.distID,
          status: item.DistributeResult ? "Fulfilled" : "Request",
          sourceCount: item.sourceCount,
          targetCount: item.destCount,
          output: item.DistributeResult ? item.DistributeResult.beginIndex : "",
          ipfs: item.ipfs,
          requestTxHash: item.txHash,
          requestFee: toXFund(item.fee),
          fulfilledTxHash: item.DistributeResult ? item.DistributeResult.txHash : "",
        }
        return pItem
      })
      return {
        rows: parsedRows,
        count,
      }
    })
  }
  const goOracleDetail = (item) => {
    history.push(`/${item.keyHash}`, {
      data: item,
    })
  }

  const goRequestDetail = (item) => {
    history.push(`/request/${item.requestID}`, {
      data: item,
    })
  }

  const goDistDetail = (item) => {
    history.push(`/request/${item.requestID}`, {
      data: item,
    })
  }

  return (
    <CustomPaginationActionsTable
      loadData={loadData}
      fullLoaded={reload}
      fields={[
        { value: "index", label: "#" },
        { value: "keyHash", label: "Key Hash", action: goOracleDetail },
        { value: "requestID", label: "Request ID", action: goRequestDetail },
        { value: "distID", label: "Distribution ID", action: goDistDetail },
        { value: "status", label: "Status" },
        { value: "sourceCount", label: "Source Count" },
        { value: "targetCount", label: "Target Count" },
        { value: "output", label: "Random Value" },
        { value: "ipfs", label: "IPFS", link: openIPFS},
        { value: "requestTxHash", label: "Request TX Hash", link: openTx },
        { value: "requestFee", label: "Request Fee" },
        { value: "fulfilledTxHash", label: "Fulfilled TX Hash", link: openTx },
      ]}
      pagination={[15, 25, 40, { label: "All", value: -1 }]}
    />
  )
}

RequestTable.propTypes = {
  history: PropTypes.object.isRequired,
  address: PropTypes.string,
}

function RequesterTable({ history }) {
  const [reload, setReload] = useState(1)
  const loadData = () => {
    return getDistRequesters().then((res) => {
      const { requesters } = res
      const count = requesters.length;
      const parsedRows = requesters.map((item, index) => {
        const pItem = {
          id: index + 1,
          index: index + 1,
          moniker: item.moniker,
          address: item.requester,
          txHash: item.txHash,
          createdAt: item.createdAt
        }
        return pItem
      })
      return {
        rows: parsedRows,
        count,
      }
    })
  }

  const goRequesterDetail = (item) => {
    history.push(`/portal/requester/${item.address}`, {
      data: item,
    })
  }

  return (
    <CustomPaginationActionsTable
      loadData={loadData}
      fullLoaded={reload}
      fields={[
        { value: "index", label: "#" },
        { value: "moniker", label: "Moniker", action: goRequesterDetail},
        { value: "address", label: "Wallet Addresss", link: openAddress },
        { value: "createdAt", label: "Register Date"},
        { value: "txHash", label: "Tx Hash", link: openTx},        
      ]}
      pagination={[15, 25, 40, { label: "All", value: -1 }]}
    />
  )
}

RequesterTable.propTypes = {
  history: PropTypes.object.isRequired,
}

export default App