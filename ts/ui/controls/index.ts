import { Button as UIButton } from './buttons/Button'
import { Edit as UIEdit } from './editors/Edit'
import { Dialog as UIDialog } from './Dialog'
import { InfoPanel as UIInfoPanel } from './InfoPanel'
import { Label as UILabel } from './Label'
import { ListBox as UIListBox } from './ListBox'
import { ListControl as UIListControl, ListControlElement as UIListControlElement } from './ListControl'
import { ModalFrame as UIModalFrame } from './ModalFrame'
import { Panel as UIPanel } from './Panel'
import { Splitter as UISplitter } from './Splitter'
import { Spoiler as UISpoiler } from './Spoiler'
import { Tab as UITab } from './Tab'
import { TabControl as UITabControl } from './TabControl'
import { ToolBar as UIToolBar } from './ToolBar'
import { ToolButton as UIToolButton } from './ToolButton'
import { TrackBar as UITrackBar } from './editors/TrackBar'
import { UIContainer as Container } from './UIContainer'
import { UIControl as Control, UIControlOptions as _UIControlOptions } from './UIControl'
import { UIImage as _UIImage } from './UIImage'
import { UILoader as _UILoader } from './UILoader'
import { UISimpleTable as _UISimpleTable } from './UISimpleTable'
import { Layout as _Layout } from './layouts/Layout'
import { VLayout as _VLayout } from './layouts/VLayout'
import { HLayout as _HLayout } from './layouts/HLayout'
import { FlexLayout as _FlexLayout } from './layouts/FlexLayout'
import { FixLayout as _FixLayout } from './layouts/FixLayout'
import { Builder as _Builder } from '../Builder'
import { NumberEdit as _NumberEdit } from './editors/NumberEdit'
import { UIDatePicker as _UIDatePicker } from './editors/UIDatePicker'
import { UIColorButton as _UIColorButton } from './buttons/UIColorButton'
import { Memo as _Memo } from './editors/Memo'
import { CheckBox as _CheckBox } from './buttons/CheckBox'
import { RadioButton as _RadioButton } from './buttons/RadioButton'
import { RangeSlider as _RangeSlider } from './editors/RangeSlider'
import { GoogleChart as _GoogleChart } from './special/GoogleChart'
import { UISwitcher as _UISwitcher } from './buttons/UISwitcher'
import { Canvas as _Canvas } from './Canvas'
import { SVG as _SVG } from './media/SVG'
import { DropBox as _DropBox } from './lists/DropBox'
import { ComboBox as _ComboBox } from './lists/ComboBox'
import { YaMap as _YaMap } from './special/YaMap'
import { AudioPlayer as _AudioPlayer } from './media/AudioPlayer'
import { VideoPlayer as _VideoPlayer } from './media/VideoPlayer'
import { YouTube as _YouTube } from './special/YouTube'
import { ProgressBar as _ProgressBar } from './ProgressBar'

/**
 * Declare public namespace UI
 */
export module UI {
  // tools
  export class Builder extends _Builder {}

  // controls
  export class UIContainer extends Container {}
  export class UIControl extends Control {}
  export interface UIControlOptions extends _UIControlOptions {}

  export class Button extends UIButton {}
  export class Edit extends UIEdit {}
  export class Dialog extends UIDialog {}
  export class InfoPanel extends UIInfoPanel {}
  export class Label extends UILabel {}
  export class ListBox extends UIListBox {}
  export interface ListControlElement extends UIListControlElement {}
  export class ListControl extends UIListControl<ListControlElement> {}
  export class ModalFrame extends UIModalFrame {}
  export class Panel extends UIPanel {}
  export class Splitter extends UISplitter {}
  export class Spoiler extends UISpoiler {}
  export class Tab extends UITab {}
  export class TabControl extends UITabControl {}
  export class ToolBar extends UIToolBar {}
  export class ToolButton extends UIToolButton {}
  export class TrackBar extends UITrackBar {}
  export class UIImage extends _UIImage {}
  export class UILoader extends _UILoader {}
  export class UISimpleTable extends _UISimpleTable {}
  export class NumberEdit extends _NumberEdit {}
  export class UIDatePicker extends _UIDatePicker {}
  export class UIColorButton extends _UIColorButton {}
  export class Memo extends _Memo {}
  export class CheckBox extends _CheckBox {}
  export class RadioButton extends _RadioButton {}
  export class RangeSlider extends _RangeSlider {}
  export class GoogleChart extends _GoogleChart {}
  export class YaMap extends _YaMap {}
  export class YouTube extends _YouTube{}
  export class UISwitcher extends _UISwitcher {}
  export class Canvas extends _Canvas {}
  export class SVG extends _SVG {}
  export class DropBox extends _DropBox {}
  export class ComboBox extends _ComboBox {}
  export class AudioPlayer extends _AudioPlayer {}
  export class VideoPlayer extends _VideoPlayer {}
  export class ProgressBar extends _ProgressBar {}

  // layouts
  export class Layout extends _Layout {}
  export class VLayout extends _VLayout {}
  export class HLayout extends _HLayout {}
  export class FlexLayout extends _FlexLayout {}
  export class FixLayout extends _FixLayout {}
}