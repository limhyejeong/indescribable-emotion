import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// import AddEmotionOne from '../대기중/AddEmotion-onepage.vue';
import EditEmotion from '../views/EditEmotion.vue';
import CreateView from '../views/CreateView.vue';
// import OutputView from '../views/OutputView.vue';
import ListView from '../views/ListView.vue';
import PiniaTest from '../views/PiniaTest.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  // {
  //   path: '/add1',
  //   name: 'addemotion1',
  //   component: AddEmotionOne
  // },
  {
    path: '/create',
    name: 'createemotion',
    component: CreateView
  },
  {
    path: '/emotions/:emotionId',
    name: 'editemotion',
    component: EditEmotion
  },
  {
    path: '/list',
    name: 'listview',
    component: ListView
  },
  // {
  //   path: '/output',
  //   name: 'outputview',
  //   component: OutputView
  // },
  {
    path: '/test',
    name: 'piniatest',
    component: PiniaTest
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
