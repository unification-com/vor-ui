const { Router } = require("express")
const {
  uploadToPinata,
  getRequesters,
  getRequesterDetail,
  getRequestsByAddress,
  getDistributionRequestDetail,
  getPinStatus,
} = require("../controller")

const apiRoute = Router()

apiRoute.post("/upload", uploadToPinata)
apiRoute.get("/requesters", getRequesters)
apiRoute.get("/requester/:address", getRequesterDetail)
apiRoute.get("/requests/:address", getRequestsByAddress)
apiRoute.get("/request/:id", getDistributionRequestDetail)
apiRoute.get("/pin_status/:ipfs_hash", getPinStatus)

module.exports = apiRoute
