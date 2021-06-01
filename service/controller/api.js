const { NewServiceAgreement, ChangeFee, ChangeGranularFee, RandomnessRequest, RandomnessRequestFulfilled } = require("../db/models")

const getOracles = async (req, res) => {
    try {
        const services = await NewServiceAgreement.findAll()
        res.send({
            oracles: services
        })
    } catch(e) {
        console.log(e)
        res.status(400).send({
            "error": "getting oracle failed"
        })
    }
}

const getOracleRequests = () => {

}

const getOracleFeeHistory = () => {

}

const getOracleSummary = () => {

}

module.exports = {
    getOracles,
    getOracleRequests,
    getOracleFeeHistory,
    getOracleSummary
}