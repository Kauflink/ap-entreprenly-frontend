import { Cliente } from '@/chatbot/domain/model/cliente-entity.js'

export class ClienteAssembler {
  static toEntityFromResource(resource) {
    return new Cliente({ ...resource })
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status} - ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['clientes']
    return resources.map(r => this.toEntityFromResource(r))
  }
}
