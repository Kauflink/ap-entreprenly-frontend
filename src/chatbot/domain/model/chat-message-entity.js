export class ChatMessage {
  static Sender = { CLIENT: 'client', BOT: 'bot', SYSTEM: 'system' }
  static Type   = { TEXT: 'text', IMAGE: 'image' }

  constructor({ id, conversationId, content, sender, type, sentAt }) {
    this.id             = id
    this.conversationId = conversationId
    this.content        = content
    this.sender         = sender
    this.type           = type
    this.sentAt         = sentAt
  }
}
