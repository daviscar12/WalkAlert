<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Configurações</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding settings-page">
      <div class="settings-intro">
        <h2>Informações de segurança</h2>
        <p>Preencha os dados de contato para que seus familiares sejam avisados de qualquer emergência.</p>
      </div>

      <ion-list>
        <ion-item>
          <ion-label position="stacked">Nome completo</ion-label>
          <ion-input v-model="form.name" placeholder="Seu nome"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Telefone</ion-label>
          <ion-input type="tel" v-model="form.phone" placeholder="(00) 00000-0000"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Nome do parente</ion-label>
          <ion-input v-model="form.relativeName" placeholder="Nome do pai, mãe ou responsável"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Contato de emergência</ion-label>
          <ion-input type="tel" v-model="form.relativeContact" placeholder="Telefone do parente"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">E-mail</ion-label>
          <ion-input type="email" v-model="form.email" placeholder="email@exemplo.com"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Alergia</ion-label>
          <ion-toggle slot="end" v-model="form.allergy"></ion-toggle>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Observações</ion-label>
          <ion-textarea v-model="form.notes" placeholder="Informe alergias, instruções ou informações extras"></ion-textarea>
        </ion-item>
      </ion-list>

      <ion-button expand="block" color="success" @click="saveSettings">
        Salvar informações
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonToggle
} from '@ionic/vue';

const PROFILE_KEY = 'walkalert-profile';
const form = reactive({
  name: '',
  phone: '',
  relativeName: '',
  relativeContact: '',
  email: '',
  allergy: false,
  notes: ''
});

const loadProfile = () => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      const profile = JSON.parse(stored);
      form.name = profile.name || '';
      form.phone = profile.phone || '';
      form.relativeName = profile.relativeName || '';
      form.relativeContact = profile.relativeContact || '';
      form.email = profile.email || '';
      form.allergy = !!profile.allergy;
      form.notes = profile.notes || '';
    }
  } catch {
    // ignore
  }
};

function saveSettings() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...form }));
  alert('Perfil salvo com sucesso.');
}

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: calc(100vh - 94px);
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
}

.settings-intro {
  margin-bottom: 18px;
}

.settings-intro h2 {
  margin-bottom: 8px;
  color: var(--ion-color-primary);
}

.settings-intro p {
  line-height: 1.75;
  color: var(--ion-text-color);
}

.settings-page ion-item {
  border-radius: 18px;
  margin-bottom: 14px;
  --background: var(--app-surface);
  border: 1px solid var(--app-border);
  box-shadow: var(--app-shadow);
}

..settings-page ion-button {
  margin-top: 8px;
  margin-bottom: 18px;
  border-radius: 16px;
}
</style>
