import { Pago } from 'chatbot-bc-aplicaciones-web/src/chatbot/domain/model/pago-entity.js'

export class PagoAssembler {
  static toEntityFromResource(resource) {
    return new Pago({ ...resource })
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status} - ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['pagos']
    return resources.map(r => this.toEntityFromResource(r))
  }
}
