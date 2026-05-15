import { ChatOrder } from '../domain/model/chat-order-entity.js'

export class ChatOrderAssembler {
  static toEntityFromResource(r) {
    return new ChatOrder(r)
  }

  static toEntitiesFromResponse(response) {
    return response.data.map(ChatOrderAssembler.toEntityFromResource)
  }
}
