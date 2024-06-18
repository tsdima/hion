declare global {
  function CodeMirror(element: any, options: CodeMirror.EditorConfiguration): CodeMirror.Editor

  namespace CodeMirror {
    interface Editor extends HTMLElement {
      getValue: () => string
    }

    interface EditorConfiguration {

    }

    function fromTextArea(element: any, options: EditorConfiguration): CodeMirror.Editor
  }
}

export {}