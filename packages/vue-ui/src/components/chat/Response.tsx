import { PropType, defineComponent, defineProps } from "vue";
import { StopIcon, RegenerateIcon } from "./Icon";
import { useChatContext } from "./ChatContext";

export const  ResponseButton = defineComponent((_p,{attrs}) => {
 const { labels } = useChatContext()
 console.log('ResponseButton', attrs)
 return () => (
   <button
     class="copilotKitResponseButton"
     onClick={attrs.hClick as any}
   >
    <span>
      {
       attrs.inProgress
         ? <StopIcon />
         : <RegenerateIcon />
      }
    </span>
     {
       attrs.inProgress
         ? labels?.stopGenerating
         : labels?.regenerateResponse
     }
   </button>
 )
})