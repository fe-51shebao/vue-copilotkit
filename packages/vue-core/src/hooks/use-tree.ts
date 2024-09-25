import { ref } from 'vue'
import { randomId } from '@copilotkit/shared'

export type TreeNodeId = string

export interface TreeNode {
  id: TreeNodeId
  value: string
  children: TreeNode[]
  parentId?: TreeNodeId
  categories: Set<string>
}

export type Tree = TreeNode[]

const findNode = (nodes: Tree, id: TreeNodeId): TreeNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }
    const result = findNode(node.children, id)
    if (result) {
      return result
    }
  }
  return undefined
}

const removeNode = (nodes: Tree, id: TreeNodeId): Tree => {
  return nodes.reduce((result: Tree, node) => {
    if (node.id !== id) {
      const newNode = { ...node, children: removeNode(node.children, id) }
      result.push(newNode)
    }
    return result
  }, [])
}

const addNode = (nodes: Tree, newNode: TreeNode, parentId?: TreeNodeId): Tree => {
  if (!parentId) {
    return [...nodes, newNode]
  }
  return nodes.map(node => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, newNode] }
    } else if (node.children.length) {
      return { ...node, children: addNode(node.children, newNode, parentId) }
    }
    return node
  })
}

const treeIndentationRepresentation = (index: number, indentLevel: number): string => {
  if (indentLevel === 0) {
    return (index + 1).toString()
  } else if (indentLevel === 1) {
    return String.fromCharCode(65 + index) // 65 is the ASCII value for 'A'
  } else if (indentLevel === 2) {
    return String.fromCharCode(97 + index) // 97 is the ASCII value for 'a'
  } else {
    return '-'
  }
}

const printNode = (node: TreeNode, prefix = '', indentLevel = 0): string => {
  const indent = ' '.repeat(3).repeat(indentLevel)

  const prefixPlusIndentLength = prefix.length + indent.length
  const subsequentLinesPrefix = ' '.repeat(prefixPlusIndentLength)

  const valueLines = node.value.split('\n')

  const outputFirstLine = `${indent}${prefix}${valueLines[0]}`
  const outputSubsequentLines = valueLines
    .slice(1)
    .map(line => `${subsequentLinesPrefix}${line}`)
    .join('\n')

  let output = `${outputFirstLine}\n`
  if (outputSubsequentLines) {
    output += `${outputSubsequentLines}\n`
  }

  const childPrePrefix = ' '.repeat(prefix.length)

  node.children.forEach(
    (child, index) =>
      (output += printNode(
        child,
        `${childPrePrefix}${treeIndentationRepresentation(index, indentLevel + 1)}. `,
        indentLevel + 1
      ))
  )
  return output
}

export default function useTree() {
  const tree = ref<Tree>([])

  const addElement = (value: string, categories: string[], parentId?: string) => {
    const newNodeId = randomId() // Generate new ID outside of dispatch
    const newNode: TreeNode = {
      id: newNodeId,
      value,
      children: [],
      categories: new Set(categories)
    }
    tree.value = addNode(tree.value, newNode, parentId)
    return newNodeId
  }

  const removeElement = (id: TreeNodeId) => {
    tree.value = removeNode(tree.value, id)
  }

  const printTree = (categories: string[]) => {
    const categoriesSet = new Set(categories)

    let output = ''
    tree.value.forEach((node, index) => {
      // if the node does not have any of the desired categories, continue to the next node
      if (!setsHaveIntersection(categoriesSet, node.categories)) {
        return
      }

      // add a new line before each node except the first one
      if (index !== 0) {
        output += '\n'
      }

      output += printNode(node, `${treeIndentationRepresentation(index, 0)}. `)
    })
    return output
  }

  return { tree, addElement, removeElement, printTree }
}

function setsHaveIntersection<T>(setA: Set<T>, setB: Set<T>): boolean {
  const [smallerSet, largerSet] = setA.size <= setB.size ? [setA, setB] : [setB, setA]

  for (let item of smallerSet) {
    if (largerSet.has(item)) {
      return true
    }
  }

  return false
}
