import { ChatMessage } from '../domain/model/chat-message-entity.js'

export class ChatMessageAssembler {
  static toEntityFromResource(r) {
    return new ChatMessage(r)
  }

  static toEntitiesFromResponse(response) {
    return response.data.map(ChatMessageAssembler.toEntityFromResource)
  }
}
