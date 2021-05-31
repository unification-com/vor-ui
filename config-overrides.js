const path = require('path');

module.exports = {
    paths: function (paths, env) {        
    	console.log(paths, env)
        paths.appIndexJs = path.resolve(__dirname, 'front/src/index.js');
        paths.appSrc = path.resolve(__dirname, 'front/src');
        paths.appPublic = path.resolve(__dirname, 'front/public');
        paths.appHtml = path.resolve(__dirname, 'front/public/index.html');
        return paths;
    },
}
