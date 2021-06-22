import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { makeStyles } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"
import { useHistory } from "react-router"
import { getOracles, addDatatoIPFS } from "../api"
import { ETHERSCAN_URL, VORCOORDINATOR_ADDRESS, XFUND_ADDRESS, XYDistribution_ADDRESS } from "../utils/Constants"
import { addPopup, convertWeiToGwei, openTx, parseCSV, shuffle, } from "../utils/common"
import Header from "../components/WalletHeader/Header"
import { ethers } from 'ethers'
import VConsole from 'vconsole'
import getSigner from '../utils/signer'
import { initOnboard, initNotify } from '../utils/services'
import {MockERC20ABI, VORCoordinatorABI, XYDistributionABI} from '../abis/abis'
import { TextField } from "@material-ui/core"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import LoadingButton from '../components/LoadingButton';
import {ONE_TO_ONE_MAPPING, X_FROM_Y} from '../utils/Constants'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(2),
    width: 600,
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
    },
    '& .MuiFormControl-root': {
      margin: theme.spacing(1),
    },
    '& .MuiButtonBase-root': {
      margin: theme.spacing(2),
    },
  },
  metaroot: {
    width: '100%',
    margin: theme.spacing(1)
  },
  metarow: {
    display: 'flex',
    alignItems: 'center',
  },
  metaheader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
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
}));

let provider

let xFundContract
let XYDistContract
let VORCoordinator

function App() {
  const classes = useStyles();
  const [type, setType] = useState(ONE_TO_ONE_MAPPING)
  const [source, setSource] = useState("1;2;3;4;5;6;7;8;9;10")
  const [target, setTarget] = useState("10;9;8;7;6;5;4;3;2;1")
  const [selectCount, setSelectCount] = useState(0)
  const [usermeta, setUserMeta] = useState([])
  const [preshuffleSource, setPreshuffleSource] = useState(false)
  const [preshuffleTarget, setPreshuffleTarget] = useState(false)
  const [seed, setSeed] = useState(0)
  const [keyHash, setKeyHash] = useState("")
  const [oracleList, setOracleList] = useState([])
  const [loading, setLoading] = useState(false)

  const [address, setAddress] = useState(null)
  const [network, setNetwork] = useState(null)
  const [balance, setBalance] = useState(null)
  const [wallet, setWallet] = useState({})
  const [moniker, setMonicker] = useState(null)

  const [onboard, setOnboard] = useState(null)
  const [notify, setNotify] = useState(null)

  useEffect(() => {
    getOracles().then((res) => {
      setOracleList(res.oracles)
    })
    setSeed(Date.now())
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
            XFUND_ADDRESS,
            MockERC20ABI,
            getSigner(ethersProvider)
          )
          VORCoordinator = new ethers.Contract(
            VORCOORDINATOR_ADDRESS,
            VORCoordinatorABI,
            getSigner(ethersProvider)
          )
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

  async function readyToTransact() {
    if (!provider) {
      const walletSelected = await onboard.walletSelect()
      if (!walletSelected) return false
    }

    const ready = await onboard.walletCheck()
    return ready
  }

  async function getMoniker() {
    const result = await XYDistContract.getMoniker()
    setMonicker(result)
    console.log(result);
  }

  async function startDistribute(IpfsHash, sourceCnt, targetCnt, type, seed, keyHash) {
    if (!keyHash) {
      alert('An Oracle is required.')
      return
    }
    console.log(VORCoordinator,  XYDistContract.address);
    const fee = await VORCoordinator.getProviderGranularFee(keyHash, XYDistContract.address)
    console.log("fee", fee.toString())
    const {hash, wait} = await XYDistContract.increaseVorAllowance(fee)
    //const {hash, wait} = await xFundContract.increaseAllowance(XYDistContract.address, fee)
    wait().then(async res => {
      console.log("txConfirmed", res)
      const { hash } = await XYDistContract.startDistribute(IpfsHash, sourceCnt, targetCnt, type, seed, keyHash, fee)
      console.log(hash)
      setLoading(false)
    })
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (checkSourceTargets() != "")
      return alert("Check source and targets")
    if (!keyHash)
      return alert("An oracle is required")
    const data = generateJSON();
    setLoading(true)
    addDatatoIPFS(moniker, address, data)
      .then(res => {
        console.log("upload success", res);
        startDistribute(res.IpfsHash, data.num_sources, data.num_selections || data.num_targets, data.type, data.seed, keyHash)
      })
      .catch(e => {
        console.log(e)
        setLoading(false)
      })

  }

  function checkSourceTargets() {
    const sourceArray = parseCSV(source)
    const destArray = parseCSV(target)
    if (type == ONE_TO_ONE_MAPPING && sourceArray.length != destArray.length)
      return "Length is not matching"
    if (type == X_FROM_Y && sourceArray.length < selectCount)
      return "Target length is bigger than source length"
    return ""
  }

  function generateJSON() {
    const sourceArray = parseCSV(source)
    const destArray = parseCSV(target)
    const data = {
        requester_wallet_address: address,
        request_time: Date.now(),
        request_metadata: getMeta(),
        sources: preshuffleSource ? shuffle(sourceArray) : sourceArray,
        num_sources: sourceArray.length,
        type: type,
        seed: seed,
    }
    if( type == ONE_TO_ONE_MAPPING) {
      data.target = preshuffleTarget ? shuffle(destArray) : destArray
      data.num_targets = destArray.length
    } else {
      data.num_selections = selectCount
    }
    
    return data;  
  }
  
  function onChangeMeta(index, key, event) {
    const newmeta = [...usermeta]
    newmeta[index][key] = event.target.value
    setUserMeta(newmeta)
  }

  function getMeta() {
    return usermeta.filter(item => item[0] != "" && item[1] != "").map(item => ({
      [item[0]]: item[1]
    }))
  }

  function renderMetaFields() {
    return <div className={classes.metaroot}>
      <div className={classes.metaheader}>
        <div>Meta Fields</div>
        <IconButton color="primary" component="span" size="small"  onClick={() => {
            const newmeta = [...usermeta, ["", ""]]
            setUserMeta(newmeta)
          }}>
          <AddIcon/>
        </IconButton>
      </div>
      <div>
        {usermeta.map((item, index) => {
          return <div key={index} className={classes.metarow}>              
          <TextField id="outlined-basic" label="ID" variant="outlined" value={item[0]} onChange={(value) => {onChangeMeta(index, 0, value)}}/>
          <TextField id="outlined-basic" label="Value" variant="outlined" value={item[1]} onChange={(value) => {onChangeMeta(index, 1, value)}}/>
          <IconButton color="primary" size="small" component="span" onClick={() => {
              const newmeta = usermeta.filter((item, i) => i != index)
              setUserMeta(newmeta)
            }}>
            <RemoveIcon/>
          </IconButton>
          </div>
        })}
      </div>
    </div>
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
        <div className={classes.root}>
        <form className={classes.form} onSubmit={handleSubmit}>
          <FormControl className={classes.formControl}>
            <InputLabel id="type">Type</InputLabel>
            <Select
              labelId="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value={ONE_TO_ONE_MAPPING}>one-to-one mapping and distribution</MenuItem>
              <MenuItem value={X_FROM_Y}>x-to-y mapping and distribution</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Source"
            multiline
            rows={4}
            value={source}
            variant="outlined"
            fullWidth
            onChange={e => {
              setSource(e.target.value)
            }}
          />
          {type == ONE_TO_ONE_MAPPING ? <TextField
            label="Destination"
            multiline
            rows={4}
            value={target}
            variant="outlined"
            fullWidth
            onChange={e => {
              setTarget(e.target.value)
            }}
          /> :
          <TextField
            label="Select Count"
            variant="outlined"
            value={selectCount}
            onChange={(e) => setSelectCount(e.target.value)}
            />
          }
          {renderMetaFields()}
          <FormControlLabel
            control={<Checkbox checked={preshuffleSource} onChange={(e, chk)=>{setPreshuffleSource(chk)}}/>}
            label="Pre-shuffe source"
          />
          <FormControlLabel
            control={<Checkbox checked={preshuffleTarget} onChange={(e, chk)=>{setPreshuffleTarget(chk)}}/>}
            label="Pre-shuffe destination"
          />
          <FormControl className={classes.formControl}>
            <InputLabel id="type">Select Oracle</InputLabel>
            <Select
              labelId="type"
              value={keyHash}
              onChange={(e) => setKeyHash(e.target.value)}
            >
              {oracleList.map((item) => 
              <MenuItem key={item.keyHash} value={item.keyHash}>{item.keyHash}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Seed" variant="outlined" value={seed} onChange={(e) => setSeed(e.target.value)}/>
          <LoadingButton loading={loading} type="submit" className={classes.bottomBtn}>Start Distribute</LoadingButton>
        </form>
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