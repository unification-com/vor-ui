import React, { useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"
import { useHistory } from "react-router"
import { getOracles, addDatatoIPFS } from "../api"
import { VORCOORDINATOR_ADDRESS, XFUND_ADDRESS, XYDistribution_ADDRESS } from "../utils/Constants"
import { shuffle, } from "../utils/common"
import Header from "../components/WalletHeader/Header"
import { ethers } from 'ethers'
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
import { CSVReader } from 'react-papaparse';

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
  monikerRow: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: "normal",
    fontSize: 24,
    marginBottom: 11,
    lineHeight: "36px",
    color: "#000000",
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
  const [source, setSource] = useState([])
  const [target, setTarget] = useState([])
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
  const [allowLoading, setAllowLoading] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const history = useHistory()

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
    if (!result) {
      gotoExplore()
    }
  }

  async function startDistribute(IpfsHash, sourceCnt, targetCnt, type, seed, keyHash) {
    if (!keyHash) {
      alert('An Oracle is required.')
      return
    }
    try {
      setLoading(true)
      const fee = await VORCoordinator.getProviderGranularFee(keyHash, XYDistContract.address)
      const { hash, wait } = await XYDistContract.startDistribute(IpfsHash, sourceCnt, targetCnt, type, seed, keyHash, fee)
      wait().then(async res => {
        setAllowed(false)
        setLoading(false)
      })

      const { emitter } = notify.hash(hash)

      emitter.on('txSent',  console.log)
      emitter.on('txPool', console.log)
      emitter.on('txConfirmed', console.log)
      emitter.on('txSpeedUp', console.log)
      emitter.on('txCancel', console.log)
      emitter.on('txFailed', console.log)
      
    } catch (e) {
      setLoading(false)
    }
  }

  async function allowRequest() {
    if (!keyHash) {
      alert('An Oracle is required.')
      return
    }
    try {
      setAllowLoading(true);
      const fee = await VORCoordinator.getProviderGranularFee(keyHash, XYDistContract.address)
      const {hash, wait} = await xFundContract.increaseAllowance(XYDistContract.address, fee)
      wait().then(async res => {
        setAllowLoading(false)
        setAllowed(true)
      })
      const { emitter } = notify.hash(hash)

      emitter.on('txSent',  console.log)
      emitter.on('txPool', console.log)
      emitter.on('txConfirmed', console.log)
      emitter.on('txSpeedUp', console.log)
      emitter.on('txCancel', console.log)
      emitter.on('txFailed', console.log)
    } catch(e) {
      setAllowLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const checkResult = checkSourceTargets()
    if (checkResult != "")
      return alert(checkResult)
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
    const sourceArray = source
    const destArray = target
    if (sourceArray.length == 0)
      return "Please uplod csv file"
    if (type == ONE_TO_ONE_MAPPING && sourceArray.length != destArray.length)
      return "Source length and Target length is not matching"
    if (type == X_FROM_Y && sourceArray.length < selectCount)
      return "Target length is bigger than source length"
    if (type == X_FROM_Y && selectCount <= 0)
      return "Target length is required"
    return ""
  }

  function generateJSON() {
    const sourceArray = source
    const destArray = target
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

  function handleOnDrop(csv) {
    console.log(csv)
    if (type == ONE_TO_ONE_MAPPING) {
      const sArr = []
      const tArr = []
      for(var i = 1; i < csv.length; i ++){
        sArr.push(csv[i].data[0])
        tArr.push(csv[i].data[1])
      }
      setSource(sArr)
      setTarget(tArr)
    } else {
      const sArr = []
      for(var i = 1; i < csv.length; i ++){
        sArr.push(csv[i].data[0])
      }
      setSource(sArr)
      setTarget([])
    }
  }
  function handleOnError(err) {
    console.log(err)
  }
  function handleOnRemoveFile(data) {
    console.log(data)
    setSource([])
    setTarget([])
  }
  function gotoExplore() {
    history.push(`/portal`)
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
        <div className={classes.monikerRow}>Your moniker: {moniker}</div>
        <Button className={classes.bottomBtn} onClick={gotoExplore}>Back to Explore</Button>
        <form className={classes.form} onSubmit={handleSubmit}>
          <FormControl className={classes.formControl}>
            <InputLabel id="type">Distribution Type</InputLabel>
            <Select
              labelId="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value={ONE_TO_ONE_MAPPING}>one-to-one mapping and distribution</MenuItem>
              <MenuItem value={X_FROM_Y}>x-to-y mapping and distribution</MenuItem>
            </Select>
          </FormControl>
          <CSVReader
            onDrop={handleOnDrop}
            onError={handleOnError}
            addRemoveButton
            onRemoveFile={handleOnRemoveFile}
          >
            <span>Drop CSV file here or click to upload.</span>
          </CSVReader>
          <TextField
            label="Source"
            multiline
            rows={4}
            value={source.join(';\n')}
            variant="outlined"
            fullWidth
            disabled={true}
            onChange={e => {
              setSource(e.target.value)
            }}
          />
          {type == ONE_TO_ONE_MAPPING ? <TextField
            label="Destination"
            multiline
            rows={4}
            value={target.join(';\n')}
            variant="outlined"
            fullWidth
            disabled={true}
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
          {type == ONE_TO_ONE_MAPPING && <FormControlLabel
            control={<Checkbox checked={preshuffleTarget} onChange={(e, chk)=>{setPreshuffleTarget(chk)}}/>}
            label="Pre-shuffe destination"
          />}
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
          <LoadingButton loading={allowLoading} disabled={allowed} onClick={allowRequest} className={classes.bottomBtn}>Allow distribute</LoadingButton>
          <LoadingButton loading={loading} disabled={!allowed} type="submit" className={classes.bottomBtn}>Start Distribute</LoadingButton>
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