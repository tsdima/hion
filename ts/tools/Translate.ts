import { API } from './api'
import { getOption } from './tools'

export class Translate {
  strings = {}
  onload = () => {}

  public translate(text: string): string {
    // if(!this.strings[string]) {
    // 	console.log(string)
    // }
    return this.strings[text] || text;
  }

  public load() {
    let lang = this.getLang();
    API.get("lang/" + lang + ".json", (data: string) => {
      this.strings = JSON.parse(data)
      this.onload()
    })
  }

  public getLang(): string {
    let def = window.navigator.language.substring(0, 2)
    if(def !== "ru" && def !== "en") {
      def = "en"
    }
    return getOption("opt_lang", def)
  }
}

