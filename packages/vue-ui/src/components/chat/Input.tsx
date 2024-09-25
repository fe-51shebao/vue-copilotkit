import { defineComponent, ref, watch } from "vue";
import { InputProps } from "./props";
import { ActivityIcon, SendIcon, PushToTalkIcon } from "./Icon";
import { AutoResizingTextarea } from "./Textarea";
import { Message } from "@copilotkit/runtime-client-gql";
// import { useCopilotContext } from "@copilotkit/vue-core";


export const Input = defineComponent({
  props:{
    inProgress:{
      type: Boolean,
      required: true,
    },
    send:{
      type:Function,
      default:(text: string) => Promise<Message>
    },
    isVisible: {
      type: Boolean,
      required: true,
    }
  },
  setup:(_p,) => {
    const textareaRef = ref<any | null>(null)
    
    const handleDivClick = (event: MouseEvent) => {
      // Check if the clicked element is not the textarea itself
      if (event.target !== event.currentTarget) return;
      textareaRef.value?.$el?.focus();
    };
    const text = ref('')
    const hsend = () => {
      if (_p.inProgress) return;
      _p.send(text.value);
      text.value = '';
      textareaRef.value?.$el?.focus();
    }
    watch(()=> _p.isVisible, () => {
      textareaRef.value?.$el?.focus();
    })
  
    const sendIcon = SendIcon
    const showPushToTalk =  false
    const sendDisabled = _p.inProgress
  
  
    return () => (
      <div class="copilotKitInput" onClick={handleDivClick}>
        <AutoResizingTextarea 
          ref={e => textareaRef.value = e}
          placeholder="Type a message..."
          autoFocus={true}
          maxRows={5}
          value={text.value}
          onChange={e => text.value = e.target.value}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              hsend();
            }
          }}
        />
        <div class="copilotKitInputControls">
          {showPushToTalk && (
            <button
              onClick={() => {}}
              class="copilotKitPushToTalkRecording"
            >
              <PushToTalkIcon />
            </button>
          )}
          <button disabled={sendDisabled} onClick={hsend}>
            <sendIcon />
          </button>
        </div>
      </div>
    )
  }
})