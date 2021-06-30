const {
  getOracles,
  getOracleRequests,
  getRequestDetail,
  getOracleFeeHistory,
  getOracleSummary,
} = require("./api")

const {
  uploadToPinata,
  getRequesters,
  getRequesterDetail,
  getRequestsByAddress,
  getDistributionRequestDetail,
  getPinStatus,
} = require("./portal")

module.exports = {
  getOracles,
  getOracleRequests,
  getRequestDetail,
  getOracleFeeHistory,
  getOracleSummary,
  /** portal apis */
  uploadToPinata,
  getRequesters,
  getRequesterDetail,
  getRequestsByAddress,
  getDistributionRequestDetail,
  getPinStatus,
}
