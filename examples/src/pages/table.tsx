import { defineComponent, ref } from 'vue'
import { useCopilotReadable, useCopilotAction, useCopilotContext } from '@copilotkit/vue-core'
import { CopilotSidebar } from '@copilotkit/vue-ui'

import { TextMessage, Role } from '@copilotkit/runtime-client-gql'

export default defineComponent({
  setup() {
    const tableData = ref<any[]>([])

    const { setMessages } = useCopilotContext()

    setMessages([
      new TextMessage({
        content:
          'copilotkit结合el-table调用示例\n例如输入以下提示词\n1.新增一行数据\n2.删除一行数据\n3.更新一行数据\n....',
        role: Role.Assistant
      })
    ])

    useCopilotReadable({
      description: 'The current Element-Plus table component',
      value: tableData.value
    })

    useCopilotAction({
      name: 'appendRow',
      description: 'Append row to the current table',
      parameters: [
        {
          name: 'dataSource',
          type: 'object[]',
          description:
            'An array of objects representing the new data source for the Element-Plus table. Each object should contain the following properties:',
          attributes: [
            {
              name: 'id',
              type: 'number',
              description: 'Represents the id associated with the record in the table.'
            },
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
        tableData.value = [...tableData.value, ...dataSource]
      }
    })

    useCopilotAction({
      name: 'removeRow',
      description: 'remove row to the current table',
      parameters: [
        {
          name: 'id',
          type: 'number',
          description: 'Represents the id associated with the record in the table.'
        }
      ],
      handler: ({ id }) => {
        console.log('@id', id)
        tableData.value = tableData.value.filter(item => item.id !== id)
      }
    })

    useCopilotAction({
      name: 'updateRow',
      description: 'update row to the current table',
      parameters: [
        {
          name: 'updateData',
          type: 'object',
          description:
            'An array of objects representing the new data source for the Element-Plus table. Each object should contain the following properties:',
          attributes: [
            {
              name: 'id',
              type: 'number',
              description: 'Represents the id associated with the record in the table.'
            },
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
      handler: ({ updateData }) => {
        console.log('@updateData', updateData)
        tableData.value = tableData.value.map(item => {
          if (item.id === updateData.id) {
            return updateData
          }
          return item
        })
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
          <CopilotSidebar defaultOpen={true} clickOutsideToClose={false} />
        </>
      )
    }
  }
})
