const ChatbotView       = () => import('./views/chatbot-view.vue')
const ConversationsView = () => import('./views/conversations-view.vue')
const OrdersView        = () => import('./views/orders-view.vue')

const chatbotRoutes = [
  { path: 'chatbot',               name: 'chatbot',               component: ChatbotView,       meta: { title: 'Chatbot'        } },
  { path: 'chatbot/conversations', name: 'chatbot-conversations', component: ConversationsView, meta: { title: 'Conversaciones' } },
  { path: 'chatbot/orders',        name: 'chatbot-orders',        component: OrdersView,        meta: { title: 'Pedidos'        } }
]

export default chatbotRoutes
