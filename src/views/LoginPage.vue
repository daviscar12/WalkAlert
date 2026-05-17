<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Entrar</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding auth-page">
      <div class="auth-card">
        <h2>Bem-vindo de volta</h2>
        <p>Entre para acessar suas rotas salvas e seus recursos de segurança.</p>

        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input
            v-model="email"
            type="email"
            placeholder="seu@exemplo.com"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Senha</ion-label>
          <ion-input
            v-model="password"
            type="password"
            placeholder="Senha"
          />
        </ion-item>

        <ion-button expand="block" color="success" @click="login">
          Continuar
        </ion-button>

        <ion-button expand="block" fill="clear" @click="goToRegister">
          Criar conta
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton
} from '@ionic/vue'

import { auth } from '@/firebase'

import { signInWithEmailAndPassword } from 'firebase/auth'

const router = useRouter()

const email = ref('')
const password = ref('')

const login = async () => {

  try {

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    )

    const user = userCredential.user

    console.log('Usuário logado:', user)

    alert('Login realizado com sucesso!')

    router.push('/profile-info')

  } catch (error: any) {

    console.log(error)

    if (error.code === 'auth/invalid-email') {
      alert('Email inválido!')
    }

    else if (error.code === 'auth/user-not-found') {
      alert('Usuário não encontrado!')
    }

    else if (error.code === 'auth/wrong-password') {
      alert('Senha incorreta!')
    }

    else if (error.code === 'auth/invalid-credential') {
      alert('Email ou senha incorretos!')
    }

    else {
      alert(error.message)
    }
  }
}

const goToRegister = () => {
  router.push('/register')
}
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
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  box-shadow: 0 26px 68px rgba(0, 0, 0, 0.16);
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
  --background: var(--app-surface);
  border: 1px solid var(--app-border);
}

ion-item,
ion-input,
ion-label,
.auth-card p {
  color: var(--ion-text-color);
}

ion-button {
  margin-top: 12px;
  border-radius: 16px;
}
</style>