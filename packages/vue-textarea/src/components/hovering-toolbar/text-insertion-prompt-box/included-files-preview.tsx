import { defineComponent, PropType, ref } from 'vue'
import { ElTag, ElAvatar } from 'element-plus'
import { DocumentPointer } from '@copilotkit/vue-core'

export interface IncludedFilesPreviewProps {
  includedFiles: DocumentPointer[]
  setIncludedFiles: (value: DocumentPointer[]) => void
}

export const IncludedFilesPreview = defineComponent({
  props: {
    includedFiles: {
      type: Array as PropType<DocumentPointer[]>,
      required: true
    },
    setIncludedFiles: {
      type: Function as PropType<(value: DocumentPointer[]) => void>,
      required: true
    }
  },
  setup(props: IncludedFilesPreviewProps) {
    const handleDelete = (filePointer: DocumentPointer) => {
      props.setIncludedFiles(props.includedFiles.filter(fp => fp !== filePointer))
    }

    return () => (
      <div class="flex flex-col gap-2 mt-2">
        <Label class="font-medium">Included context:</Label>
        <div class="flex flex-wrap gap-2">
          {props.includedFiles.map(filePointer => (
            <FileChipPreview
              key={`file-${filePointer.sourceApplication}.${filePointer.name}`}
              filePointer={filePointer}
              onDelete={() => handleDelete(filePointer)}
            />
          ))}
        </div>
      </div>
    )
  }
})

export interface FileChipPreviewProps {
  filePointer: DocumentPointer
  onDelete: () => void
}

export const FileChipPreview = defineComponent({
  props: {
    filePointer: {
      type: Object as PropType<DocumentPointer>,
      required: true
    },
    onDelete: {
      type: Function as PropType<() => void>,
      required: true
    }
  },
  setup(props: FileChipPreviewProps) {
    return () => (
      <ElTag closable onClose={props.onDelete} class="inline-flex items-center gap-2" size="large">
        <div class="flex items-center">
          <ElAvatar
            src={props.filePointer.iconImageUri}
            alt={props.filePointer.sourceApplication}
            size="small"
            style={{ backgroundColor: 'transparent' }}
            class="mr-1"
          />
          {props.filePointer.name}
        </div>
      </ElTag>
    )
  }
})

const Label = defineComponent({
  setup(_, { slots }) {
    return () => <label>{slots.default ? slots.default() : null}</label>
  }
})
