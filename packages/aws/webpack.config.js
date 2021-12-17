const path = require('path');
module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  entry: {
    'email-service': path.resolve(__dirname, 'lib/email-service.js'),
    'heroku-ping': path.resolve(__dirname, 'lib/heroku-ping.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'handler',
    libraryTarget: 'commonjs',
  },
  target: 'node',
}
