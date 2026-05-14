<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mapa</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding map-page">
      <div class="map-preview">
        <div class="map-card">
          <h2>Mapa WalkAlert</h2>
          <p>Este espaço será usado para mostrar o Google Maps e a rota em tempo real.</p>
          <p>Quando integrado, o app poderá rastrear sua caminhada e avisar familiares caso você saia do percurso.</p>
        </div>
      </div>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Status da rota</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Sem rota ativa no momento. Vá para a tela inicial para iniciar uma rota segura.</p>
        </ion-card-content>
      </ion-card>

      <ion-button expand="block" color="success" router-link="/home">
        Voltar para Home
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: calc(100vh - 94px);
}

.map-preview {
  padding: 12px;
}

.map-card {
  background: var(--app-surface-soft);
  border: 1px solid var(--app-border);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--app-shadow);
}

.map-card h2 {
  margin-bottom: 10px;
  color: var(--ion-color-primary);
}

.map-card p {
  line-height: 1.75;
  color: var(--ion-text-color);
}

ion-card {
  border-radius: 22px;
  box-shadow: var(--app-shadow);
  border: 1px solid var(--app-border);
  --background: var(--app-surface);
}

ion-button {
  border-radius: 16px;
}
</style>
