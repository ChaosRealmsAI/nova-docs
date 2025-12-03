import type { Node as PMNode } from '@tiptap/pm/model'

export interface HeadingAttributes {
  id: string | null
  level: number
  numbered: boolean
  indent: number
  collapsed: boolean
}

export type NumberingMap = Map<number, string>

export interface FoldRange {
  from: number
  to: number
}

export type ProseMirrorNode = PMNode
