import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import Button from "@material-ui/core/Button"
import InputBase from "@material-ui/core/InputBase"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import IconButton from "@material-ui/core/IconButton"
import SearchIcon from "@material-ui/icons/Search"
import VisibilityIcon from "@material-ui/icons/Visibility"
import { useHistory } from "react-router"
import CustomPaginationActionsTable from "../components/PaginationTable"
import { getRequests, getOracles } from "../api"
import { ETHERSCAN_URL } from "../utils/Constants"
import { addPopup, convertWeiToGwei, openTx, sliceString, toXFund } from "../utils/common"
import TopNav from "../components/TopNav/TopNav"
import Header from "../components/Header/Header"

const useStyles = makeStyles({
  wrapper: {
    marginTop: 30,
  },
  searchWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
  },
  searchbar: {
    fontFamily: "Poppins, sans-serif",
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: 833,
    height: 73,
    background: "#FEFDFD",
    border: "1px solid #FFFFFF",
    borderRadius: "10px 4px 4px 10px",
  },
  searchIcon: {
    marginLeft: 28,
    width: 38,
    height: 38,
    color: "#BFBFBF",
  },
  input: {
    fontFamily: "Poppins, sans-serif",
    marginLeft: 42,
    flex: 1,
    fontSize: 24,
  },
  searchButton: {
    fontFamily: "Poppins, sans-serif",
    padding: "10px 33px",
    fontSize: 24,
    textTransform: "none",
    height: 73,
    marginRight: -3,
    backgroundColor: "#005491",
    color: "#FFFFFF",
    border: "2px solid #F1F2F6",
    borderRadius: "4px 10px 10px 4px",
    "&:hover": {
      backgroundColor: "#005491e6",
    },
  },
  searchBarSubTitel: {
    fontSize: 24,
    lineHeight: "36px",
    margin: 16,
    color: "#000000",
  },
  container: {
    padding: 10,
  },
  tableContainer: {
    backgroundColor: "transparent",
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
  table: {
    minWidth: 650,
    backgroundColor: "#ffffff",
    borderRadius: 10,
  },
  tableHead: {
    height: "35px",
    background: "#363435",
    borderRadius: "10px",
  },
  iconButton: {
    padding: 0,
  },
  bottomBtnsContainer: {
    display: "flex",
    justifyContent: "space-around",
    margin: "50px 40px 90px",
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
  bottomBtnSubHeading: {
    fontWeight: "normal",
    fontSize: 18,
    lineHeight: "20px",
  },
  footer: {
    height: 58,
    padding: "15px 50px",
    background: "#363435",
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: "30px",
  },
})

export const StyledTableCell = withStyles((theme) => ({
  root: {
    height: 35,
    fontFamily: "Poppins, sans-serif",
    fontStyle: "normal",
    fontWeight: "normal",
    padding: "3px 15px 0",
    textAlign: "center",
    "&:first-child": {
      // padding: "3px 10px 0",
    },
  },
  head: {
    backgroundColor: "#363435",
    height: 35,
    paddingTop: 3,
    whiteSpace: "nowrap",
    fontSize: 21,
    lineHeight: "31px",
    color: "#FFFFFF",
    "&:first-child": {
      borderRadius: "10px 0 0 10px",
      width: 30,
      // paddingRight: 0,
    },
    "&:last-child": {
      borderRadius: "0 10px 10px 0",
    },
  },
  body: {
    fontWeight: "500",
    fontSize: "17px",
    lineHeight: "25px",
    height: "64px",
    paddingTop: 26,
    paddingBottom: 12,
    overflow: "visible",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}))(TableCell)

const StyledTableRow = withStyles((theme) => ({
  root: {
    height: "35px",
    // "&:nth-of-type(odd)": {
    //   backgroundColor: theme.palette.action.hover,
    // },
  },
  head: {
    borderRadius: 10,
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
            ? convertWeiToGwei(item.RandomnessRequestFulfilled.gasPrice)
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
  query: PropTypes.string,
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
    <>
      <div className={classes.container}>
        <TopNav />
        <Header />
        <div className={classes.searchWrapper}>
          <form
            component="form"
            className={classes.searchbar}
            onSubmit={(e) => {
              e.preventDefault()
              setQuery(searchStr)
            }}
          >
            <SearchIcon className={classes.searchIcon} />
            <InputBase
              type="text"
              className={classes.input}
              placeholder="Universal Search"
              inputProps={{ "aria-label": "Search random value/request ID/contact" }}
              onChange={onChangeSearchQuery}
            />
            <Button type="button" onClick={onSearch} className={classes.searchButton} aria-label="search">
              Search
            </Button>
          </form>
          <p className={classes.searchBarSubTitel}>Search Any Random Value, Request ID, Key Hash, etc</p>
        </div>
        <TableContainer className={classes.tableContainer}>
          <h3 className={classes.tableHeader}>RECENT ACTIVITY</h3>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>#</StyledTableCell>
                <StyledTableCell>Action</StyledTableCell>
                <StyledTableCell>Key Hash</StyledTableCell>
                <StyledTableCell style={{textAlign: "left"}}>Wallet address</StyledTableCell>
                <StyledTableCell>Public Key</StyledTableCell>
                <StyledTableCell>Fee</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {oracles.map((row, index) => (
                <StyledTableRow key={row.keyHash}>
                  <StyledTableCell component="th">
                    {index}
                  </StyledTableCell>
                  <StyledTableCell>
                    <IconButton className={classes.iconButton} onClick={() => goToDetail(row)}>
                      <VisibilityIcon />
                    </IconButton>
                  </StyledTableCell>
                  <StyledTableCell>{addPopup(row.keyHash)}</StyledTableCell>
                  <StyledTableCell style={{textAlign: "left"}}>
                    <a
                      className="cellLink"
                      href={`${ETHERSCAN_URL}/address/${row.providerAddress}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {row.providerAddress}
                    </a>
                  </StyledTableCell>
                  <StyledTableCell>{row.publicKey}</StyledTableCell>
                  <StyledTableCell>{toXFund(row.fee)}</StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div className={classes.wrapper}>
          <RequestTable history={history} query={query} />
        </div>
        <div className={classes.bottomBtnsContainer}>
          <a className={classes.bottomBtn}>Integrate VOR API</a>
          <a className={classes.bottomBtn}>
            <span>Recieve Random Value</span>
            <span className={classes.bottomBtnSubHeading}>Coming Soon</span>
          </a>
        </div>
      </div>
      <footer className={classes.footer}>Verified Open Randomness by Unification</footer>
    </>
  )
}

export default ListOracle
