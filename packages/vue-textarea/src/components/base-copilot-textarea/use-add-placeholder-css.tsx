import { onMounted, onUnmounted, watchEffect } from 'vue'

export function useAddPlaceholderCss(placeholderStyle: Record<string, any> | undefined) {
  onMounted(() => {
    watchEffect(() => {
      // 1: Add the CSS to the DOM
      const styleEl = document.createElement('style')
      styleEl.id = 'placeholder-styles'

      let placeholderStyles = ''
      placeholderStyles += `content: attr(data-placeholder);`
      placeholderStyles += `float: left;`
      placeholderStyles += `height: 0;`
      placeholderStyles += `pointer-events: none;`
      placeholderStyles += `width: 100%;`
      placeholderStyles += `max-width: 100%;`
      placeholderStyles += `display: block;`
      placeholderStyles += `opacity: 0.333;`
      placeholderStyles += `user-select: none;`
      placeholderStyles += `text-decoration: none;`
      // placeholder the CSS string dynamically
      if (placeholderStyle) {
        const propPlaceholderStyle = Object.entries(placeholderStyle)
          .map(([key, value]) => {
            const kebabCaseKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
            return `${kebabCaseKey}:${value};`
          })
          .join(' ')
        placeholderStyles += propPlaceholderStyle
      }

      // Append it to the ::after class
      styleEl.innerHTML = `
        .copilot-textarea.tiptap p.is-editor-empty:first-child::before {
          ${placeholderStyles}
        }
      `

      document.head.appendChild(styleEl)

      // Cleanup
      onUnmounted(() => {
        const styleEl = document.getElementById('placeholder-styles')
        styleEl?.remove()
      })
    })
  })
}
