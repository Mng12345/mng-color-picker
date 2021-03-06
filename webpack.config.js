const HtmlWebpackPlugin = require('html-webpack-plugin')
const {join} = require('path')

module.exports = {
  entry: './example/index.ts',
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    port: 80
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.t|jsx?$/,
        loader: 'source-map-loader',
        enforce: "pre",
        include: [join(process.cwd(), 'src'), join(process.cwd(), 'example')]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: join(process.cwd(), 'index.html'),
      inject: true
    })
  ]
}

