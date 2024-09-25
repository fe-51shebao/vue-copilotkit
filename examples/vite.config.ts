import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Pages from 'vite-plugin-pages'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import { resolve } from 'path'
import fs from 'fs-extra'
import { glob } from 'glob'
import UnoCSS from 'unocss/vite'

function getWorkspaceAlias() {
  const basePath = resolve(__dirname, '../')
  const pkg = fs.readJSONSync(resolve(basePath, 'package.json')) || {}
  const alias: Record<string, string> = {}
  const workspaces = pkg.workspaces
  if (Array.isArray(workspaces)) {
    workspaces.forEach(pattern => {
      const found = glob.sync(pattern, { cwd: basePath })
      found.forEach(name => {
        try {
          const pkg = fs.readJSONSync(resolve(basePath, name, './package.json'))
          alias[pkg.name] = resolve(basePath, name, './src')
        } catch (error) {
          /* empty */
        }
      })
    })
  }
  return alias
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Pages({
      extensions: ['vue', 'tsx']
    }),
    nodePolyfills(),
    UnoCSS()
  ],
  resolve: {
    alias: {
      ...getWorkspaceAlias()
    }
  },
  build: {
    minify: false
  }
})
