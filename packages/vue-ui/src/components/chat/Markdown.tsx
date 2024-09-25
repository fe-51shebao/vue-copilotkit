import { MdPreview } from 'md-editor-v3'

type MarkdownProps = {
  content: string;
};
export const Markdown = ({ content }: MarkdownProps) => {
  return (
    <div class="copilotKitMarkdown">
      <MdPreview
        style={{ height: '100%' }}
        modelValue={content}
      />
    </div>
  )
}