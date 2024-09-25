<template>
  <ProvideApiKeyDialog v-model:apiKey="state.apiKey" />
  <div class="container">
    <CopilotKit :publicApiKey="state.apiKey || 'undefined'" :key="state.apiKey || 'undefined'">
      <RouterView />
    </CopilotKit>
  </div>
</template>

<script setup lang="ts">
import { CopilotKit } from '@copilotkit/vue-core'
import ProvideApiKeyDialog from './components/ProvideApiKeyDialog.tsx'
import { reactive } from 'vue';

const state = reactive({
  apiKey:''
})
</script>
