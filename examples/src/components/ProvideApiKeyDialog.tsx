import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'ProvideApiKeyDialog',
  props: {
    apiKey: {
      type: String,
    },
  },
  emits: ['update:apiKey'],
  setup(props, { emit }) {
    const showDialog = ref(false)
    const setShowDialog = (value: boolean) => {
      showDialog.value = value
    }
    const apiKeyV = ref('')
    const handleSubmit = () => {
      emit('update:apiKey', apiKeyV.value)
      setShowDialog(false)
    }
    onMounted(() => {
      console.log('props.apiKey', props.apiKey)
      !props.apiKey && setShowDialog(true)
    })
    return () => (
      <div class="provide-api-key-dialog text-left">
        <div class="absolute top-0 bg-neutral-900 flex justify-center items-center text-sm font-medium text-neutral-100 h-10 w-full gap-x-2 left-0">
        <span>Copilot Cloud API key is set.</span>{" "}
        <span
          class="mx-0 px-0 underline text-neutral-100 cursor-pointer"
          onClick={() => setShowDialog(true)}
        >
          Change
        </span>
        <el-dialog v-model={showDialog.value} title="Provide Copilot Cloud Public API key" show-close={false} close-on-click-modal={false} close-on-press-escape={false} width="500px" align-center>
          <div>
            <span>Don{"'"}t have an API key?</span>{" "}
            <span  class="mx-0 px-0 underline">
              <a
                href="https://cloud.copilotkit.ai?ref=example-todos-app-provide-api-key"
                target="_blank"
                class={"color-black hover:color-black "}
              >
                Sign up for free
              </a>
              .
            </span>
          </div>
          <div class="h-20px"></div>
          <div class="flex">
            <el-input v-model={apiKeyV.value} placeholder="ck_pub_..." class="flex-1" />
            <el-button
            class="ml-2 w-80px"
            type="primary"
            disabled={apiKeyV.value === ""}
            onClick={handleSubmit}
            >
              Submit
            </el-button>
          </div>
        </el-dialog>                                                                                                      
      </div>

      </div>
    )
  }
})