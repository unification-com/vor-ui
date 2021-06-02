import React, { Fragment, useEffect, useState } from "react";
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { useHistory } from "react-router";
import CustomPaginationActionsTable from "../components/PaginationTable";

const useStyles = makeStyles({
    container: {
        padding: 10
    },
    table: {
        minWidth: 650,
    },
});
const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);
const StyledTableRow = withStyles((theme) => ({
    root: {
        '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
        },
    },
}))(TableRow);

const RequestTable = function(requests) {
    return (
        <CustomPaginationActionsTable/>
    )
}
const FeeTable = function() {
    const fees = []
    return (
        <TableContainer component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>#</StyledTableCell>
                        <StyledTableCell>Type</StyledTableCell>
                        <StyledTableCell>Fee</StyledTableCell>
                        <StyledTableCell>Consumer Address</StyledTableCell>
                        <StyledTableCell>Time</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {fees.map((row, index) => (
                    <StyledTableRow key={row.keyHash}>
                        <TableCell component="th" scope="row">
                            {index}
                        </TableCell>
                        <TableCell>{row.keyHash}</TableCell>
                        <TableCell>{row.providerAddress}</TableCell>
                        <TableCell>{row.publicKey}</TableCell>
                        <TableCell>{row.fee}</TableCell>
                        <TableCell><IconButton onClick={() => goToDetail(row)}><VisibilityIcon/></IconButton></TableCell>
                    </StyledTableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const OracleDetail = function({}) {
    const [requests, setRequests] = useState([])
    const [fees, setFees] = useState([])
    return (
        <div>
            <div>
                <div>Requests</div>
                <div>15</div>
            </div>
            <div>
                <div>Fulfilled</div>
                <div>20</div>
            </div>
            <RequestTable/>
            <FeeTable/>
        </div>
    )
}

export default OracleDetail;