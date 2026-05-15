const ChatbotView       = () => import('./views/chatbot-view.vue')
const ConversationsView = () => import('./views/conversations-view.vue')
const OrdersView        = () => import('./views/orders-view.vue')

const chatbotRoutes = [
  { path: 'chatbot',               name: 'chatbot',               component: ChatbotView,       meta: { titleKey: 'pages.chatbot'              } },
  { path: 'chatbot/conversations', name: 'chatbot-conversations', component: ConversationsView, meta: { titleKey: 'pages.chatbotConversations' } },
  { path: 'chatbot/orders',        name: 'chatbot-orders',        component: OrdersView,        meta: { titleKey: 'pages.chatbotOrders'        } }
]

export default chatbotRoutes
