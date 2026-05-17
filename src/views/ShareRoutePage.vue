<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Compartilhar rota</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding share-route-page">
      <ion-segment v-model="mode" value="share">
        <ion-segment-button value="share">Compartilhar</ion-segment-button>
        <ion-segment-button value="watch">Acompanhar</ion-segment-button>
      </ion-segment>

      <div class="section-card">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              {{ mode === 'share' ? 'Envie sua rota' : 'Acompanhe outra pessoa' }}
            </ion-card-title>
            <ion-card-subtitle>
              {{ mode === 'share'
                ? 'Crie um código de compartilhamento e acompanhe sua localização em tempo real.'
                : 'Insira o código recebido para ver a rota e o status em tempo real.' }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <div v-if="mode === 'share'">
              <ion-item>
                <ion-label position="stacked">Nome da rota</ion-label>
                <ion-input v-model="routeName" placeholder="Casa → Trabalho" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Origem</ion-label>
                <ion-input v-model="routeOrigin" placeholder="Digite o endereço de partida" />
              </ion-item>
              <ion-item>
                <ion-label position="stacked">Destino</ion-label>
                <ion-input v-model="routeDestination" placeholder="Digite o endereço de chegada" />
              </ion-item>

              <ion-button expand="block" color="success" @click="createShareSession">
                {{ shareCode ? 'Atualizar compartilhamento' : 'Gerar código de compartilhamento' }}
              </ion-button>

              <div v-if="shareCode" class="share-code-card">
                <div class="share-code-row">
                  <p><strong>Código:</strong> {{ shareCode }}</p>
                  <ion-button size="small" fill="outline" color="secondary" @click="copyShareCode">
                    <span class="material-symbols-outlined">content_copy</span>
                    Copiar código
                  </ion-button>
                </div>
                <p>Envie este código para a pessoa que irá acompanhar sua rota.</p>
                <ion-button expand="block" color="danger" @click="toggleProblemSignal">
                  <span class="material-symbols-outlined">warning</span>
                  {{ problemSignal ? 'Sinalização de problema enviada' : 'Sinalizar problema' }}
                </ion-button>
              </div>

              <div class="session-status" v-if="shareCode">
                <p><strong>Status:</strong> {{ shareStatus }}</p>
                <p><strong>Última atualização:</strong> {{ lastUpdateLabel }}</p>
                <p><strong>Fora da rota:</strong> {{ outOfRoute ? 'Sim' : 'Não' }}</p>
              </div>
            </div>

            <div v-else>
              <ion-item>
                <ion-label position="stacked">Código de compartilhamento</ion-label>
                <ion-input v-model="watchCode" placeholder="Cole o código recebido" />
              </ion-item>
              <ion-button expand="block" color="primary" @click="startWatching">
                Acompanhar agora
              </ion-button>

              <div v-if="watching && watchedRoute">
                <p><strong>Rota:</strong> {{ watchedRoute.routeName || 'Rota compartilhada' }}</p>
                <p><strong>Responsável:</strong> {{ watchedRoute.ownerName || 'Usuário' }}</p>
                <p><strong>Status:</strong> {{ watchedRoute.status }}</p>
                <p><strong>Problema:</strong> {{ watchedRoute.problem ? 'Sim' : 'Não' }}</p>
                <p><strong>Fora da rota:</strong> {{ watchedRoute.outOfRoute ? 'Sim' : 'Não' }}</p>
                <p><strong>Última posição:</strong> {{ watchedLocationLabel }}</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <div class="map-card">
        <div id="share-map"></div>
      </div>

      <ion-card class="info-card" v-if="shareCode || watching">
        <ion-card-header>
          <ion-card-title>Informações em tempo real</ion-card-title>
          <ion-card-subtitle>O que está acontecendo agora</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <p>{{ liveMessage }}</p>
        </ion-card-content>
      </ion-card>
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
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar
} from '@ionic/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import * as L from 'leaflet'
import { auth, db } from '@/firebase'
import { type User } from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore'

interface GeoPoint {
  lat: number
  lng: number
}

interface SharedRouteDocument {
  ownerId: string
  ownerName: string
  routeName: string
  origin: string
  destination: string
  routeCoords: GeoPoint[]
  currentLocation: GeoPoint | null
  status: string
  problem: boolean
  outOfRoute: boolean
  active: boolean
  updatedAt: any
}

const mode = ref<'share' | 'watch'>('share')
const currentUser = ref<User | null>(null)
const routeName = ref('')
const routeOrigin = ref('')
const routeDestination = ref('')
const shareCode = ref('')
const watchCode = ref('')
const shareStatus = ref('Aguardando geração de código')
const lastUpdate = ref<Date | null>(null)
const outOfRoute = ref(false)
const problemSignal = ref(false)
const watching = ref(false)
const watchedRoute = ref<SharedRouteDocument | null>(null)
const shareCodeDocRef = ref<any>(null)
const currentLocation = ref<GeoPoint | null>(null)
const routeCoords = ref<GeoPoint[]>([])
const watchId = ref<number | null>(null)
const snapshotUnsubscribe = ref<(() => void) | null>(null)
const mapInstance = ref<any>(null)
const routeLayer = ref<any>(null)
const originMarker = ref<any>(null)
const destinationMarker = ref<any>(null)
const currentMarker = ref<any>(null)
const partnerMarker = ref<any>(null)

const sharedRoutesCollection = collection(db, 'sharedRoutes')

const initMap = () => {
  mapInstance.value = L.map('share-map', { zoomControl: true }).setView([-23.55052, -46.633308], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(mapInstance.value)
}

const setMapBounds = (points: GeoPoint[]) => {
  if (!mapInstance.value || !points.length) return
  const bounds = L.latLngBounds(points.map((p) => L.latLng(p.lat, p.lng)))
  mapInstance.value.fitBounds(bounds, { padding: [30, 30] })
}

const showRouteOnMap = (points: GeoPoint[]) => {
  if (!mapInstance.value) return
  routeLayer.value?.remove()
  routeLayer.value = L.polyline(points.map((p) => [p.lat, p.lng]), { color: '#0f9d58', weight: 5, opacity: 0.85 }).addTo(mapInstance.value)
}

const setMarker = (markerRef: { value: any }, point: GeoPoint | null, iconColor = '#3880ff') => {
  if (!mapInstance.value) return
  markerRef.value?.remove()
  if (!point) return
  markerRef.value = L.marker([point.lat, point.lng], {
    icon: L.divIcon({
      className: 'share-marker',
      html: `<div class="marker-icon" style="background:${iconColor}"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })
  }).addTo(mapInstance.value)
}

const geocodeAddress = async (address: string) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
  const data = await response.json()
  if (!data || data.length === 0) {
    throw new Error('Endereço não encontrado')
  }
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}

const fetchRouteLine = async (start: GeoPoint, end: GeoPoint) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    const response = await fetch(url)
    const data = await response.json()
    if (data?.routes?.length && data.routes[0].geometry?.coordinates) {
      return data.routes[0].geometry.coordinates.map((coord: any) => ({ lat: coord[1], lng: coord[0] }))
    }
  } catch (error) {
    console.warn('Falha ao buscar rota geo', error)
  }
  return [start, end]
}

const toMeters = (value: number) => value * 111320

const pointSegmentDistance = (point: GeoPoint, a: GeoPoint, b: GeoPoint) => {
  const A = { x: toMeters(point.lng - a.lng) * Math.cos(point.lat * Math.PI / 180), y: toMeters(point.lat - a.lat) }
  const B = { x: toMeters(b.lng - a.lng) * Math.cos(point.lat * Math.PI / 180), y: toMeters(b.lat - a.lat) }
  const P = { x: 0, y: 0 }
  const AB = { x: B.x - A.x, y: B.y - A.y }
  const t = Math.max(0, Math.min(1, (P.x - A.x) * AB.x + (P.y - A.y) * AB.y) / (AB.x * AB.x + AB.y * AB.y || 1))
  const closest = { x: A.x + AB.x * t, y: A.y + AB.y * t }
  return Math.sqrt((P.x - closest.x) ** 2 + (P.y - closest.y) ** 2)
}

const calculateRouteDistanceFromPoint = (point: GeoPoint, path: GeoPoint[]) => {
  if (!path.length) return Infinity
  let minDistance = Infinity
  for (let i = 0; i + 1 < path.length; i += 1) {
    const segmentDistance = pointSegmentDistance(point, path[i], path[i + 1])
    minDistance = Math.min(minDistance, segmentDistance)
  }
  return minDistance
}

const createShareSession = async () => {
  if (!currentUser.value) {
    alert('Você precisa estar logado para compartilhar a rota.')
    return
  }
  if (!routeOrigin.value.trim() || !routeDestination.value.trim()) {
    alert('Informe origem e destino para compartilhar a rota.')
    return
  }

  shareStatus.value = 'Preparando rota...'

  try {
    const originCoords = await geocodeAddress(routeOrigin.value)
    const destinationCoords = await geocodeAddress(routeDestination.value)
    routeCoords.value = await fetchRouteLine(originCoords, destinationCoords)
    showRouteOnMap(routeCoords.value)
    setMarker(originMarker, originCoords, '#10dc60')
    setMarker(destinationMarker, destinationCoords, '#3880ff')
    setMapBounds(routeCoords.value)

    const docRef = shareCode.value
      ? doc(sharedRoutesCollection, shareCode.value)
      : doc(sharedRoutesCollection)

    shareCodeDocRef.value = docRef
    shareCode.value = shareCode.value || docRef.id

    await setDoc(docRef, {
      ownerId: currentUser.value.uid,
      ownerName: currentUser.value.email ?? 'Usuário',
      routeName: routeName.value || 'Rota compartilhada',
      origin: routeOrigin.value,
      destination: routeDestination.value,
      routeCoords: routeCoords.value,
      currentLocation: null,
      status: 'Aguardando localização',
      problem: false,
      outOfRoute: false,
      active: true,
      updatedAt: serverTimestamp()
    })

    shareStatus.value = 'Código gerado. Aguardando envio da localização.'
    problemSignal.value = false
    startPositionWatch()
  } catch (error: any) {
    console.error(error)
    shareStatus.value = 'Erro ao criar compartilhamento'
    alert(error.message || 'Não foi possível criar o compartilhamento.')
  }
}

const startPositionWatch = () => {
  if (!navigator.geolocation) {
    alert('Geolocalização não suportada neste dispositivo.')
    return
  }
  if (!shareCodeDocRef.value) return

  if (watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value)
    watchId.value = null
  }

  watchId.value = navigator.geolocation.watchPosition(
    async (position) => {
      const latestLocation: GeoPoint = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      currentLocation.value = latestLocation
      setMarker(currentMarker, latestLocation, '#ff3860')
      setMapBounds([...(routeCoords.value.length ? routeCoords.value : []), latestLocation])

      if (routeCoords.value.length) {
        const distance = calculateRouteDistanceFromPoint(latestLocation, routeCoords.value)
        outOfRoute.value = distance > 80
      }

      shareStatus.value = outOfRoute.value ? 'Fora da rota' : 'No trajeto'
      lastUpdate.value = new Date()

      const updatePayload: any = {
        currentLocation: latestLocation,
        outOfRoute: outOfRoute.value,
        status: shareStatus.value,
        updatedAt: serverTimestamp(),
        problem: problemSignal.value
      }
      if (routeCoords.value.length) {
        updatePayload.routeCoords = routeCoords.value
      }

      try {
        await updateDoc(shareCodeDocRef.value, updatePayload)
      } catch (err) {
        console.error('Erro ao atualizar localização', err)
      }
    },
    (err) => {
      console.error('Erro geolocation', err)
      shareStatus.value = 'Não foi possível obter localização em tempo real.'
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  )
}

const toggleProblemSignal = async () => {
  if (!shareCodeDocRef.value) {
    alert('Gere primeiro o código de compartilhamento antes de sinalizar um problema.')
    return
  }
  problemSignal.value = true
  shareStatus.value = 'Problema sinalizado'
  lastUpdate.value = new Date()
  try {
    await updateDoc(shareCodeDocRef.value, {
      problem: true,
      status: 'Problema sinalizado',
      updatedAt: serverTimestamp()
    })
    alert('Sinalização de problema enviada para o acompanhante.')
  } catch (error) {
    console.error(error)
    alert('Falha ao enviar sinalização de problema.')
  }
}

const copyShareCode = async () => {
  if (!shareCode.value) return
  try {
    await navigator.clipboard.writeText(shareCode.value)
    alert('Código copiado para a área de transferência!')
  } catch (error) {
    console.error('Erro ao copiar código', error)
    alert('Não foi possível copiar o código automaticamente. Copie manualmente.')
  }
}

const startWatching = async () => {
  if (!watchCode.value.trim()) {
    alert('Informe o código de compartilhamento para acompanhar a rota.')
    return
  }
  watching.value = false
  watchedRoute.value = null

  const docRef = doc(sharedRoutesCollection, watchCode.value.trim())
  const snap = await getDoc(docRef)
  if (!snap.exists()) {
    alert('Código não encontrado ou compartilhamento inválido.')
    return
  }

  if (snapshotUnsubscribe.value) {
    snapshotUnsubscribe.value()
    snapshotUnsubscribe.value = null
  }

  snapshotUnsubscribe.value = onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) return
    const data = docSnap.data() as SharedRouteDocument
    watchedRoute.value = data
    watching.value = true
    if (data.currentLocation) {
      setMarker(partnerMarker, data.currentLocation, '#ff8c00')
    }
    if (data.routeCoords?.length) {
      showRouteOnMap(data.routeCoords)
      setMarker(originMarker, data.routeCoords[0], '#10dc60')
      setMarker(destinationMarker, data.routeCoords[data.routeCoords.length - 1], '#3880ff')
      setMapBounds([...data.routeCoords, data.currentLocation ?? data.routeCoords[data.routeCoords.length - 1]])
    }
  })
}

const formatDateTime = (value: Date | null) => {
  if (!value) return 'Nunca'
  return value.toLocaleString('pt-BR', { hour12: false })
}

const lastUpdateLabel = computed(() => formatDateTime(lastUpdate.value))
const watchedLocationLabel = computed(() => {
  if (!watchedRoute.value?.currentLocation) return 'Nenhuma posição recebida ainda'
  return `${watchedRoute.value.currentLocation.lat.toFixed(5)}, ${watchedRoute.value.currentLocation.lng.toFixed(5)}`
})
const liveMessage = computed(() => {
  if (mode.value === 'share') {
    if (!shareCode.value) return 'Gere um código de compartilhamento para começar.'
    return `Compartilhamento ativo. Código: ${shareCode.value}. ${shareStatus.value}`
  }
  if (watching.value && watchedRoute.value) {
    return `Acompanhando ${watchedRoute.value.ownerName}. ${watchedRoute.value.status}. Fora da rota: ${watchedRoute.value.outOfRoute ? 'Sim' : 'Não'}`
  }
  return 'Informe um código para acompanhar a rota compartilhada.'
})

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    currentUser.value = user
  })
  initMap()
})

onUnmounted(() => {
  if (watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value)
  }
  if (snapshotUnsubscribe.value) {
    snapshotUnsubscribe.value()
  }
})
</script>

<style scoped>
.share-route-page {
  display: grid;
  gap: 16px;
}

.section-card,
.map-card,
.info-card {
  border-radius: 20px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.08);
}

#share-map {
  width: 100%;
  min-height: 380px;
  border-radius: 20px;
  overflow: hidden;
}

.share-code-card,
.session-status {
  margin-top: 16px;
}

.share-code-card p,
.session-status p {
  margin: 8px 0;
}

.marker-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
}

.share-code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

ion-segment {
  margin-bottom: 12px;
}

ion-button {
  margin-top: 12px;
}
</style>
