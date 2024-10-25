import { defineComponent, onMounted, ref, reactive } from 'vue'

export default defineComponent({
  name: 'ProvideApiKeyDialog',
  props: {
    apiKey: {
      type: String,
    },
    runtimeUrl:{
      type: String,
    }
  },
  emits: ['update:apiKey','update:runtimeUrl'],
  setup(props, { emit }) {
    const showDialog = ref(false)
    const setShowDialog = (value: boolean) => {
      showDialog.value = value
    }
    const dialogV = reactive({
      apiKey:props.apiKey,
      runtimeUrl:props.runtimeUrl
    })
    const handleSubmit = () => {
      emit('update:apiKey', dialogV.apiKey)
      emit('update:runtimeUrl', dialogV.runtimeUrl)
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
            <p>当采用默认的runtimeUrl='http://47.94.253.214/api/copilotkit/zhipu'时，可以在10.30之前免费使用，额度用完为止（貌似莫名不稳定）</p>
            <p>当设置runtimeUrl='http://47.94.253.214/api/copilotkit'时，需要在apiKey输入通义千问的key自行使用，服务器端只是透传，不存储</p>
            <p>当设置runtimeUrl=''时，需要在apiKey输入copilotkit的publicKey,会连接cloud.copilotkit.ai</p>
          </div>
          <div class="h-20px"></div>
          <div class="flex">
            <el-input v-model={dialogV.runtimeUrl} placeholder="copilotkit后端代理" class="flex-1" />
            <el-input v-model={dialogV.apiKey} placeholder="ck_pub_..." class="flex-1" />
            <el-button
            class="ml-2 w-80px"
            type="primary"
            disabled={dialogV.value === ""}
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