import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import MapPage from '../views/MapPage.vue';
import SettingsPage from '../views/SettingsPage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import ProfileInfoPage from '../views/ProfileInfoPage.vue';
import ShareRoutePage from '../views/ShareRoutePage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/register'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/map',
    name: 'Map',
    component: MapPage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/profile-info',
    name: 'ProfileInfo',
    component: ProfileInfoPage
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage
  },
  {
    path: '/share-route',
    name: 'ShareRoute',
    component: ShareRoutePage
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
