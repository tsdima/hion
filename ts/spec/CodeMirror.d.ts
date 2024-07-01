export interface CodeMirrorEditor extends HTMLElement {
  getValue: () => string
  setValue: (text: string) => void
  on: (name: string, func: any) => void
}

declare global {
  function CodeMirror(element: any, options: any): CodeMirrorEditor

  namespace CodeMirror {
    interface EditorConfiguration {
    }
    function fromTextArea(element: any, options: EditorConfiguration): CodeMirrorEditor
  }
}

export {}