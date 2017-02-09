/* eslint-env node */
var path = require('path'),
    webpack = require('webpack'),
    WebpackDevServer = require('webpack-dev-server'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ExpressHttpProxy = require('express-http-proxy'),
    ProgressBar = require('progress'),
    jsonStableStringify = require('json-stable-stringify'),
    autoprefixer = require('autoprefixer'),
    yargs = require('yargs'),
    fse = require('fs-extra'),
    CLIENT_DIR = path.resolve(__dirname, '..', 'client');

var argv = yargs
    .alias('p', 'production')
    .argv;

var isDEV = !argv.production,
    saveStatsJson = !!argv['save-json'];

var isSourceMapEval = argv['sourceMapEval'];

var progressBar = null,
    progressModules = '';


var PORT = 3000;

function _path(relativePath) {
    return path.resolve(CLIENT_DIR, relativePath);
}


function getWebpackConfig(isDev) {
    isDev = !!isDev;
    var makeHotEntry = function (entries) {
            return (isDev ? [
                'webpack-dev-server/client?http://localhost:' + PORT + '/',
                'webpack/hot/only-dev-server' // "only" prevents reload on syntax errors
            ] : []).concat(entries);
        },
        makeStyleLoader = function (preCssLoader) {
            preCssLoader = preCssLoader ? ('!' + preCssLoader) : '';
            return isDev ? 'style!css!postcss' + preCssLoader : ExtractTextPlugin.extract('style', 'css!postcss' + preCssLoader);
        },
        outputFileName = isDev ? '[path][name].[ext]' : '[name].[hash:6].[ext]'
    var standaloneLibTest = /((\Wvendor\W+standalone\W.*)|(quill))\.js$/;
    var moduleLibTest = /(moment|immutable|underscore)\.js$/;
    return {
        entry: {
            app: makeHotEntry([
                _path('./app/views/ApplicationRouter.jsx')
            ]),
            vendor: [
                _path('./app/vendor-entry.js')
            ]
        },
        devtool: isDev ? (isSourceMapEval?'eval-cheap-module-source-map':'cheap-module-source-map') : '',
        watch: isDev,
        output: {
            filename: isDev ? '[name].js' : '[name].[hash:6].js',
            path: _path('./build/static'),
            publicPath: '/static/'
        },
        module: {
            noParse: new RegExp('(' + standaloneLibTest.source + ')|(' + moduleLibTest.source + ')'),
            loaders: [
                {
                    // 禁用独立三方库的模块定义, 使之定义到全局变量
                    test: standaloneLibTest,
                    loader: 'imports?define=>false&module=>false&exports=>false'
                },
                {
                    test: /app.*\.(js|jsx)$/i,
                    loaders: isDev ? ['react-hot', `${require.resolve('./expose-by-path-loader')}`, 'babel'] : ['babel']
                },
                {
                    test: /\.json$/i,
                    loader: 'json'
                },
                {
                    test: /\.css$/i,
                    loader: makeStyleLoader()
                },
                {
                    test: /\.less$/i,
                    loader: makeStyleLoader('less')
                },
                {
                    test: /\.(png|jpg|jpeg)$/i,
                    loader: 'url?limit=5000&name=' + outputFileName // 5K以下内联
                },
                {
                    test: /\.(mp3|eot|svg|ttf|woff|woff2)(\?.*)?/i,
                    loader: 'file?name=' + outputFileName
                }
            ]
        },
        resolve: {
            extensions: ['', '.js', '.jsx']
        },
        postcss: [
            autoprefixer({ browsers: ["Chrome > 20", "ie >= 10", "firefox >= 4", "last 2 versions"] })
        ],
        plugins: (isDev ? [
            new webpack.HotModuleReplacementPlugin()
        ] : [
            new ExtractTextPlugin('[name].[hash:6].css'),
            new webpack.optimize.UglifyJsPlugin({
                compress: {warnings: false} // 隐藏 UglifyJs 警告
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.optimize.DedupePlugin()
        ]).concat([
            new webpack.ProgressPlugin(function (percentage, msg) {
                if (!progressBar) {
                    progressBar = new ProgressBar('Building [:bar] :token_modules', {
                        width: 40,
                        total: 100,
                        complete: '=',
                        incomplete: ' '
                    });
                }
                progressBar.update(percentage, {
                    token_modules: msg.indexOf('modules') !== -1 ? (progressModules = msg) : progressModules
                });
            }),
            new webpack.DefinePlugin({
                __DEV__: isDev,
                'process.env.NODE_ENV': isDev ? '"development"' : '"production"'
            }),
            new HtmlWebpackPlugin({
                favicon: _path('./static/favicon.png'),
                template: _path('./index.html')
            }),
            new webpack.optimize.CommonsChunkPlugin('vendor', isDev ? '[name].js' : '[name].[hash:6].js')
        ])
    };
}

if (isDEV) {
    var webpackConfig = getWebpackConfig(true);
    var compiler = webpack(webpackConfig);

    var devServer = new WebpackDevServer(compiler, {
        hot: true,
        publicPath: webpackConfig.output.publicPath,
        contentBase: _path('__NO_CONTENT_BASE__'),
        stats: {
            hash: false,
            version: false,
            assets: false,
            colors: true,
            chunks: true,
            chunkModules: false
        }
    });

    devServer.use(/\/(api|signup)/, ExpressHttpProxy('https://beta.mission.im', {
        forwardPath: function (req) {
            return req.originalUrl;
        }
    }));

    devServer.use(ExpressHttpProxy('localhost:3000', {
        forwardPath: function () {
            return '/static/index.html';
        }
    }));

    devServer.listen(PORT);
} else {
    fse.emptyDirSync(_path('build/'));
    webpack(getWebpackConfig(false), function (error, stats) {
        var jsonStats = stats.toJson();
        error = error || jsonStats.errors[0];
        if (saveStatsJson) {
            fse.writeFileSync(_path('webpack-stats.json'), jsonStableStringify(jsonStats, {space: 2}));
        }
        if (error) {
            console.error(error);
            process.exit(1);
        } else {
            fse.move(_path('build/static/index.html'), _path('build/index.html'), function (err) {
                if (err) {
                    console.log(err);
                    process.exit(1);
                } else {
                    console.log(stats.toString({
                        timings: true,
                        hash: false,
                        version: false,
                        assets: true,
                        colors: true,
                        chunks: true,
                        chunkModules: false,
                        children: false
                    }));
                }
            });
        }
    });
}
