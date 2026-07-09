import devConfig from './dev'
import prodConfig from './prod'

const config = {
  projectName: 'xixi-mp',
  date: '2026-07-09',
  designWidth: 750,
  deviceRatio: { 640: 2.34 / 2, 750: 1, 828: 1.81 / 2 },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-react'],
  defineConstants: {},
  copy: { patterns: [], options: {} },
  framework: 'react',
  compiler: 'webpack5',
  cache: { enable: false },
  babel: {
    presets: [
      ['taro', {
        ts: true,
        reactJsxRuntime: 'automatic'
      }]
    ]
  },
  mini: {
    postcss: {
      pxtransform: { enable: true, config: {} },
      cssModules: { enable: false }
    }
  },
  h5: {}
}

export default process.env.NODE_ENV === 'development' ? { ...config, ...devConfig } : { ...config, ...prodConfig }