import { SdkEditor } from '../sdkeditor'
import { MouseOperation } from './MouseOperation'
import { MouseOperationNone } from './MouseOperationNone'
import { MouseOperationMoveElement } from './MouseOperationMoveElement'
import { MouseOperationPointsLink } from './MouseOperationPointsLink'
import { MouseOperationAddElement } from './MouseOperationAddElement'
import { MouseOperationSelectRegion } from './MouseOperationSelectRegion'
import { MouseOperationMoveLinePoint } from './MouseOperationMoveLinePoint'
import { MouseOperationSlideDown } from './MouseOperationSlideDown'
import { MouseOperationSlideRight } from './MouseOperationSlideRight'
import { MouseOperationElementProcess } from './MouseOperationElementProcess'
import { MouseOperationElementHintAdd } from './MouseOperationElementHintAdd'
import { MouseOperationElementHintRemove } from './MouseOperationElementHintRemove'
import { MouseOperationElementHintMove } from './MouseOperationElementHintMove'
import { MouseOperationAddElementAndLink } from './MouseOperationAddElementAndLink'
import { MouseOperationPopupMenu } from './MouseOperationPopupMenu'
import { MouseOperationScrollEditor } from './MouseOperationScrollEditor'
import { MouseOperationScaleEditor } from './MouseOperationScaleEditor'

const handlers = [
  MouseOperationNone,
  MouseOperationMoveElement,
  MouseOperationPointsLink,
  MouseOperationAddElement,
  MouseOperationSelectRegion,
  MouseOperationMoveLinePoint,
  MouseOperationSlideDown,
  MouseOperationSlideRight,
  MouseOperationElementProcess,
  MouseOperationElementHintAdd,
  MouseOperationElementHintRemove,
  MouseOperationElementHintMove,
  MouseOperationAddElementAndLink,
  MouseOperationPopupMenu,
  MouseOperationScrollEditor,
  MouseOperationScaleEditor
]

export function makeHandlers(editor: SdkEditor): MouseOperation[] {
  return handlers.map(handler => new handler(editor))
}