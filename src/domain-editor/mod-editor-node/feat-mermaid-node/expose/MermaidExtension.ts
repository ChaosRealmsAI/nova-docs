import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { MermaidComponent } from '../view/MermaidComponent'

export interface MermaidOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaid: {
      setMermaid: () => ReturnType
    }
  }
}

export const MermaidExtension = Node.create<MermaidOptions>({
  name: 'mermaid',

  group: 'block',
  
  atom: true, // It's a self-contained node, content is in attributes

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      code: {
        default: 'graph TD\n A[Start] --> B[End]',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'mermaid' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidComponent)
  },

  addCommands() {
    return {
      setMermaid:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          })
        },
    }
  },
})
