import { defineComponent, ref } from 'vue'
import { useCopilotReadable, useCopilotAction, useCopilotChat } from '@copilotkit/vue-core'
import { CopilotSidebar } from '@copilotkit/vue-ui'

export default defineComponent({
  setup() {
    const tableData = ref<any[]>([])

    useCopilotReadable({
      description:
        'This application leverages the Element-Plus table component to display and manage data in a structured format.',
      value: tableData
    })

    useCopilotAction({
      name: 'updateTableData',
      description:
        'Modifies the data source for the Element-Plus table component, ensuring that the table reflects the most current information.',
      parameters: [
        {
          name: 'dataSource',
          type: 'object[]',
          description:
            'An array of objects representing the new data source for the Element-Plus table. Each object should contain the following properties:',
          attributes: [
            {
              name: 'date',
              type: 'string',
              description: 'Represents the date associated with the record in the table.'
            },
            {
              name: 'name',
              type: 'string',
              description: 'Identifies the name associated with the record in the table.'
            },
            {
              name: 'address',
              type: 'string',
              description: 'Specifies the address associated with the record in the table.'
            }
          ]
        }
      ],
      handler: ({ dataSource }) => {
        console.log('@dataSource', dataSource)
        tableData.value = dataSource
      }
    })

    return () => {
      return (
        <>
          <el-table data={tableData.value} style={{ width: '100%' }}>
            <el-table-column prop="date" label="Date" width="180" />
            <el-table-column prop="name" label="Name" width="180" />
            <el-table-column prop="address" label="Address" />
          </el-table>
          <CopilotSidebar />
        </>
      )
    }
  }
})
