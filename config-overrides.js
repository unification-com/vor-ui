const path = require("path")

module.exports = {
  paths(paths, env) {
    paths.appPath = path.resolve(__dirname, "front")
    paths.appIndexJs = path.resolve(__dirname, "front/src/index.js")
    paths.appSrc = path.resolve(__dirname, "front/src")
    paths.appPublic = path.resolve(__dirname, "front/public")
    paths.appHtml = path.resolve(__dirname, "front/public/index.html")
    paths.appBuild = path.resolve(__dirname, "dist/front")
    paths.publicUrlOrPath = "/"
    return paths
  },
}
