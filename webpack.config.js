const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'main.js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, 'dist/'),
        publicPath: path.resolve(__dirname, '/conways/'),
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                "targets": "defaults"
                            }]
                        ]
                    }
                },
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    devServer: {
        open: true,
        historyApiFallback: true,
        static: [
            {
                directory: path.join(__dirname, 'assets'),
                publicPath: '/conways/assets',
            },
            {
                directory: path.join(__dirname, 'dist'),
                publicPath: '/',
            },
        ],
        devMiddleware: {
            writeToDisk: true,
        },
        liveReload: true,
        compress: true,
        hot: true,
        port: 8080
    },
    resolve: {
        modules: ["node_modules"]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, 'dist/index.html'),
            template: path.resolve(__dirname, 'index.html'),
            inject: "body"
        }),
    ],
};