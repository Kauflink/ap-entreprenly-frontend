import { Conversation } from '../domain/model/conversation-entity.js'

export class ConversationAssembler {
  static toEntityFromResource(r) {
    return new Conversation(r)
  }

  static toEntitiesFromResponse(response) {
    return response.data.map(ConversationAssembler.toEntityFromResource)
  }
}
