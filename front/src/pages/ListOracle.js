import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import InputBase from '@material-ui/core/InputBase';
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"
import IconButton from "@material-ui/core/IconButton"
import SearchIcon from '@material-ui/icons/Search';
import VisibilityIcon from "@material-ui/icons/Visibility"
import { useHistory } from "react-router"
import CustomPaginationActionsTable from "../components/PaginationTable"
import { getRequests, getOracles } from "../api"
import { ETHERSCAN_URL } from "../utils/Constants"
import { convertGweiToEth, openTx, toXFund } from "../utils/common"

const useStyles = makeStyles({
  container: {
    padding: 10,
  },
  table: {
    minWidth: 650,
  },
  wrapper: {
    marginTop: 30,
  },
  searchWrapper: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginBottom: 10,
  },
  searchbar: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
  },
  input: {
    marginLeft: 10,
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
})
const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#0d0e22",
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell)

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow)

function RequestTable({ history, query }) {
  const [reload, setReload] = useState(1)
  useEffect(() => {
    setReload(reload + 1)
  }, [query])
  const loadData = (page, rowsPerPage) => {
    return getRequests("0", page, rowsPerPage, query).then((res) => {
      const { requests } = res
      const { count, rows } = requests
      const parsedRows = rows.map((item, index) => {
        const pItem = {
          id: item.requestID,
          index: index + 1,
          keyHash: item.keyHash,
          requestID: item.requestID,
          status: item.RandomnessRequestFulfilled ? "Fulfilled" : "Request",
          output: item.RandomnessRequestFulfilled ? item.RandomnessRequestFulfilled.output : "",
          requestTxHash: item.txHash,
          requestFee: toXFund(item.fee),
          fulfilledTxHash: item.RandomnessRequestFulfilled ? item.RandomnessRequestFulfilled.txHash : "",
          fulfilledGasUsed: item.RandomnessRequestFulfilled ? item.RandomnessRequestFulfilled.gasUsed : "",
          fulfilledGasPrice: item.RandomnessRequestFulfilled
            ? convertGweiToEth(item.RandomnessRequestFulfilled.gasPrice)
            : "",
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
    console.log(item)
    history.push(`/${item.keyHash}`, {
      data: item,
    })
  }

  const goRequestDetail = (item) => {
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
        { value: "status", label: "Status" },
        { value: "output", label: "Random Value" },
        { value: "requestTxHash", label: "Request TX Hash", link: openTx },
        { value: "requestFee", label: "Request Fee" },
        { value: "fulfilledTxHash", label: "Fulfilled TX Hash", link: openTx },
        { value: "fulfilledGasUsed", label: "Fulfilled Gas Used" },
        { value: "fulfilledGasPrice", label: "Fulfilled Gas Price" },
      ]}
      pagination={[15, 25, 40, { label: "All", value: -1 }]}
    />
  )
}

RequestTable.propTypes = {
  history: PropTypes.object.isRequired,
}

function ListOracle() {
  const classes = useStyles()
  const history = useHistory()
  const [oracles, setOracles] = useState([])
  const [query, setQuery] = useState("")
  const [searchStr, setSearchInput] = useState("")

  useEffect(() => {
    getOracles().then((res) => {
      setOracles(res.oracles)
    })
  }, [])

  const goToDetail = (item) => {
    history.push(`/${item.keyHash}`)
  }

  const onChangeSearchQuery = (e) => {
    setSearchInput(e.target.value)
  }

  const onSearch = () => {
    setQuery(searchStr)
  }

  return (
    <div className={classes.container}>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell>#</StyledTableCell>
              <StyledTableCell>Action</StyledTableCell>
              <StyledTableCell>Key Hash</StyledTableCell>
              <StyledTableCell>Wallet address</StyledTableCell>
              <StyledTableCell>Public Key</StyledTableCell>
              <StyledTableCell>Fee</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {oracles.map((row, index) => (
              <StyledTableRow key={row.keyHash}>
                <TableCell component="th" scope="row">
                  {index}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => goToDetail(row)}>
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
                <TableCell>{row.keyHash}</TableCell>
                <TableCell>
                  <a
                    href={`${ETHERSCAN_URL}/address/${row.providerAddress}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {row.providerAddress}
                  </a>
                </TableCell>
                <TableCell>{row.publicKey}</TableCell>
                <TableCell>{toXFund(row.fee)}</TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className={classes.wrapper}>
        <div className={classes.searchWrapper}>
          <Paper component="form" className={classes.searchbar} onSubmit={e => {
              e.preventDefault();
              setQuery(searchStr)
            }}>
            <InputBase
              type="text"
              className={classes.input}
              placeholder="Search random value/request ID/contact"
              inputProps={{ 'aria-label': 'Search random value/request ID/contact' }}
              onChange={onChangeSearchQuery}
            />
            <IconButton type="button" onClick={onSearch} className={classes.iconButton} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
        </div>
        <RequestTable history={history} query={query}/>
      </div>
    </div>
  )
}

export default ListOracle
