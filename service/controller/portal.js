require("dotenv").config()
const { Sequelize, QueryTypes, Op } = require("sequelize")
const {
  NewMoniker,
  StartingDistribute,
  DistributeResult
} = require("../db/models")
const pinataSDK = require('@pinata/sdk');
const { PIN_APIKEY, PIN_SECRETAPIKEY } = process.env
const pinata = pinataSDK(PIN_APIKEY, PIN_SECRETAPIKEY);

const uploadToPinata = async (req, res) => {
  const body = req.fields;
  console.log(body)
  const {
    moniker, address, data
  } = body
  const options = {
      pinataMetadata: {
          name: moniker, // moniker
          keyvalues: {
              name: moniker,
              address: address,
          }
      }
  };
  pinata.pinJSONToIPFS(data, options).then((result) => {
      res.send(result);
      /**
       { 
         IpfsHash: 'QmUHeDovuppZGU3yMccWpcCZ3GbcfiYGmCTMSUUn7XsqLY',
         PinSize: 41,
         Timestamp: '2021-06-18T19:30:19.831Z' }
       */
  }).catch((err) => {
      //handle error here
      console.log(err);
      res.status(400).send(error);
  });
}
const getRequesters = async (req, res) => {
  try {
    const requesters = await NewMoniker.findAll()
    res.send({
      requesters,
    })
  } catch (e) {
    res.status(400).send({
      error: "getting requesters failed",
    })
  }
}
const getRequesterDetail = async (req, res) => {
  try {
    const { address } = req.params
    const requester = await NewMoniker.findOne({
      where: {
        requester: address,
      },
    })
    const requestCount = await StartingDistribute.count({
      where: {
        sender: address,
      },
    })
    const fulfilledCount = await DistributeResult.count({
      where: {
        sender: address
      }
    })
    res.send({
      requestCount,
      fulfilledCount,
      requester
    })
  } catch(e) {
    console.log(e)
    res.status(400).send({
      error: "getting requester detail failed"
    })
  }
}
const getRequestsByAddress = async (req, res) => {
  try {
    const { address } = req.params
    let { page, rows, q } = req.query
    let where = {}
    let where1 = {}
    if (address === undefined || address === "0") where1 = {}
    else
      where = {
        sender: {
          [Sequelize.Op.iLike]: address
        }
      }
    if (page === undefined || page === null) page = 0
    if (rows === undefined || rows === null) rows = 5
    const limit = Math.min(100, rows)
    const offset = page * rows
    const requests = await StartingDistribute.findAndCountAll({
      where,
      limit,
      offset,
      include: {
        model: DistributeResult,
      },
    })
    res.send({
      requests,
    })
  } catch (e) {
    console.log(e)
    res.status(400).send({
      error: "getting requests failed",
    })
  }
}

const getDistributionRequestDetail = async (req, res) => {
  try {
    const { id } = req.params
    const request = await StartingDistribute.findOne({
      where: {
        requestID: id,
      },
      include: {
        model: DistributeResult,
      },
    })
    res.send(request)
  } catch (e) {
    res.status(400).send({
      error: "getting request detail failed",
    })
  }
}

module.exports = {
  uploadToPinata,
  getRequesters,
  getRequesterDetail,
  getRequestsByAddress,
  getDistributionRequestDetail
}
