const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      main: './src/js/main.js',
      reservation: './src/js/reservation.js',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'assets/js/[name].[contenthash].js',
      publicPath: '/'
    },
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/js/components')
      }
    },
    devtool: isProduction ? false : 'source-map',
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      hot: true,
      port: 8080,
      historyApiFallback: true
    },
    module: {
      rules: [
        // JavaScript
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        // CSS
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        // Imágenes
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name].[hash][ext]'
          }
        },
        // Fuentes
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name].[hash][ext]'
          }
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: isProduction ? 'assets/css/[name].[contenthash].css' : 'assets/css/[name].css'
      }),
      // Página principal
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        chunks: ['main'],
        minify: isProduction ? {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true
        } : false
      }),
      // Página de reserva
      new HtmlWebpackPlugin({
        template: './public/reserva/index.html',
        filename: 'reserva/index.html',
        chunks: ['reservation'],
        minify: isProduction ? {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true
        } : false
      }),
      // Copiar assets estáticos
      new CopyPlugin({
        patterns: [
          { 
            from: "public/assets/images", 
            to: "assets/images" 
          },
          { 
            from: "public/legal", 
            to: "legal" 
          },
          { 
            from: "public/viviendas", 
            to: "viviendas" 
          }
        ],
      }),
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: -10
          }
        }
      }
    }
  };
};
