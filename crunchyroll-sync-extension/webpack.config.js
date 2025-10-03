const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background.js',
    offscreen: './src/offscreen.js',
    popup: './src/popup.js',
    content: './src/content.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.js'],
    fallback: {
      // Firebase requires these polyfills for service workers
      "crypto": false,
      "stream": false,
      "util": false,
      "url": false,
      "querystring": false,
      "path": false,
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        firebase: {
          test: /[\\/]node_modules[\\/]firebase[\\/]/,
          name: 'firebase',
          chunks: 'all',
          priority: 10
        }
      }
    }
  },
  // Ensure compatibility with Chrome extension service workers
  target: 'webworker',
  devtool: false
};

