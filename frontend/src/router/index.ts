import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '../stores/session.ts'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ItemView from '../views/ItemView.vue'
import SearchView from '../views/SearchView.vue'
import UserView from '../views/UserView.vue'
import SignUpView from '../views/SignUpView.vue'
import CreateItemView from '../views/CreateItemView.vue'

const ifAuthenticated = (to, from, next) => {
  const session = useSessionStore()
  if (session.loggedIn) {
    return next()
  }
  return next({ name: 'login', query: { redirect: to.fullPath } })
}

const routes =[
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/signup', name: 'signup', component: SignUpView },
  { path: '/item/:id', name: 'item', component: ItemView },
  { path: '/search', name: 'search', component: SearchView},
  { path: '/user/:id', name: 'user', component: UserView, beforeEnter: ifAuthenticated},
  { path: '/create', name: 'create', component: CreateItemView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
