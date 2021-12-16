const path = require('path');
module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  entry: [
    path.join(__dirname, 'functions/index.js')
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'handler',
    libraryTarget: 'commonjs',
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, '../../node_modules')],
  },
  target: 'node',
}
