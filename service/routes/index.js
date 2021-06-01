const { Router } = require("express")
const apiRoute = require("./api.js");

const appRoute = Router()

appRoute.use('/api', apiRoute)

module.exports = {
     appRoute
}