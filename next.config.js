// /* eslint-disable @typescript-eslint/no-var-requires */
// const path = require('path')
// const fs = require('fs')
// const gracefulFs = require('graceful-fs')

// // Use graceful-fs to handle file operations more efficiently and prevent EMFILE errors
// gracefulFs.gracefulify(fs)

// /** @type {import('next').NextConfig} */

// // Remove this if you're not using Fullcalendar features
// const withTM = require('next-transpile-modules')([
//   '@fullcalendar/common',
//   '@fullcalendar/react',
//   '@fullcalendar/daygrid',
//   '@fullcalendar/list',
//   '@fullcalendar/timegrid'
// ])

// module.exports = withTM({
//   trailingSlash: true,
//   reactStrictMode: false,
//   experimental: {
//     esmExternals: false
//   },
//   eslint: {
//     // Warning: This allows production builds to successfully complete even if
//     // your project has ESLint errors.
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   webpack: (config, { isServer, dev }) => {
//     config.resolve.alias = {
//       ...config.resolve.alias,
//       apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
//     }

//     // Fix for "too many open files" error on Windows
//     // Limit concurrent file operations to prevent hitting Windows file handle limit (~512)
//     // Using 1 for maximum safety, but graceful-fs helps manage file handles better
//     // If build is too slow, try increasing to 2, but monitor for EMFILE errors
//     config.parallelism = 1
    
//     // Limit max parallel file reads per module
//     if (config.optimization) {
//       config.optimization = {
//         ...config.optimization,
//         // Disable module concatenation to reduce concurrent file operations
//         concatenateModules: false,
//         // Reduce parallel processing
//         minimize: config.optimization.minimize,
//         minimizer: config.optimization.minimizer
//       }
//     }
    
//     // Configure module rules to process files more sequentially
//     if (config.module && config.module.rules) {
//       config.module.rules.forEach(rule => {
//         if (rule.use && Array.isArray(rule.use)) {
//           rule.use.forEach(use => {
//             if (use.loader && use.loader.includes('file-loader')) {
//               use.options = {
//                 ...use.options,
//                 limit: false
//               }
//             }
//           })
//         }
//       })
//     }
    
//     // Optimize file watching in development
//     if (dev && !isServer) {
//       config.watchOptions = {
//         ...config.watchOptions,
//         ignored: ['**/node_modules/**'],
//         aggregateTimeout: 1000,
//         poll: false
//       }
//     }

//     // Optimize for production builds - reduce file operations
//     if (!dev) {
//       // Skip source maps in production to reduce file operations
//       config.devtool = false
      
//       // Optimize chunk splitting to reduce concurrent file operations
//       if (config.optimization && config.optimization.splitChunks) {
//         config.optimization.splitChunks = {
//           ...config.optimization.splitChunks,
//           cacheGroups: {
//             ...config.optimization.splitChunks.cacheGroups,
//             default: {
//               minChunks: 2,
//               priority: -20,
//               reuseExistingChunk: true
//             }
//           }
//         }
//       }
//     }

//     // Optimize module resolution
//     config.resolve.modules = [
//       ...(config.resolve.modules || []),
//       path.resolve(__dirname, 'node_modules')
//     ]

//     // Enable filesystem cache for better performance and reduced file operations
//     config.cache = {
//       type: 'filesystem',
//       buildDependencies: {
//         config: [__filename]
//       },
//       cacheDirectory: path.resolve(__dirname, '.next/cache/webpack')
//     }

//     // Reduce infrastructure logging overhead
//     config.infrastructureLogging = {
//       level: 'error'
//     }

//     // Add performance hints to reduce aggressive optimization
//     config.performance = {
//       hints: false,
//       maxEntrypointSize: 512000,
//       maxAssetSize: 512000
//     }

//     return config
//   }
// })

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const fs = require('fs')
const gracefulFs = require('graceful-fs')

// Use graceful-fs to prevent EMFILE errors
gracefulFs.gracefulify(fs)

/** @type {import('next').NextConfig} */

// Remove this if you're not using Fullcalendar features
const withTM = require('next-transpile-modules')([
  '@fullcalendar/common',
  '@fullcalendar/react',
  '@fullcalendar/daygrid',
  '@fullcalendar/list',
  '@fullcalendar/timegrid'
])

module.exports = withTM({
  output: 'standalone',
  trailingSlash: true,
  reactStrictMode: false,
  productionBrowserSourceMaps: false,

  experimental: {
    esmExternals: false
  },

  eslint: {
    ignoreDuringBuilds: true
  },

  typescript: {
    ignoreBuildErrors: true
  },

  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(
        __dirname,
        './node_modules/apexcharts-clevision'
      )
    }

    // Fix Windows EMFILE errors
    config.parallelism = 1

    if (config.optimization) {
      config.optimization = {
        ...config.optimization,
        concatenateModules: false,
        minimize: config.optimization.minimize,
        minimizer: config.optimization.minimizer
      }
    }

    if (config.module && config.module.rules) {
      config.module.rules.forEach(rule => {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach(use => {
            if (
              use.loader &&
              use.loader.includes('file-loader')
            ) {
              use.options = {
                ...use.options,
                limit: false
              }
            }
          })
        }
      })
    }

    // Optimize file watching
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules/**'],
        aggregateTimeout: 1000,
        poll: false
      }
    }

    // Optimize chunk splitting
    if (!dev && config.optimization?.splitChunks) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    }

    // Optimize module resolution
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, 'node_modules')
    ]

    // Filesystem cache
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      },
      cacheDirectory: path.resolve(
        __dirname,
        '.next/cache/webpack'
      )
    }

    // Reduce logs
    config.infrastructureLogging = {
      level: 'error'
    }

    // Performance hints
    config.performance = {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }

    return config
  }
})
