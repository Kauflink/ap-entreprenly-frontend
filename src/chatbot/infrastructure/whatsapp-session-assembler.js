import { WhatsappSession } from '../domain/model/whatsapp-session-entity.js'

export class WhatsappSessionAssembler {
  static toEntityFromResource(r) {
    return new WhatsappSession(r)
  }

  static toEntitiesFromResponse(response) {
    return response.data.map(WhatsappSessionAssembler.toEntityFromResource)
  }
}
