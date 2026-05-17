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
          <ion-input
            :value="name"
            @ionInput="onNameInput"
            placeholder="Seu nome"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input
            :value="email"
            @ionInput="onEmailInput"
            type="email"
            placeholder="seu@exemplo.com"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Senha</ion-label>
          <ion-input
            :value="password"
            @ionInput="onPasswordInput"
            type="password"
            placeholder="Senha"
          />
        </ion-item>

        <ion-button expand="block" color="success" @click="register">
          Criar conta
        </ion-button>

        <ion-button expand="block" fill="clear" @click="goToLogin">
          Já tenho conta
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { auth, db } from '@/firebase'

import { createUserWithEmailAndPassword } from 'firebase/auth'

import { doc, setDoc } from 'firebase/firestore'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')

const onNameInput = (event: any) => {
  name.value = event.detail.value
}

const onEmailInput = (event: any) => {
  email.value = event.detail.value
}

const onPasswordInput = (event: any) => {
  password.value = event.detail.value
}

const register = async () => {

  try {

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    )

    alert('USUÁRIO CRIADO COM SUCESSO')

    const user = userCredential.user

    await setDoc(doc(db, 'users', user.uid), {
      name: name.value,
      email: email.value,
      createdAt: new Date()
    })

    

    router.push('/login')

  } catch (error: any) {

    console.log(error)

    alert(error.message)
  }
}

const goToLogin = () => {
  router.push('/login')
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