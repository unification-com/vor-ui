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
        const requests = await RandomnessRequest.findAll({
            where: {
                keyHash
            },
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

const getOracleFeeHistory = async (req, res) => {
    try {
        const {keyHash} = req.params;
        const fees = await RandomnessRequest.findAll({
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

const getOracleSummary = async () => {
    try {
        const {keyHash} = req.params;
        const requestCount = await RandomnessRequest.count({
            where: {
                keyHash
            }
        })
        const fulfilledCount = await RandomnessRequestFulfilled.count({
            where: {
                keyHash
            }
        })
        res.send({
            requestCount,
            fulfilledCount
        })
    } catch(e) {
        res.status(400).send({
            "error": "getting fees failed"
        })
    }
}

module.exports = {
    getOracles,
    getOracleRequests,
    getOracleFeeHistory,
    getOracleSummary
}