import { HeaderProps } from "./props";
import { HeaderCloseIcon } from './Icon'
export const Header = ({ setOpen }: HeaderProps) => {

  return (
    <div class="copilotKitHeader">
      <div>CopilotKit</div>
      <button onClick={() => setOpen(false)} aria-label="Close">
        <HeaderCloseIcon/>
      </button>
    </div>
  );
};
