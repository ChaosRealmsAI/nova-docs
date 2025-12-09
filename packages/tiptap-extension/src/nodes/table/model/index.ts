import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Extension } from '@tiptap/core'
import { createTableAddControlsPlugin } from '../service/TableAddControlsPlugin'

/**
 * Table Add Controls Extension
 * 添加表格行/列的加号按钮功能
 */
const TableAddControlsExtension = Extension.create({
  name: 'tableAddControls',

  addProseMirrorPlugins() {
    return [createTableAddControlsPlugin()]
  },
})

export function createTableExtensions() {
  return [
    Table.configure({
      resizable: true,
      handleWidth: 5,
      cellMinWidth: 50,
      lastColumnResizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    TableAddControlsExtension,
  ]
}
