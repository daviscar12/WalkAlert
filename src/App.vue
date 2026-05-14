<template>
  <ion-app class="app-shell" :class="themeClass">
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>

        <ion-title>WalkAlert</ion-title>

        <ion-buttons slot="end">
          <ion-button fill="clear" @click="toggleTheme" aria-label="Alternar tema">
            <ion-icon :icon="themeIcon" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-router-outlet />

    <ion-footer translucent class="bottom-nav">
      <ion-toolbar>
        <ion-grid>
          <ion-row class="nav-row">
            <ion-col>
              <ion-button router-link="/home" fill="clear" class="nav-button" expand="block">
                <span class="material-symbols-outlined">home</span>
                <span>Home</span>
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button router-link="/map" fill="clear" class="nav-button" expand="block">
                <span class="material-symbols-outlined">map</span>
                <span>Mapa</span>
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button router-link="/settings" fill="clear" class="nav-button" expand="block">
                <span class="material-symbols-outlined">settings</span>
                <span>Perfil</span>
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-toolbar>
    </ion-footer>
  </ion-app>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonApp,
  IonBackButton,
  IonButton,
  IonButtons,
  IonFooter,
  IonGrid,
  IonIcon,
  IonRouterOutlet,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonRow,
  IonCol
} from '@ionic/vue';
import { moon, sunny } from 'ionicons/icons';

const theme = ref<'light' | 'dark'>('light');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  document.body.classList.toggle('dark', theme.value === 'dark');
};

const themeIcon = computed(() => (theme.value === 'light' ? moon : sunny));
const themeClass = computed(() => (theme.value === 'dark' ? 'dark-theme' : 'light-theme'));
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--app-background);
}

ion-header,
ion-toolbar,
ion-footer {
  background: var(--app-surface);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

ion-toolbar {
  border-radius: 0;
}

ion-router-outlet {
  padding-bottom: 94px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(18px);
  box-shadow: 0 -12px 26px rgba(27, 78, 36, 0.08);
}

body.dark .bottom-nav,
body.dark-theme .bottom-nav,
.dark .bottom-nav {
  background: rgba(8, 19, 14, 0.98);
}

.nav-row {
  align-items: center;
  justify-content: space-between;
}

.nav-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 0;
  color: var(--ion-color-primary);
  transition: transform 0.18s ease, color 0.18s ease;
}

.nav-button:active,
.nav-button:focus,
.nav-button:hover {
  transform: translateY(-1px);
}

.nav-button .material-symbols-outlined {
  font-size: 24px;
}

.nav-button span {
  font-size: 12px;
}

ion-button {
  --padding-start: 0.5rem;
  --padding-end: 0.5rem;
}

ion-button ion-icon {
  font-size: 22px;
}
</style>
