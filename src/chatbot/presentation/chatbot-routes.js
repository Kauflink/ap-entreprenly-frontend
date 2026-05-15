const ChatbotView       = () => import('./views/chatbot-view.vue')
const ConversationsView = () => import('./views/conversations-view.vue')

const chatbotRoutes = [
  { path: 'chatbot',               name: 'chatbot',               component: ChatbotView,       meta: { title: 'Chatbot' } },
  { path: 'chatbot/conversations', name: 'chatbot-conversations', component: ConversationsView, meta: { title: 'Conversaciones' } }
]

export default chatbotRoutes
