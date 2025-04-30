const path = require('path')

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add a rule to treat .html files as raw text
      webpackConfig.module.rules.push({
        test: /\.html$/,
        include: path.resolve(__dirname, 'src'),
        use: 'raw-loader'
      })
      return webpackConfig
    }
  }
}
