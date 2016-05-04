var path = require("path");
var webpack = require("webpack");
var nodeExternals = require('webpack-node-externals');

module.exports = {
    resolve: {
        modulesDirectories: ["web_modules", "node_modules", "bower_components"]
    },
    plugins: [
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
        ),
//        new webpack.optimize.UglifyJsPlugin({
//            compress: {
//                warnings: false
//        }})
    ],    
    entry: {
        app: path.join(__dirname,'index.js')
    },
    output: {
        path: __dirname+'/public/js',
        filename: 'app.js'
    },
    module: {
        loaders: [{
            test: /\.jsx$/,
            exclude: /node_modules/,
            loaders: ['babel?presets[]=react'],
        },
        { test: /\.ejs$/, loader: 'ignore-loader' }
        ]
    },
    target: 'node',
    externals: [nodeExternals()]
}
