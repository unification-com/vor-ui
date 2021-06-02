require("dotenv").config()
import { SERVICE_API_URL } from "../utils/Constants"

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

const getOracleDetail = async (keyHash) => {
  console.log(new Date(), "get oracle detail")
  return new Promise((resolve, reject) => {
    const url = `${SERVICE_API_URL}/api/oracle/${keyHash}`
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

export default {
  getOracles,
  getOracleDetail,
}
