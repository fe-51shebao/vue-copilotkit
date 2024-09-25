import { Message } from "@copilotkit/runtime-client-gql";
import { Ref } from "vue";
export interface ButtonProps {
  open: Ref<boolean>;
  setOpen: (open: boolean) => void;
}

export interface MessagesProps {
  messages: Message[];
  inProgress: boolean;
  children?: any
}

export interface HeaderProps {
  setOpen: (open: boolean) => void;
}
export interface InputProps {
  inProgress: boolean;
  send: (text: string) => Promise<Message>;
  isVisible?: boolean;
}

export interface WindowProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  clickOutsideToClose: boolean;
  hitEscapeToClose: boolean;
  shortcut: string;
}