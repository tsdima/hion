import { API } from './api'
import { FLAG_USE_RUN, SDK } from '../core/sdk'
import { packMan } from '../main'

export class Runner {
  private sdk: SDK
  private e: any

  constructor (private project: string, private callback?: any) {}

  run(args?: any, overrideCallback?: any) {
    if(this.sdk) {
      this.sdk.run(FLAG_USE_RUN)
      if(this.e && args) {
        if(this.callback || overrideCallback) {
          this.e.onreturn = this.callback || overrideCallback;
        }
        this.e.onInit.call(args);
      }
    } else {
      API.get((this.project.indexOf("/") >= 0 ? this.project : "gui/" + this.project) + ".sha", (data: string) => {
        let sdk = new SDK(packMan.getPack("webapp"))
        sdk.load(data)
        sdk.run(FLAG_USE_RUN)
        const e = sdk.getElementById("hcTransmitter") as any
        if (e) {
          if (this.callback || overrideCallback) {
            e.onreturn = this.callback || overrideCallback
          }
          if(args) {
            e.onInit.call(args)
          }
        }
        this.sdk = sdk
        this.e = e
      })
    }
  }
}