<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Registrar</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding auth-page">
      <div class="auth-card">
        <h2>Crie sua conta</h2>
        <p>Crie rapidamente uma conta para salvar rotas e segurança personalizada.</p>

        <ion-item>
          <ion-label position="stacked">Nome</ion-label>
          <ion-input v-model="name" placeholder="Seu nome" />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input v-model="email" type="email" placeholder="seu@exemplo.com" />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Senha</ion-label>
          <ion-input v-model="password" type="password" placeholder="Senha" />
        </ion-item>

        <ion-button expand="block" color="success" @click="register">Criar conta</ion-button>
        <ion-button expand="block" fill="clear" @click="goToLogin">Já tenho conta</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');

const register = () => {
  const userName = name.value.trim() || 'Usuário';
  const userEmail = email.value.trim() || 'email@exemplo.com';
  const userPassword = password.value.trim() || 'senha';

  const usersRaw = localStorage.getItem('walkalert-users');
  const users = usersRaw ? JSON.parse(usersRaw) : [];
  users.push({ id: Date.now(), name: userName, email: userEmail });
  localStorage.setItem('walkalert-users', JSON.stringify(users));

  localStorage.setItem('walkalert-current-user', JSON.stringify({ name: userName, email: userEmail }));
  localStorage.setItem('walkalert-user-password', userPassword);
  router.push('/profile-info');
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 94px);
}

.auth-card {
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 28px 24px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 26px 68px rgba(26, 87, 41, 0.1);
  backdrop-filter: blur(16px);
}

.auth-card h2 {
  margin: 0 0 10px;
  color: var(--ion-color-primary);
}

.auth-card p {
  margin: 0 0 22px;
  color: var(--ion-text-color);
  line-height: 1.7;
}

ion-item {
  border-radius: 18px;
  margin-bottom: 14px;
  --background: rgba(247, 249, 251, 0.95);
  border: 1px solid var(--app-border);
}

ion-button {
  margin-top: 12px;
  border-radius: 16px;
}
</style>