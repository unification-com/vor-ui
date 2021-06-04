import React, { useEffect, useState } from "react"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"
import IconButton from "@material-ui/core/IconButton"
import VisibilityIcon from "@material-ui/icons/Visibility"
import { useHistory } from "react-router"
import { getOracles } from "../api"
import { ETHERSCAN_URL } from "../utils/Constants"

const useStyles = makeStyles({
  container: {
    padding: 10,
  },
  table: {
    minWidth: 650,
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

function ListOracle() {
  const classes = useStyles()
  const history = useHistory()
  const [oracles, setOracles] = useState([])
  useEffect(() => {
    getOracles().then((res) => {
      setOracles(res.oracles)
    })
  }, [])

  const goToDetail = (item) => {
    history.push(`/${item.keyHash}`)
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
                <TableCell>{row.fee}</TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default ListOracle
