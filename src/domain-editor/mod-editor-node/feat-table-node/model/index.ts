import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'

export function createTableExtensions() {
  return [
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
  ]
}
