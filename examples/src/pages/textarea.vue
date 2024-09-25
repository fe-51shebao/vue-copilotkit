<template>
  <div class="textarea-box">
    <header class="border-b px-6 py-4">
      <h2 class="text-2xl font-semibold">Email Thread: Project Kickoff Meeting</h2>
    </header>
    <div class="flex w-full flex-col border-r bg-muted p-4">
      <div class="space-y-4">
        <template v-for="item in emails" :key="item.id">
          <div class="rounded-md border bg-background p-4 space-y-1 text-left">
            <p class="text-sm text-muted-foreground">{{ item.timestamp }}</p>
            <div class="space-y-1">
              <p class="text-sm font-medium">
                <span class="text-muted-foreground">From:</span>
                {{ item.from }}
              </p>
              <p class="text-sm font-medium">
                <span class="text-muted-foreground">To:</span>
                {{ item.to }}
              </p>
              <p class="text-sm text-muted-foreground">{{ item.body }}</p>
            </div>
          </div>
        </template>
      </div>
      <hr className="hr" />
      <div class="textarea-content">
        <CopilotTextarea
          :value="text"
          placeholder="Write your reply..."
          :autosuggestionsConfig="{
            textareaPurpose: `Asisst me in replying to this email thread. Remmeber all important details.`,
            chatApiConfigs: {},
            contextCategories: [salesReplyCategoryId]
          }"
          :onChange="e => setInput(e)"
        />
        <button class="btn" @click="handleReply">Reply</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CopilotTextarea } from '@copilotkit/vue-textarea'
import { ref } from 'vue'
import emailHistory from '../lib/email-history.json'
import { useStateWithLocalStorage } from '../hooks/utils'
import { DocumentPointer, useCopilotReadable, useMakeCopilotDocumentReadable } from '@copilotkit/vue-core'
const emails = ref(emailHistory)

useCopilotReadable({
  description: 'The history of this email thread',
  value: emails
})

const text = ref('')
const setInput = (val: any) => {
  text.value = val.target?.value ?? ''
}

const handleReply = () => {
  const email = {
    from: 'me',
    to: 'John Doe <john@acme.com>',
    body: text.value,
    timestamp: new Date().toISOString()
  }
  emails.value.push(email)
  setInput('')
}

const clientTranscriptSummaryDocument: DocumentPointer = {
  id: 'clientTranscriptSummary',
  name: 'Client Call Gong Transcript',
  sourceApplication: 'Gong',
  iconImageUri: 'https://asset.brandfetch.io/idHyhmcKvT/idRu6db2HA.jpeg?updated=1690987844207',
  getContents: () => {
    return 'This is the client transcript summary'
  }
}

const [detailsText] = useStateWithLocalStorage('', 'cacheKey_detailsText')

const salesReplyCategoryId = 'sales_reply'

useCopilotReadable({
  description: 'Details Text',
  value: detailsText.value,
  categories: [salesReplyCategoryId]
})

useMakeCopilotDocumentReadable(clientTranscriptSummaryDocument, [salesReplyCategoryId], [])
</script>

<style scoped>
.textarea-box {
  width: 80vw;
  height: 100vh;
}
.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}
.textarea-content {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 5px;
  text-align: left;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}
.font-semibold {
  font-weight: 600;
}
.border-b {
  border-bottom-width: 1px;
}
.border-r {
  border-right-width: 1px;
}
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.w-full {
  width: 100%;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
.bg-muted {
  background-color: #f9fafb;
}
.p-4 {
  padding: 1rem;
}
.rounded-md {
  border-radius: 0.375rem;
}
.border {
  border-width: 1px;
}
.bg-background {
  background-color: #ffffff;
}
.space-y-4 {
  row-gap: 1rem;
}
.space-y-1 {
  row-gap: 0.25rem;
  margin: 1rem 0;
}
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.text-muted-foreground {
  color: #6b7280;
}
.text-left {
  text-align: left;
}
.hr {
  margin: 0.5rem 0;
}
.btn {
  padding: 0.5rem 1rem;
  background-color: #6b7280;
  color: #ffffff;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  width: 6em;
  margin-top: 1rem;
}
</style>
