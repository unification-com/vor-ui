import { SERVICE_API_URL } from "../utils/Constants"

require("dotenv").config()

export const getOracles = async () => {
  console.log(new Date(), "get oracles")
  return new Promise((resolve, reject) => {
    const url = `${SERVICE_API_URL}/api/oracle`
    console.log(new Date(), "url", url)
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        console.log(err.toString())
        reject(err)
      })
  })
}

export const getOracleSummary = async (keyHash) => {
  console.log(new Date(), "get oracle summary")
  return new Promise((resolve, reject) => {
    const url = `${SERVICE_API_URL}/api/oracle/summary/${keyHash}`
    console.log(new Date(), "url", url)
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        console.log(err.toString())
        reject(err)
      })
  })
}

export const getOracleDetail = async (keyHash, page, rows) => {
  console.log(new Date(), "get oracle detail")
  return new Promise((resolve, reject) => {
    const url = `${SERVICE_API_URL}/api/oracle/requests/${keyHash}?page=${page}&rows=${rows}`
    console.log(new Date(), "url", url)
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        console.log(err.toString())
        reject(err)
      })
  })
}

export const getRequestDetail = async (id) => {
  console.log(new Date(), "get oracle detail")
  return new Promise((resolve, reject) => {
    const url = `${SERVICE_API_URL}/api/oracle/request/${id}`
    console.log(new Date(), "url", url)
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        console.log(err.toString())
        reject(err)
      })
  })
}

export const getOracleFeeHistory = async (keyHash, page, rows) => {
  console.log(new Date(), "get oracle fee history")
  return new Promise((resolve, reject) => {
    const url = `${SERVICE_API_URL}/api/oracle/fees/${keyHash}?page=${page}&rows=${rows}`
    console.log(new Date(), "url", url)
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        console.log(err.toString())
        reject(err)
      })
  })
}
