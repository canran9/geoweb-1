const path = require('path');

module.exports = {
  entry: './public/javascripts/map.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}