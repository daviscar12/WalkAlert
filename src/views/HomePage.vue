<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>WalkAlert</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding home-page">
      <section class="hero-card">
        <h1>Segurança ao caminhar</h1>
        <p>Bem-vindo ao WalkAlert — seu aplicativo para caminhadas mais seguras.</p>
        <div class="hero-actions">
          <ion-button expand="block" size="large" color="success" @click="emergencyAction">
            <ion-icon :icon="alertCircleOutline" slot="start"></ion-icon>
            Emergência
          </ion-button>
        </div>
      </section>

      <ion-card class="quick-card">
        <ion-card-header>
          <ion-card-title>Ações rápidas</ion-card-title>
          <ion-card-subtitle>Comece rapidamente ou gerencie suas rotas</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="quick-grid">
            <ion-button expand="block" class="quick-button primary" @click="startNewRoute">Iniciar rota</ion-button>
            <ion-button expand="block" class="quick-button secondary" router-link="/map">Abrir mapa</ion-button>
            <ion-button expand="block" class="quick-button secondary" router-link="/share-route">Compartilhar rota</ion-button>
            <ion-button expand="block" class="quick-button warning" router-link="/settings">Configurações</ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card class="saved-card">
        <ion-card-header>
          <ion-card-title>Rotas salvas</ion-card-title>
          <ion-card-subtitle>Seus trajetos frequentes</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div v-if="favoriteRoutes.length">
            <div v-for="r in favoriteRoutes" :key="r.id" class="saved-row">
              <div>
                <strong>{{ r.name }}</strong>
                <div class="small">{{ r.origin }} → {{ r.destination }}</div>
              </div>
              <div class="saved-actions">
                <ion-button size="small" color="success" @click="goToMapWithRoute(r)">Usar</ion-button>
              </div>
            </div>
          </div>
          <p v-else class="empty-saved">Nenhuma rota salva. Salve rotas na tela de mapa.</p>
        </ion-card-content>
      </ion-card>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonToolbar
} from '@ionic/vue';
import { alertCircleOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();
const FAVORITES_KEY = 'walkalert-favorite-routes';
const favoriteRoutes = ref<Array<any>>([]);

const loadFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    favoriteRoutes.value = stored ? JSON.parse(stored) : [];
  } catch {
    favoriteRoutes.value = [];
  }
};

const goToMapWithRoute = (r: any) => {
  localStorage.setItem('walkalert-selected-route', JSON.stringify({ origin: r.origin, destination: r.destination }));
  router.push('/map');
};

const startNewRoute = () => {
  localStorage.removeItem('walkalert-selected-route');
  router.push('/map');
};

const emergencyAction = () => {
  alert('Ativando modo de emergência (placeholder).');
};

const logout = () => {
  localStorage.removeItem('walkalert-current-user');
};

onMounted(() => {
  loadFavorites();
});
</script>

<style scoped>
 .home-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
 }

.hero-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 26px;
  padding: 26px;
  box-shadow: 0 22px 48px rgba(31, 107, 62, 0.08);
}

.hero-card h1 { color: var(--ion-color-primary); margin: 0 0 8px 0 }
.hero-card p { margin: 0 0 12px 0 }
.hero-actions { display:flex; gap:12px }

.quick-card, .saved-card, .account-card { border-radius: 18px; border:1px solid var(--app-border); box-shadow: var(--app-shadow); }
.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  align-items: stretch;
}
.quick-grid ion-button,
.quick-button {
  width: 100%;
  min-width: 0;
  white-space: normal;
  --padding-start: 12px;
  --padding-end: 12px;
  --border-radius: 16px;
  --background: var(--ion-color-primary);
  --color: #ffffff;
  font-weight: 600;
}
.quick-button.secondary {
  --background: var(--ion-color-secondary);
}
.quick-button.warning {
  --background: var(--ion-color-warning);
}

@media (max-width: 420px) {
  .hero-card { padding: 16px }
  .quick-grid { gap: 8px }
  .home-page { gap: 12px }
}
.saved-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(0,0,0,0.04) }
.small { color:var(--ion-color-medium); font-size:0.95rem }
.empty-saved { color:var(--ion-color-medium) }

</style>
