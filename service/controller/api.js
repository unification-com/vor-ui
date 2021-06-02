const { NewServiceAgreement, ChangeFee, ChangeGranularFee, RandomnessRequest, RandomnessRequestFulfilled } = require("../db/models")

const getOracles = async (req, res) => {
    try {
        const services = await NewServiceAgreement.findAll()
        res.send({
            oracles: services
        })
    } catch(e) {
        res.status(400).send({
            "error": "getting oracle failed"
        })
    }
}

const getOracleRequests = async (req, res) => {
    try {
        const {keyHash} = req.params;
        let {page, rows} = req.query;
        if (page === undefined || page === null)
            page = 0
        if (rows === undefined || rows === null)
            rows = 5
        const limit = Math.min(100, rows)
        const offset = page * rows;
        const requests = await RandomnessRequest.findAndCountAll({
            where: {
                keyHash
            },
            limit: limit,
            offset: offset,
            include: {
                model: RandomnessRequestFulfilled
            }
        })
        res.send({
            requests: requests,
        })
    } catch(e) {
        console.log(e)
        res.status(400).send({
            "error": "getting requests failed"
        })
    }

}

const getRequestDetail = async (req, res) => {
    try {
        const {id} = req.params;
        const request = await RandomnessRequest.findOne({
            where: {
                requestID: id
            },
            include: {
                model: RandomnessRequestFulfilled
            }
        })
        res.send(request)
    } catch(e) {
        res.status(400).send({
            "error": "getting requests failed"
        })
    }

}

const getOracleFeeHistory = async (req, res) => {
    try {
        const {keyHash} = req.params;
        const fees = await ChangeFee.findAll({
            where: {
                keyHash
            }
        })
        const granularFees = await ChangeGranularFee.findAll({
            where: {
                keyHash
            }
        })
        res.send({
            fees,
            granularFees
        })
    } catch(e) {
        res.status(400).send({
            "error": "getting fees failed"
        })
    }
}

const getOracleSummary = async (req, res) => {
    try {
        const {keyHash} = req.params;
        const requestCount = await RandomnessRequest.count({
            where: {
                keyHash
            }
        })
        const fulfilledCount = await RandomnessRequestFulfilled.count({
            include: {
                model: RandomnessRequest,
                where: {
                    keyHash
                }
            }
        })
        res.send({
            requestCount,
            fulfilledCount
        })
    } catch(e) {
        console.log(e)
        res.status(400).send({
            "error": "getting oracle summary failed"
        })
    }
}

module.exports = {
    getOracles,
    getOracleRequests,
    getRequestDetail,
    getOracleFeeHistory,
    getOracleSummary
}