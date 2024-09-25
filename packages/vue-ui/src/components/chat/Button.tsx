import { ButtonProps } from "./props";
import { OpenIcon, CloseIcon } from './Icon'

export const Button = ({ open, setOpen }: ButtonProps) => {
  const hsetOpen = () => {
    setOpen(!open.value);
  };
  return (
    <div onClick={hsetOpen}>
      <button
        class={`copilotKitButton ${open.value ? "open" : ""}`}
        aria-label={open.value ? "Close Chat" : "Open Chat"}
      >
        <div class="copilotKitButtonIcon copilotKitButtonIconOpen">
          <OpenIcon/>
        </div>
        <div class="copilotKitButtonIcon copilotKitButtonIconClose">
          <CloseIcon/>
        </div>
      </button>
    </div>
  );
};