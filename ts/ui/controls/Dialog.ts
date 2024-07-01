import { UIContainer } from './UIContainer'
import { UIControlOptions } from './UIControl'
import { Builder } from '../Builder'
import { $ } from '../Helpers'
import { ModalFrame } from './ModalFrame'
import { GetPos } from '../../tools/tools'

interface DialogButton {
  text: string
  click: (dialog: Dialog) => void
}

interface DialogOptions extends UIControlOptions {
  showcaption?: boolean
  showborder?: boolean
  popup?: boolean
  destroy?: boolean
  resize?: boolean
  modal?: boolean
  icon?: string
  title?: string
  buttons?: DialogButton[]
}

export interface DialogPlaceOptions {
  modal?: boolean
  noCenter?: boolean
  fullScreen?: boolean
}

interface DragState {
  x: number
  y: number
  obj: Builder | null
  actionState: number
}

let dragState: DragState = { x: 0, y: 0, obj: null, actionState: 0 }
let actionState = 0

export class Dialog extends UIContainer {
  private readonly form: HTMLElement
  private mframe: ModalFrame = null

  private running: boolean = false
  private readonly destroy: boolean

  private oldState: number = 0

  public constructor(options?: DialogOptions) {
    super()

    this.form = new Builder().n("div").element
    this.make(this.form, options)
    this._ctl = this.form
    this.hide()

    this.destroy = options?.destroy || false

    if (options) {
      // if(options.width) {
      // 	this.form.width(options.width);
      // }
      // if(options.height) {
      // 	this.form.height(options.height);
      // }
      if (options.showcaption === false) {
        (this.form.childNodes[0] as HTMLElement).className = "";
        (this.form.childNodes[0] as HTMLElement).setAttribute('visible', 'false')
      }
      if (options.showborder === false) {
        this.form.style.borderWidth = '0'
      }
      if (options.popup || options.popup === undefined) {
        $.appendChild(this.form)
      }
    }

    this.setOptions(options)
  }

  private getCursorState(event: MouseEvent) {
    const pos = GetPos(this.form)
    const x = event.clientX - pos.left
    const y = event.clientY - pos.top

    if (x >= this.form.offsetWidth - 7 && y >= this.form.offsetHeight - 7) {
      return 5
    } else if (x < 3) {
      return 1
    } else if (x >= this.form.offsetWidth - 3) {
      return 2
    } else if (y < 3) {
      return 3
    } else if (y >= this.form.offsetHeight - 3) {
      return 4
    }

    return 0
  }

  private make(form: HTMLElement, options?: DialogOptions) {
    if (!this.running) {
      this.running = true

      form.className = "dialog"

      form.onresize = () => {}
      form.onclose = () => true

      if (options.resize) {
        this.form.setAttribute("resize", 'true')
        this.oldState = 0
        this.form.onmousedown = (event) => {
          actionState = this.getCursorState(event)
          if (actionState) {
            dragState.obj = new Builder(this.form)
            dragState.x = event.clientX
            dragState.y = event.clientY
          }
        }

        this.form.onmousemove = (event) => {
          const state = this.getCursorState(event)
          if (!dragState.obj && this.oldState !== state) {
            this.oldState = state
            this.form.style.cursor = ["", "w-resize", "e-resize", "n-resize", "s-resize", "se-resize"][state]
          }
        }

        this.form.onmouseup = () => { actionState = 0 }
      }

      const cap = new Builder().div("caption")

      if (options.icon) {
        cap.style("backgroundImage", "url('" + options.icon + "')")
      }

      cap.div("text").html(options.title).on("onmousedown", (event: MouseEvent) => {
        dragState.obj = new Builder(this.form)
        dragState.x = event.clientX
        dragState.y = event.clientY
      })

      cap.div("close").on("onclick", () => {
        this.close()
      })

      const frmBody = document.createElement("div")
      frmBody.className = "body"

      let last = null
      for (let i = this.form.childNodes.length - 1; i >= 0; i--) {
        const node = this.form.removeChild(this.form.childNodes[i])
        frmBody.insertBefore(node, last)
        last = node
      }

      this.form.appendChild(cap.element)
      this.form.appendChild(frmBody)

      if (options.buttons) {
        const tools = new Builder().div("tools")
        for (const btn of options.buttons) {
          tools.n("button").html(btn.text).on("onclick", () => {
            btn.click(this)
          })
        }
        this.form.appendChild(tools.element)
      }
    }
  }

  private onkeypress(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      this.close()
    }
  }

  public set caption(value: string) {
    (this.form.childNodes[0].childNodes[0] as HTMLElement).innerHTML = value
  }

  getContainer(): HTMLElement {
    return this.form.childNodes[1] as HTMLElement
  }

  public show(options?: DialogPlaceOptions) {
    this.form.removeAttribute("visible")

    if (!options?.noCenter) {
      const body = document.childNodes[1] as HTMLElement
      this.move((body.offsetWidth - this.form.offsetWidth) / 2, (body.offsetHeight - this.form.offsetHeight) / 2)
    }
    if (options?.fullScreen) {
      this.move(0, 0)
      this.form.style.height = this.form.style.width = "100%"
    }
    if (options?.modal || options?.modal === undefined) {
      this.mframe = new ModalFrame(this.form)
    }

    window.addEventListener("keydown", this.onkeypress)

    return this
  }

  public hide() {
    if (this.destroy) {
      this.form.className = ""
      this.form.innerHTML = ""
      this.running = false
      super.hide()
      $.removeChild(this.form)
      return this
    }
    return super.hide()
  }

  public close() {
    if (this.form.onclose(null)) {
      this.hide()
      if (this.mframe) {
        this.mframe.close()
        this.mframe = null
      }

      window.removeEventListener("keydown", this.onkeypress)
    }
  }

  public getButton(index: number) {
    return this.form.lastChild.childNodes[index] as HTMLElement
  }

  public addListener(name: string, func: any) {
    if (name === "resize") {
      this.form.onresize = func
    } else if(name === "close") {
      this.form.onclose = func
    } else {
      super.addListener(name, func)
    }
  }
}

window.addEventListener("load", function(){
  const body = document.getElementsByTagName("body")[0]
  body.onmousedown = function() {
    if (dragState.obj) {
      return false
    }
  }
  body.onmouseup = function() {
    dragState.obj = null
  }
  body.onmousemove = function(event) {
    if (dragState.obj) {
      const x = event.clientX
      const y = event.clientY
      if (actionState) {
        const dx = (x - dragState.x)
        const dy = (y - dragState.y)
        switch (actionState) {
          case 1:
            dragState.obj.move(dragState.obj.offsetLeft + dx, dragState.obj.offsetTop)
            dragState.obj.width(dragState.obj.offsetWidth - 6 - dx)
            break
          case 2:
            dragState.obj.width(dragState.obj.offsetWidth - 6 + dx)
            break
          case 3:
            dragState.obj.move(dragState.obj.offsetLeft, dragState.obj.offsetTop + dy)
            dragState.obj.height(dragState.obj.offsetHeight - 6 - dy)
            break
          case 4:
            dragState.obj.height(dragState.obj.offsetHeight - 6 + dy)
            break
          case 5:
            dragState.obj.width(dragState.obj.offsetWidth - 6 + dx)
            dragState.obj.height(dragState.obj.offsetHeight - 6 + dy)
            break
        }
        // TODO fix it
        (dragState.obj.element.onresize as any)(dragState.obj.offsetWidth - 6, dragState.obj.offsetHeight - 6)
        dragState.x = x
        dragState.y = y
      } else {
        dragState.obj.move(dragState.obj.offsetLeft + (x - dragState.x), dragState.obj.offsetTop + (y - dragState.y))
        dragState.x = x
        dragState.y = y
      }
    }
  }
})