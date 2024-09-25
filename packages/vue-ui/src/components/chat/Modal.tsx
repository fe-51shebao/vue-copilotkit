
import { ChatContextProvider } from "./ChatContext";
import { Window as DefaultWindow } from "./Window";
import { Button as DefaultButton } from "./Button";
import { Header as DefaultHeader } from "./Header";
import { Messages as DefaultMessages } from "./Messages";
import { Input as DefaultInput } from "./Input";
import { ResponseButton as DefaultResponseButton } from "./Response";
import { CopilotChat } from "./Chat";
import { defineComponent, PropType, ref, render } from "vue";
import { SystemMessageFunction } from "@copilotkit/vue-core";

export interface CopilotModalProps extends Record<string, any> {
  /**
   * Whether the chat window should be open by default.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * If the chat window should close when the user clicks outside of it.
   * @default true
   */
  clickOutsideToClose?: boolean;

  /**
   * If the chat window should close when the user hits the Escape key.
   * @default true
   */
  hitEscapeToClose?: boolean;

  /**
   * The shortcut key to open the chat window.
   * Uses Command-[shortcut] on a Mac and Ctrl-[shortcut] on Windows.
   * @default '/'
   */
  shortcut?: string;

  /**
   * A callback that gets called when the chat window opens or closes.
   */
  onSetOpen?: (open: boolean) => void;
}
// const openState = ref(false);
export const CopilotModal = defineComponent({
  props:{
    instructions:{
      type: String,
      default: ''
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    clickOutsideToClose: {
      type: Boolean,
      default: true
    },
    hitEscapeToClose: {
      type: Boolean,
      default: true
    },
    onSetOpen: {
      type: Function as PropType<(open: boolean) => void>,  
    },
    onSubmitMessage: {
      type: Function as PropType<(messageContent: string) => void>,
    },
    shortcut: {
      type: String,
      default: '/'
    },
    icons: {
      type: Object
    },
    labels: {
      type: Object
    },
    makeSystemMessage: {
      type: Function as PropType<SystemMessageFunction>,
    },
    showResponseButton: {
      type: Boolean,
      default: true
    },
    onInProgress: {
      type: Function as PropType<(isLoading: boolean) => void>,
    },
    className: {
      type: String
    }
  },
  setup(props, { slots }) {
    const { 
      instructions,
      defaultOpen,
      clickOutsideToClose,
      hitEscapeToClose,
      onSetOpen,
      onSubmitMessage,
      shortcut = "/",
      icons,
      labels,
      makeSystemMessage,
      showResponseButton,
      onInProgress,
      className,
     } = props;
    const openState = ref(defaultOpen);
    const setOpenState = (open: boolean) => {
      openState.value = open;
      onSetOpen?.(open);
    };
    const Window = slots.window || DefaultWindow;
    const Header  = slots.header || DefaultHeader;
    const Messages  = slots.messages || DefaultMessages;
    const Input  = slots.input || DefaultInput;
    const ResponseButton  = slots.responseButton || DefaultResponseButton;
    return () => (<ChatContextProvider labels={labels} open={openState.value} setOpen={setOpenState}>
      {slots.children?.() || null}
      <div class={className}>
        {slots.button?.() || <DefaultButton open={openState} setOpen={setOpenState} />}
        <Window 
          open={openState.value}
          setOpen={setOpenState}
          clickOutsideToClose={clickOutsideToClose}
          shortcut={shortcut}
          hitEscapeToClose={hitEscapeToClose}
        >
          <Header setOpen={setOpenState} />
          <CopilotChat 
            instructions={instructions}
            onSubmitMessage={onSubmitMessage}
            makeSystemMessage={makeSystemMessage}
            showResponseButton={showResponseButton}
            onInProgress={onInProgress}
          >
            {{
              messages: (props) =>{
                return (<Messages {...props} >
                  {/* success */}
                  {{
                    default: () => <>{props.children.default?.() || null}</>
                  }}
                  {/* fail */}
                  {/* {{
                    default: () => {props.children.default?.() || null}
                  }} */}
                  {/* success */}
                  {/* {props.children.default?.() || null} */}
                  {/* fail */}
                  {/* {props.children} */}
                </Messages>)
              },
              input: (props) => <Input {...props} />,
              responseButton: (props) => <ResponseButton {...props} />
            }}
          </CopilotChat>
        </Window>
      </div>
    </ChatContextProvider>)
  }
})

// export const CopilotModal = ({
//   instructions,
//   defaultOpen = false,
//   clickOutsideToClose = true,
//   hitEscapeToClose = true,
//   onSetOpen,
//   onSubmitMessage,
//   shortcut = "/",
//   icons,
//   labels,
//   makeSystemMessage,
//   showResponseButton = true,
//   onInProgress,
//   className,
// }: CopilotModalProps,{ slots }: any) => {
//   const setOpenState = (open: boolean) => {
//     openState.value = open;
//     onSetOpen?.(open);
//   };
//   const Window = slots.window || DefaultWindow;
//   const Header = slots.header || DefaultHeader;
//   const Messages = slots.messages || DefaultMessages;
//   const Input = slots.input || DefaultInput;
//   const ResponseButton = slots.responseButton || DefaultResponseButton;
//   return (
//     <ChatContextProvider labels={labels} open={openState.value} setOpen={setOpenState}>
//       {slots.children?.() || null}
//       <div class={className}>
//         {slots.button?.() || <DefaultButton open={openState} setOpen={setOpenState} />}
//         <Window 
//           open={openState.value}
//           setOpen={setOpenState}
//           clickOutsideToClose={clickOutsideToClose}
//           shortcut={shortcut}
//           hitEscapeToClose={hitEscapeToClose}
//         >
//           <Header setOpen={setOpenState} />
//           <CopilotChat 
//             instructions={instructions}
//             onSubmitMessage={onSubmitMessage}
//             makeSystemMessage={makeSystemMessage}
//             showResponseButton={showResponseButton}
//             onInProgress={onInProgress}
//           >
//             {{
//               messages: (props) =>{
//                 return (<Messages {...props} >
//                   {/* success */}
//                   {{
//                     default: () => <>{props.children.default?.() || null}</>
//                   }}
//                   {/* fail */}
//                   {/* {{
//                     default: () => {props.children.default?.() || null}
//                   }} */}
//                   {/* success */}
//                   {/* {props.children.default?.() || null} */}
//                   {/* fail */}
//                   {/* {props.children} */}
//                 </Messages>)
//               },
//               input: (props) => <Input {...props} />,
//               responseButton: (props) => <ResponseButton {...props} />
//             }}
//           </CopilotChat>
//         </Window>
//       </div>
//     </ChatContextProvider>
//   )
// }