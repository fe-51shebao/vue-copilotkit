# `<CopilotTextarea />`

<br/>
 
`<CopilotTextarea>` 是一个 Vue 组件，可作为标准 `<textarea>` 的替代品，
提供由 AI 驱动的增强自动完成功能。它具有上下文感知功能，可与
[`useCopilotReadable`](/packages/vue-core/src/hooks/use-copilot-readable.ts) 钩子无缝集成，根据应用程序上下文提供智能建议。
 
此外，它还提供了一个悬停编辑器窗口（默认情况下，在 Mac 上通过`Cmd + K`和在 Windows 上通过`Ctrl + K`可用），允许用户建议对文本进行更改，例如提供摘要或重新措辞文本。
 
## Example
 
```tsx
import { CopilotTextarea } from '@copilotkit/vue-textarea';
 
<CopilotTextarea
  autosuggestionsConfig={{
    textareaPurpose:
     "the body of an email message",
    chatApiConfigs: {},
  }}
/>
```
 
## Usage
 
### Install Dependencies
 
该组件是 [@copilotkit/vue-textarea](https://npmjs.com/) 包的一部分。
 
```shell npm2yarn \"@copilotkit/vue-textarea"\
npm install @copilotkit/vue-textarea
```
 
### Usage
 
在 Vue 应用程序中使用 CopilotTextarea 组件的方式类似于标准 `<textarea />`，并针对 AI 功能进行额外配置。
 
For example:
 
```tsx
import { ref } from "vue";
import { CopilotTextarea } from "@copilotkit/vue-textarea";
 
export function ExampleComponent() {
  const text = ref('')
 
  return (
    <CopilotTextarea
      className="custom-textarea-class"
      value={text.value}
      onValueChange={(value: string) => text.value = value}
      placeholder="Enter your text here..."
      autosuggestionsConfig={{
        textareaPurpose: "Provide context or purpose of the textarea.",
        chatApiConfigs: {
          suggestionsApiConfig: {
            maxTokens: 20,
            stop: [".", "?", "!"],
          },
        },
      }}
    />
  );
}
```
 
### Look & Feel
 
默认情况下，CopilotKit 组件没有任何样式。您可以在项目根目录中导入 CopilotKit 的样式表：
```tsx fileName="YourRootComponent.tsx" {2}
...
import "@copilotkit/vue-ui/styles.css";
 
export function YourRootComponent() {
  return (
    <CopilotKit>
      ...
    </CopilotKit>
  );
}
```
有关如何自定义样式的更多信息，请参阅[自定义外观](/concepts/customize-look-and-feel)指南。

## Properties

- **disableBranding** `boolean`  
  确定是否应禁用 CopilotKit 品牌标识。默认值为`false`。

- **className** `string`  
  指定要应用于 textarea 的类名。

- **editorStyle** `Record<string, any>`  
  指定要应用于 textarea 的 CSS 样式。

- **placeholderStyle** `Record<string, any>`  
  指定要应用于占位符文本的 CSS 样式。

- **suggestionsStyle** `Record<string, any>`  
  指定应用于建议列表的 CSS 样式。

- **hoverMenuClassname** `string`  
  应用于编辑器弹出窗口的类名。

- **value** `string`  
  textarea 的初始值。可以通过 `onValueChange` 控制。

- **onValueChange** `(value: string) => void`  
  当文本区域的值改变时调用回调。

- **onChange** `(event: SemiFakeTextAreaEvent) => void`  
  当 textarea 元素上触发 `change` 事件时调用回调。

- **shortcut** `string`  
  打开编辑器弹出窗口的快捷键。默认为 `"Cmd-k"`。

- **autosuggestionsConfig** `AutosuggestionsConfigUserSpecified` _(required)_  
  自动建议功能的配置设置。
  有关完整参考，[去 GitHub 上的界面](/packages/vue-textarea/src/types/base/base-copilot-textarea-props.tsx)。
 
  - **textareaPurpose** `string` _(required)_  
    纯文本文本区域的用途。

    示例：“The body of the email response”
 
  - **chatApiConfigs** `ChatApiConfigs`
    聊天 API 配置。
 
    <strong>注意：</strong>您必须指定`suggestionsApiConfig`或`insertionApiConfig`中的至少一个。
 
    - **suggestionsApiConfig** `SuggestionsApiConfig`
        如需完整参考，请[点击此处](/packages/vue-textarea/src/types/autosuggestions-config/suggestions-api-config.tsx)。

    - **insertionApiConfig** `InsertionApiConfig`
        如需完整参考，请[点击此处](/packages/vue-textarea/src/types/autosuggestions-config/insertions-api-config.tsx).

 
  - **disabled** `boolean`  
    文本区域是否被禁用。

  - **disableBranding** `boolean`  
    是否禁用 CopilotKit 品牌。

  - **placeholderStyle** `Record<string, any>`  
    指定要应用于占位符文本的 CSS 样式。

  - **suggestionsStyle** `Record<string, any>`  
    指定应用于建议列表的 CSS 样式。

  - **hoverMenuClassname** `string`  
    应用于编辑器弹出窗口的类名。

  - **value** `string`  
    textarea 的初始值。可以通过 `onValueChange` 控制。

  - **onValueChange** `(value: string) => void`  
    当文本区域的值改变时调用回调。

  - **onChange** `(event: SemiFakeTextAreaEvent) => void`  
    当 textarea 元素上触发 `change` 事件时调用回调。

  - **shortcut** `string`  
    打开编辑器弹出窗口的快捷键。默认为 `"Cmd-k"`。
