// Sigue el patrón de inventory-routes.js del compañero: lazy imports + export default
const ChatView     = () => import('./views/chat-view.vue')
const CatalogoView = () => import('./views/catalogo-view.vue')
const PedidoView   = () => import('./views/pedido-view.vue')
const PagoView     = () => import('./views/pago-view.vue')

const chatbotRoutes = [
  { path: 'chatbot-chat',               name: 'chatbot-chat',     component: ChatView,     meta: { title: 'Conversaciones' } },
  { path: 'chatbot-catalogo',           name: 'chatbot-catalogo', component: CatalogoView, meta: { title: 'Catálogo' } },
  { path: 'chatbot-pedidos',            name: 'chatbot-pedidos',  component: PedidoView,   meta: { title: 'Pedidos' } },
  { path: 'chatbot-pedidos/:id/pago',   name: 'chatbot-pago',     component: PagoView,     meta: { title: 'Validar pago' } }
]

export default chatbotRoutes
