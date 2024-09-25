import { defineConfig as defineViteConfig, mergeConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export function defineConfig(config: UserConfig) {
  const baseConfig: UserConfig = {
    plugins: [vue(), vueJsx(), dts({ rollupTypes: true }), nodePolyfills()],
    build: {
      lib: {
        entry: 'src/index.ts',
        formats: ['es', 'cjs'],
        // 输出文件名
        fileName: 'index'
      },
      minify: false,
      cssMinify: false,
      rollupOptions: {
        // 确保外部化那些你不想打包进库的依赖
        external: ['vue']
      }
    }
  }
  return defineViteConfig(mergeConfig(baseConfig, config))
}
