import type {
  ExtAction,
  ExtActionType,
} from '@danmaku-anywhere/extension-protocol'
import type { Observable } from 'rxjs'

export abstract class ExtensionMessenger {
  abstract single<T extends ExtActionType>(
    action: T,
    payload: ExtAction[T]['input']
  ): Observable<ExtAction[T]['output']>

  abstract stream<T extends ExtActionType>(
    action: T,
    data: ExtAction[T]['input']
  ): Observable<ExtAction[T]['output']>
}
