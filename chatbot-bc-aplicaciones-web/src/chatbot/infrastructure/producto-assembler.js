import { Producto } from '@/chatbot/domain/model/producto-entity.js'

export class ProductoAssembler {
  static toEntityFromResource(resource) {
    return new Producto({ ...resource })
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status} - ${response.statusText}`)
      return []
    }
    const resources = response.data instanceof Array ? response.data : response.data['productos']
    return resources.map(r => this.toEntityFromResource(r))
  }
}
