import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import Paper from "@material-ui/core/Paper"
import VisibilityIcon from "@material-ui/icons/Visibility"
import { useHistory } from "react-router"
import CustomPaginationActionsTable from "../components/PaginationTable"
import { getOracleDetail, getOracleSummary, getOracleFeeHistory } from "../api"

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
  overviewContainer: {
    padding: "32px 48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    borderRadius: "10px",
  },
  separator: {
    borderRight: "1px solid rgba(128, 128, 128, 0.25)",
    height: "100px",
    marginRight: "48px",
    marginLeft: "48px",
  },
  overviewCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
})

function RequestTable({ keyHash, history }) {
  const loadData = (page, rowsPerPage) => {
    return getOracleDetail(keyHash, page, rowsPerPage).then((res) => {
      const { requests } = res
      const { count, rows } = requests
      const parsedRows = rows.map((item, index) => {
        const pItem = {
          id: item.requestID,
          index: index + 1,
          requestID: item.requestID,
          status: item.RandomnessRequestFulfilled ? "Request" : "Fulfilled",
          output: item.RandomnessRequestFulfilled ? item.RandomnessRequestFulfilled.output : "",
          requestTxHash: item.txHash,
          requestFee: item.fee,
          fulfilledTxHash: item.RandomnessRequestFulfilled ? item.RandomnessRequestFulfilled.txHash : "",
        }
        return pItem
      })
      return {
        rows: parsedRows,
        count,
      }
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
      fullLoaded={true}
      fields={[
        { value: "index", label: "#" },
        { action: goRequestDetail, icon: <VisibilityIcon />, label: "Action" },
        { value: "requestID", label: "Request ID" },
        { value: "status", label: "Status" },
        { value: "output", label: "Random Value" },
        { value: "requestTxHash", label: "Request TX Hash" },
        { value: "requestFee", label: "Request Fee" },
        { value: "fulfilledTxHash", label: "Fulfilled TX Hash" },
      ]}
    />
  )
}

RequestTable.propTypes = {
  keyHash: PropTypes.string.isRequired,
  history: PropTypes.func.isRequired,
}

function FeeTable({ keyHash }) {
  const [feeList, setFees] = useState([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    getOracleFeeHistory(keyHash).then((res) => {
      const { fees, granularFees } = res
      let rows = fees.concat(granularFees)
      rows = rows.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
      rows = rows.map((item, index) => ({
        id: item.txHash,
        index: index + 1,
        type: item.consumer ? "Granular" : "Global",
        fee: item.fee,
        consumer: item.consumer ? item.consumer : "",
        time: item.createdAt,
      }))
      setFees(rows)
      setLoaded(true)
    })
  }, [])
  const loadData = (page, rowsPerPage) => {
    return Promise.resolve({
      rows: feeList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      count: feeList.length,
    })
  }

  return (
    <CustomPaginationActionsTable
      loadData={loadData}
      fullLoaded={loaded}
      fields={[
        { value: "index", label: "#" },
        { value: "type", label: "Type" },
        { value: "fee", label: "Fee" },
        { value: "consumer", label: "Consumer Address" },
        { value: "time", label: "Time" },
      ]}
    />
  )
}

FeeTable.propTypes = {
  keyHash: PropTypes.string.isRequired,
}

function OracleDetail() {
  const [count, setRequestCount] = useState({
    requestCount: 0,
    fulfilledCount: 0,
  })
  const history = useHistory()
  const keyHash = history.location.pathname.split("/").reverse()[0]
  const classes = useStyles()

  useEffect(() => {
    getOracleSummary(keyHash).then((res) => {
      setRequestCount(res)
    })
  }, [])

  return (
    <div className={classes.container}>
      <Paper elevation={1} className={classes.overviewContainer}>
        <div className={classes.overviewCard}>
          <Typography variant="h6">Key Hash</Typography>
          <Typography variant="subtitle1">{keyHash}</Typography>
        </div>
        <div className={classes.separator}></div>
        <div className={classes.overviewCard}>
          <Typography variant="h6">Requests</Typography>
          <Typography variant="subtitle1">{count.requestCount}</Typography>
        </div>
        <div className={classes.separator}></div>
        <div className={classes.overviewCard}>
          <Typography variant="h6">Fulfilled</Typography>
          <Typography variant="subtitle1">{count.fulfilledCount}</Typography>
        </div>
      </Paper>
      <div className={classes.wrapper}>
        <RequestTable keyHash={keyHash} history={history} />
      </div>
      <div className={classes.wrapper}>
        <FeeTable keyHash={keyHash} />
      </div>
    </div>
  )
}

export default OracleDetail