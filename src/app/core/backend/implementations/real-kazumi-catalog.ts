import { Injectable } from '@angular/core'
import { environment } from '../../../../environments/environment'
import {
  getManifest,
  getPolicy,
} from '../../../features/kazumi/services/kazumi-api'
import {
  KazumiCatalog,
  type ManifestResult,
  type PolicyResult,
} from '../kazumi-catalog'

@Injectable()
export class RealKazumiCatalog extends KazumiCatalog {
  getManifest(): Promise<ManifestResult> {
    return getManifest(environment.apiRoot)
  }

  getPolicy(fileName: string): Promise<PolicyResult> {
    return getPolicy(environment.apiRoot, fileName)
  }
}
