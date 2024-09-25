import { onMounted, onUnmounted, watchEffect } from 'vue'

export function useAddBrandingCss(suggestionStyleAugmented: Record<string, any>, disableBranding: boolean | undefined) {
  const cssSelector = '.base-copilot-textarea.text-tiptap'

  onMounted(() => {
    watchEffect(() => {
      if (disableBranding) {
        return
      }

      // 1: Add the CSS to the DOM
      const styleEl = document.createElement('style')
      styleEl.id = 'dynamic-styles'

      // Build the CSS string dynamically
      let dynamicStyles = Object.entries(suggestionStyleAugmented)
        .map(([key, value]) => {
          const kebabCaseKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
          return `${kebabCaseKey}:${value};`
        })
        .join(' ')

      // Append overrides for italics and font-size
      dynamicStyles += `font-style: normal; font-size: x-small;`
      dynamicStyles += `content: "CopilotKit";`
      dynamicStyles += `bottom: 6px;`
      dynamicStyles += `right: 6px;`
      dynamicStyles += `pointer-events: none;`
      dynamicStyles += `font-weight: 200;`
      dynamicStyles += `padding: 0;`
      dynamicStyles += `margin: 0;`
      dynamicStyles += `border: 0;`
      dynamicStyles += `line-height: 1;`
      dynamicStyles += `position: absolute;`

      // Append it to the ::after class
      styleEl.innerHTML = `
        ${cssSelector}::after {
          ${dynamicStyles}
        }
      `

      document.head.appendChild(styleEl)

      // 2: Add the scroll listener
      const textarea = document.querySelector(cssSelector)
      const handleScroll = () => {
        const styleEl = document.getElementById('dynamic-styles')
        if (styleEl && textarea) {
          const offsetFromBottom = -textarea.scrollTop + 6
          const offsetFromRight = -textarea.scrollLeft + 6
          styleEl.innerHTML = `
            ${cssSelector}::after {
              ${dynamicStyles}
              bottom: ${offsetFromBottom}px;
              right: ${offsetFromRight}px;
            }
          `
        }
      }

      textarea?.addEventListener('scroll', handleScroll)

      // Cleanup
      onUnmounted(() => {
        const styleEl = document.getElementById('dynamic-styles')
        styleEl?.remove()
        textarea?.removeEventListener('scroll', handleScroll)
      })
    })
  })
}
