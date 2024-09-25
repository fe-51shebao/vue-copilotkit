import { defineComponent, onMounted, onBeforeUnmount, ref, watch, PropType } from 'vue';

export const Window = defineComponent({
  props: {
    open: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    setOpen: {
      type: Function as PropType<(open: boolean) => void>,
      required: true,
    },
    clickOutsideToClose: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    shortcut: {
      type: String as PropType<string>,
      default: '',
    },
    hitEscapeToClose: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  setup(props, { slots }) {
    const windowRef = ref<HTMLDivElement | null>(null);

    const handleClickOutside = (event: MouseEvent) => {
      if (!props.clickOutsideToClose) return;

      const parentElement = windowRef.value?.parentElement;
      let className = '';
      if (event.target instanceof HTMLElement) {
        className = event.target.className;
      }

      if (
        props.open &&
        parentElement &&
        !parentElement.contains(event.target as Node) &&
        !className.includes('copilotKitDebugMenu')
      ) {
        props.setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const isDescendantOfWrapper = windowRef.value?.contains(target);

      if (
        props.open &&
        event.key === 'Escape' &&
        (!isInput || isDescendantOfWrapper) &&
        props.hitEscapeToClose
      ) {
        props.setOpen(false);
      } else if (
        event.key === props.shortcut &&
        ((isMacOS() && event.metaKey) || (!isMacOS() && event.ctrlKey)) &&
        (!isInput || isDescendantOfWrapper)
      ) {
        props.setOpen(!props.open);
      }
    };

    const adjustForMobile = () => {
      const copilotKitWindow = windowRef.value;
      const vv = window.visualViewport;
      if (!copilotKitWindow || !vv) return;

      if (window.innerWidth < 640 && props.open) {
        copilotKitWindow.style.height = `${vv.height}px`;
        copilotKitWindow.style.left = `${vv.offsetLeft}px`;
        copilotKitWindow.style.top = `${vv.offsetTop}px`;

        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = `${window.innerHeight}px`;
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        document.body.addEventListener('touchmove', preventScroll, {
          passive: false,
        });
      } else {
        copilotKitWindow.style.height = '';
        copilotKitWindow.style.left = '';
        copilotKitWindow.style.top = '';
        document.body.style.position = '';
        document.body.style.height = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.top = '';
        document.body.style.touchAction = '';

        document.body.removeEventListener('touchmove', preventScroll);
      }
    };

    onMounted(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', adjustForMobile);
        adjustForMobile();
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', adjustForMobile);
      }
    });

    watch(() => props.open, adjustForMobile);

    return () => (
      <div class={`copilotKitWindow${props.open ? ' open' : ''}`} ref={windowRef}>
        {slots.default && slots.default()}
      </div>
    );
  },
});

const preventScroll = (event: TouchEvent): void => {
  let targetElement = event.target as Element;

  const hasParentWithClass = (element: Element, className: string): boolean => {
    while (element && element !== document.body) {
      if (element.classList.contains(className)) {
        return true;
      }
      element = element.parentElement!;
    }
    return false;
  };

  if (!hasParentWithClass(targetElement, 'copilotKitMessages')) {
    event.preventDefault();
  }
};

function isMacOS() {
  return /Mac|iMac|Macintosh/i.test(navigator.userAgent);
}
