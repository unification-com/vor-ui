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
    '/oracle/requests/:keyHash',
    getOracleRequests
)

apiRoute.get(
    '/oracle/fees/:keyHash',
    getOracleFeeHistory
)

apiRoute.get(
    '/oracle/summary/:keyHash',
    getOracleSummary
)

module.exports = apiRoute