<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Perfil de Segurança</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding profile-page">
      <div class="profile-card">
        <h2>Complete seu perfil</h2>
        <p>Adicione os dados que vão ajudar sua família a entrar em contato em caso de emergência.</p>

        <ion-item>
          <ion-label position="stacked">Seu nome</ion-label>
          <ion-input v-model="profile.name" placeholder="Nome completo"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Número</ion-label>
          <ion-input v-model="profile.phone" type="tel" placeholder="(00) 00000-0000"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Parente / responsável</ion-label>
          <ion-input v-model="profile.relativeName" placeholder="Nome do pai, mãe ou parente"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Contato de emergência</ion-label>
          <ion-input v-model="profile.relativeContact" type="tel" placeholder="Telefone do parente"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Alergia</ion-label>
          <ion-toggle slot="end" v-model="profile.allergy"></ion-toggle>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Observações</ion-label>
          <ion-textarea v-model="profile.notes" placeholder="Ex: alergia a penicilina, pressão alta"></ion-textarea>
        </ion-item>

        <div class="save-button-wrapper">
          <ion-button expand="block" color="success" @click="saveProfile">
            Salvar informações
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonToggle
} from '@ionic/vue';

const router = useRouter();
const PROFILE_KEY = 'walkalert-profile';

const profile = reactive({
  name: '',
  phone: '',
  relativeName: '',
  relativeContact: '',
  allergy: false,
  notes: ''
});

const loadProfile = () => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      profile.name = stored.name || '';
      profile.phone = stored.phone || '';
      profile.relativeName = stored.relativeName || '';
      profile.relativeContact = stored.relativeContact || '';
      profile.allergy = !!stored.allergy;
      profile.notes = stored.notes || '';
    }
  } catch (err) {
    console.warn('Falha ao carregar perfil', err);
  }
};

const saveProfile = () => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  router.push('/settings');
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 94px);
  padding: 24px 16px 220px !important;
}

.profile-card {
  width: min(100%, 520px);
  margin: 0 auto 40px;
  padding: 26px 22px 44px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 26px 68px rgba(26, 87, 41, 0.1);
  backdrop-filter: blur(16px);
}

.profile-card h2 {
  margin: 0 0 10px;
  color: var(--ion-color-primary);
}

.profile-card p {
  margin: 0 0 18px;
  color: var(--ion-text-color);
  line-height: 1.7;
}

ion-item {
  border-radius: 18px;
  margin-bottom: 18px;
  --background: rgba(247, 249, 251, 0.96);
  border: 1px solid var(--app-border);
}

ion-button {
  margin-top: 12px;
  border-radius: 16px;
}

.save-button-wrapper {
  position: relative;
  padding-top: 24px;
  margin-bottom: 14px;
}

ion-content.profile-page {
  padding-bottom: 240px !important;
}
</style>
