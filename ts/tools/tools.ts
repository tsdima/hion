import { Builder } from '../ui/Builder'
import { InfoPanel } from '../ui/controls/InfoPanel'
import { $ } from '../ui/Helpers'
import { translate } from '../main'

/** Translate text to current language */
export var _T:(text: string) => string = null;

export function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

//******************************************************************************
// functions
//******************************************************************************
interface Error {
  code: number;
  info?: string;
}
const infoPanel = new InfoPanel()
/**
 * Display error top
 * @param error - code and info
 */
export function displayError(error: Error) {
  const text = "Unknown error, code = " + error.code + (error.info ? ", " + error.info : "")
  const code = "error." + error.code
  const tText = translate.translate(code)

  infoPanel.error(tText === code ? text : tText + (error.info ? ": " + error.info : ""))
}

export function printError(text: string) {
  new Builder($.get("state")).n("div").html(text)
}

export function GetPos(offTrial?: HTMLElement|HTMLCanvasElement) {
  let offL= 0
  let offT= 0

  while(offTrial) {
    offL += offTrial.offsetLeft - offTrial.scrollLeft
    offT += offTrial.offsetTop - offTrial.scrollTop
    offTrial = offTrial.offsetParent as HTMLElement
  }

  return { left: offL, top: offT }
}

export function toStep(v: number) { return v < 0 ? Math.ceil(v/7)*7 : Math.floor(v/7)*7; }

//******************************************************************************
// WEB API polyfill
//******************************************************************************
export function fullScreen(element: HTMLElement) {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  }
}

export function fullScreenCancel() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}

export function isInFullscreen() {
  return !!document.fullscreenElement
}

if(!String.prototype.startsWith) {
  String.prototype.startsWith = function(text){ return this.indexOf(text) === 0 }
}

//******************************************************************************
// options
//******************************************************************************
export function getOption(name: string, defValue: any) {
  return window.localStorage["gv_" + name] || defValue
}

export function setOption(name: string, value: any) {
  window.localStorage["gv_" + name] = value
}

export function getOptionBool(name: string, defValue: boolean | number): boolean {
  return parseInt(getOption(name, defValue)) === 1
}

export function getOptionInt(name: string, defValue: number): number {
  return parseInt(getOption(name, defValue))
}

export function setOptionBool(name: string, value: boolean | number) {
  setOption(name, value)
}

export function setOptionInt(name: string, value: number) {
  setOption(name, value)
}