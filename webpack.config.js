
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// 费时分析
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()

// 打包进度条 
const ProgressBarWebpackPlugin = require('progress-bar-webpack-plugin')

// 引入插件 构建结果分析
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// 压缩css
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

// 压缩JS
const TerserPlugin = require('terser-webpack-plugin');

// 清除无用的CSS
const PurgecssWebpackPlugin = require('purgecss-webpack-plugin');
const glob = require('glob'); // 文件匹配模式

// 打印环境变量 
console.log('process.env.NODE_ENV=', process.env.NODE_ENV)


// 配置 resolve 配置别名
// 处理路径的方法

function resolve(dir) {
  return path.join(__dirname, dir)
}


const PATHS = {
  src: resolve('src')
}

// 使用 config 接收 webpack 的配置
const config = {
  mode: 'development',  // 模式
  entry: {
    index: './src/index.js',  // 打包入口
    // 测试将入口改为CSS
    // main: './src/main.css'
  },

  output: {
    filename: 'bundle.js', // 输出的文件名
    path: path.join(__dirname, 'dist'),   // 输出的目录 ， __dirname 表示绝对路径
    publicPath: './',
    clean: true  // 清除编译的目录 -  webpack5 的配置，不再使用 clean-webpack-plugin 插件
  },

  module: {
    rules: [ // 配置转换规则
      // 每一个规则都使用  {}  包裹起来
      {
        test: /\.(s[ac]|le|c)ss$/i, //匹配所有的 sass/scss/css 文件
        use: [
          // 'style-loader',  // 生成 style 标签插入文档

          // 使用 MiniCssExtract
          MiniCssExtractPlugin.loader,  // 添加 loader
          'css-loader',
          'postcss-loader',  // 自动将CSS3属性 加上浏览器前缀
          'sass-loader',  // 解析SASS 文件的 loader
        ]  // use 对应下载的loader 
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        type: 'asset',
        generator: {
          // 输出文件位置以及文件名
          // [ext] 自带 "." 这个与 url-loader 配置不同
          filename: "[hash:8][ext]"
        },
        parser: {
          dataUrlCondition: {
            maxSize: 50 * 1024 //超过50kb不转 base64
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        type: 'asset',
        generator: {
          // 输出文件位置以及文件名
          filename: "[name][contenthash:8][ext]"
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 超过100kb不转 base64
          }
        }
      },
      // babel 的配置
      {
        test: /\.js$/i,
        // include 符合条件的模块进行解析
        include: resolve('src'),
        // exclude 需要排除的模块
        exclude: '/node_modules/',
        use: [
          // {
          //   loader: 'thread-loader', // 开启多进程打包
          //   options: {
          //     worker: 3  // 3 个进程
          //   }
          // },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env'
              ],
            }
          }
        ]
      },
    ]
  },

  // 使用插件
  plugins: [ // // 配置插件
    new HtmlWebpackPlugin({
      //  使用了 自定义的 index.html , 而且还会自动引入 bundle.js 文件
      template: './src/index.html'
    }),
    
    // 使用 分离CSS的插件
    new MiniCssExtractPlugin({ // 添加插件
      filename: '[name].[chunkhash:8].css'
    }),

    // 打包的进度条
    new ProgressBarWebpackPlugin({
      // format 配置百分比和加粗绿色高亮的样式
      format: '  :msg [:bar] :percent (:elapsed s)',
      // building [=========           ] 46% (1.0 s)
    }),

    // 配置插件 
    new BundleAnalyzerPlugin({
      // analyzerMode: 'disabled',  // 不启动展示打包报告的http服务器
      // generateStatsFile: true, // 是否生成stats.json文件
    }),

    // 清除无用的CSS
    new PurgecssWebpackPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, {nodir: true})
    }),
  ],

  // 使用 webpack-dev-server 
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'), // 静态文件目录
    compress: true,  // 开启Gzip压缩
    port: 8080,
    // open: true  // 自动打开浏览器
  },

  // 配置source-map , source-map 有很多值可选，一般使用 eval-cheap-module-source-map 这个
  devtool: 'eval-cheap-module-source-map',

  // 配置resolve
  resolve: {
    // 配置别名
    alias: {
      '~': resolve('src'),
      '@': resolve('src'),
      'components': resolve('src/components')
    },
    
    // extensions 配置文件后缀，省略后缀
    extensions: ['.js', '.jsx', '.json'],

    // modules 告诉 webpack 解析模块时应该搜索的目录，常见配置如下
    modules: [resolve('src'), 'node_modules']
  },

  // webpack5 开启缓存
  cache: {
    type: 'filesystem',  //  type: 'filesystem' 文件缓存
  },

  // optimization  webpack 的优化配置
  optimization: {
    minimize: true,
    minimizer: [
      // 添加 css 压缩配置
      new OptimizeCssAssetsPlugin({}),
      // 添加 js 压缩配置
      new TerserPlugin({})
    ],
    // splitChunks 分包配置
    splitChunks: {
      chunks: 'async', // 有效值为 `all`，`async` 和 `initial`
      minSize: 20000, // 生成 chunk 的最小体积（≈ 20kb)
      minRemainingSize: 0, // 确保拆分后剩余的最小 chunk 体积超过限制来避免大小为零的模块
      minChunks: 1, // 拆分前必须共享模块的最小 chunks 数。
      maxAsyncRequests: 30, // 最大的按需(异步)加载次数
      maxInitialRequests: 30, // 打包后的入口文件加载时，还能同时加载js文件的数量（包括入口文件）
      enforceSizeThreshold: 50000,
      cacheGroups: { // 配置提取模块的方案
        defaultVendors: {
          test: /[\/]node_modules[\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
}


module.exports = (env, argv) => {
  console.log('argv.mode=', argv.mode)  // // 打印 mode(模式) 值
  // 这里可以通过不同的模式修改 config 配置
  // return config;

  return smp.wrap(config);  // 使用 计时分析，需要将 mini-css-extract-plugin 将到  1.3.6 版本
}


/**
 * 
 * 执行  npx webpack --mode=development   运行webpack 
 */


/**
 * 为了区别 webpack 的生产环境和 开发环境， 安装 cross-evn 
 * 
 * 配置 package.json 
 * 
 * 
 *   "dev": "cross-env NODE_ENV=dev webpack serve --mode development",
    "build": "cross-env NODE_ENV=build webpack serve --mode production",
    "test": "cross-env NODE_ENV=test webpack serve --mode production"
 */

  /**
   *  postcss-loader postcss  自动添加 CSS3 部分属性的浏览器前缀
   * 
   *  需要配置  postcss.config.js  和  .browserslistrc 文件
   *  用到去查 https://juejin.cn/post/7023242274876162084#heading-11
   */

  /**
   * 需要在 webpack 中使用 SASS文件  需要安装  sass-loader  和  node-sass 这两个
   *  sass-loader  将 scss 文件 转为 css 文件
   *  node-sass 。。。
   *  然后在 解析 css 文件中 添加对 sass/scss  文件的解析 
   */

  /**
   *  mini-css-extract-plugin@2.6.0  分离 CSS ， 让CSS 为单独一个文件，引入HTML
   * 
   * 在rules 中使用 MiniCssExtractPlugin.loader
   * 和 在 plugins 中使用 MiniCssExtractPlugin
   */

  /**
   * webpack5 新增资源模块(asset module)，允许使用资源文件（字体，图标等）而无需配置额外的 loader。
   * asset/resource 将资源分割为单独的文件，并导出 url，类似之前的 file-loader 的功能.
   * asset/inline 将资源导出为 dataUrl 的形式，类似之前的 url-loader 的小于 limit 参数时功能.
   * asset/source 将资源导出为源码（source code）. 类似的 raw-loader 功能.
   * asset 会根据文件大小来选择使用哪种类型，当文件小于 8 KB（默认） 的时候会使用 asset/inline，否则会使用 asset/resource
   */

  /**
   * 配置  babel 比较麻烦，用到直接复制粘贴 
   * https://juejin.cn/post/7023242274876162084#heading-14
   */

  /**
   *  SourceMap 配置选择
   * SourceMap 是一种映射关系，当项目运行后，如果出现错误，我们可以利用 SourceMap 反向定位到源码位置
   *  直接在 webpack.config.js 中配置 devtool: source-map
   * 
   * 需要了解 它的更多属性值，https://juejin.cn/post/7023242274876162084#heading-18
   */

  /**
   * 优化 resolve 配置
   * 
   * alias 引用别名 ， 用来简化模块引用，项目中基本都需要进行配置。
   * extensions 配置文件后缀，省略后缀
   * modules  告诉 webpack 解析模块时应该搜索的目录, 告诉 webpack 优先 src 目录下查找需要解析的文件，会大大节省查找时间
   */

  /**
   * 缩小范围
   * 在配置 loader 的时候，我们需要更精确的去指定 loader 的作用目录或者需要排除的目录，
   * 通过使用 include 和 exclude 两个配置项，可以实现这个功能，常见的例如：
   * include：符合条件的模块进行解析
   * exclude：排除符合条件的模块，不解析
   * exclude 优先级更高
   */

  /**
   * thread-loader 是多线程打包
   * 一般使用在 一些 编译转换比较久的 loader 里， 比如大型项目中的 babel-loader 
   */

  /**
   * cache 开始缓存，一般在 webpack5 都不使用cache-loader， dll 了，而是内置了
   * 缓存的功能
   *   cache: {
        type: 'filesystem',
      },
   */

  /**
   * 构建结果分析 webpack-bundle-analyzer
   * 我们可以直观的看到打包结果中，文件的体积大小、各模块依赖关系、文件是够重复等问题，极大的方便我们在进行项目优化的时候，进行问题诊断。
   * 
   */

  /**
   * 压缩 CSS
   * optimize-css-assets-webpack-plugin 
   * 将 CSS 压缩为一行， 需要配合 CSS 分割的插件使用
   */

  /**
   * 压缩JS
   * const TerserPlugin = require('terser-webpack-plugin');
   *   optimization: {
        minimize: true, // 开启最小化
        minimizer: [
          // ...
          new TerserPlugin({})
        ]
      },

      将 JS压缩为一行
   */

  /**
   * 清除无用的CSS
   * purgecss-webpack-plugin 会单独提取 CSS 并清除用不到的 CSS
   * 
   */

  /**
   *  Tree-shaking Tree-shaking 作用是剔除没有使用的代码，以降低包的体积
   * webpack 默认支持，需要在 .bablerc 里面设置 model：false，即可在生产环境下默认开启
   */