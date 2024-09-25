import { defineComponent, ref, PropType } from 'vue'
import { ElButton, ElInput, ElScrollbar } from 'element-plus'
import { DocumentPointer } from '@copilotkit/vue-core'

export interface SourceSearchBoxProps {
  searchTerm: string
  suggestedFiles: DocumentPointer[]
  onSelectedFile: (filePointer: DocumentPointer) => void
}

export const SourceSearchBox = defineComponent({
  name: 'SourceSearchBox',
  props: {
    searchTerm: {
      type: String,
      required: true
    },
    suggestedFiles: {
      type: Array as PropType<DocumentPointer[]>,
      required: true
    },
    onSelectedFile: {
      type: Function as PropType<(filePointer: DocumentPointer) => void>,
      required: true
    }
  },
  setup(props: SourceSearchBoxProps) {
    const selectedValue = ref<string>('')

    return () => (
      <ElScrollbar class="rounded-lg border shadow-md w-full">
        <ElInput
          modelValue={props.searchTerm}
          class="rounded-t-lg hidden"
          placeholder="Search for a command..."
          v-model={selectedValue.value}
          onInput={value => {
            selectedValue.value = value
          }}
        />
        <div>
          {props.suggestedFiles.length === 0 ? (
            <div class="py-6 text-center text-sm">No results found.</div>
          ) : (
            <div>
              <div class="overflow-hidden p-1 text-foreground">
                <p class="py-2 text-xs font-medium px-2">Available resources</p>
                <div class="px-2 pb-4">
                  {props.suggestedFiles.map(filePointer => (
                    <ElButton
                      key={`word-${filePointer.sourceApplication}.${filePointer.name}`}
                      onClick={() => props.onSelectedFile(filePointer)}
                      class="relative w-full justify-start border-none cursor-pointer select-none items-center rounded-sm text-sm outline-none"
                      style={{ 'margin-left': 0 }}
                    >
                      <Logo width="20px" height="20px" class="mr-1">
                        <img src={filePointer.iconImageUri} alt={filePointer.sourceApplication} class="w-full h-full" />
                      </Logo>
                      {filePointer.name}
                    </ElButton>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ElScrollbar>
    )
  }
})

export const Logo = defineComponent({
  name: 'Logo',
  props: {
    width: {
      type: String,
      required: true
    },
    height: {
      type: String,
      required: true
    }
  },
  setup(props, { slots }) {
    return () => (
      <div class="flex items-center justify-center" style={{ width: props.width, height: props.height }}>
        {slots.default ? slots.default() : null}
      </div>
    )
  }
})
