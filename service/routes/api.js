const { Router } = require("express")
const {
    getOracles,
    getOracleRequests,
    getOracleFeeHistory,
    getOracleSummary
} = require("../controller")

const apiRoute = Router()

apiRoute.get(
    '/oracle',
    getOracles
)

apiRoute.get(
    '/oracle/requests/:id',
    getOracleRequests
)

apiRoute.get(
    '/oracle/fees/:id',
    getOracleFeeHistory
)

apiRoute.get(
    '/oracle/summary/:id',
    getOracleSummary
)

module.exports = apiRoute