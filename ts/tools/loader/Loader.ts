import { LoaderTask } from './LoaderTask'
import { $ } from '../../ui/Helpers'

interface LoaderOptions {
  haveState: boolean;
}

export class Loader {
  private tasks: LoaderTask[]
  onload = () => {}

  constructor(private options: LoaderOptions) {
    this.tasks = []
  }

  public add(task: LoaderTask) {
    this.tasks.push(task)
    task.setHandle((state, complete) => {
      this.state(state)

      if (complete) {
        if (this.tasks.length) {
          this.run()
        } else {
          this.onload()
        }
      }
    })
  }

  public run() {
    let nt = this.tasks.shift()
    nt.run()
  }

  public state(text: string) {
    if (this.options?.haveState) {
      $.get("loaderstate").innerHTML = text
    }
  }
}