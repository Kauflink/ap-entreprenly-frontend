// Sigue el patrón de tutorial.assembler.js del profe (métodos estáticos)
import { Pedido } from '@/chatbot/domain/model/pedido-entity.js'

export class PedidoAssembler {
  static toEntityFromResource(resource) {
    return new Pedido({ ...resource })
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status} - ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['pedidos']
    return resources.map(r => this.toEntityFromResource(r))
  }
}
