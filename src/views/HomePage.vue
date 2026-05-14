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
        <p>Defina sua origem e destino para ver o tempo estimado e o caminho no mapa.</p>
        <ion-button expand="block" size="large" color="success" class="emergency-button">
          <ion-icon :icon="alertCircleOutline" slot="start"></ion-icon>
          Emergência
        </ion-button>
      </section>

      <ion-card class="route-card">
        <ion-card-header>
          <ion-card-title>Rota inteligente</ion-card-title>
          <ion-card-subtitle>Use sua localização atual ou digite os endereços.</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-item>
            <ion-label position="stacked">Origem</ion-label>
            <ion-input id="origin-input" v-model="origin" placeholder="Digite sua origem" />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Destino</ion-label>
            <ion-input id="destination-input" v-model="destination" placeholder="Digite seu destino" />
          </ion-item>

          <div class="route-actions">
            <ion-button expand="block" color="tertiary" @click="requestLocation">
              Usar minha localização
            </ion-button>
            <ion-button expand="block" color="success" @click="calculateRoute">
              Calcular rota
            </ion-button>
          </div>

          <div class="route-info" v-if="routeInfo">
            <p><strong>Tempo estimado:</strong> {{ routeInfo.duration }}</p>
            <p><strong>Distância:</strong> {{ routeInfo.distance }}</p>
            <p class="route-steps-label">Por onde passar:</p>
            <ol>
              <li v-for="(step, index) in routeInfo.steps" :key="index">{{ step }}</li>
            </ol>
          </div>
        </ion-card-content>
      </ion-card>

      <div class="map-wrapper">
        <div id="google-map" class="map"></div>
      </div>
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
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonToolbar
} from '@ionic/vue';
import { alertCircleOutline } from 'ionicons/icons';

interface RouteInfo {
  duration: string;
  distance: string;
  steps: string[];
}

const origin = ref('');
const destination = ref('');
const routeInfo = ref<RouteInfo | null>(null);
const map = ref<any>(null);
const directionsService = ref<any>(null);
const directionsRenderer = ref<any>(null);

const loadGoogleMaps = () => {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    const existing = document.getElementById('google-maps-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar Google Maps')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar Google Maps'));
    document.head.appendChild(script);
  });
};

const initMap = async () => {
  try {
    await loadGoogleMaps();
    const google = (window as any).google;

    map.value = new google.maps.Map(document.getElementById('google-map'), {
      center: { lat: -23.55052, lng: -46.633308 },
      zoom: 13,
      disableDefaultUI: true,
      gestureHandling: 'greedy'
    });

    directionsService.value = new google.maps.DirectionsService();
    directionsRenderer.value = new google.maps.DirectionsRenderer({
      map: map.value,
      polylineOptions: { strokeColor: '#1e7f34', strokeWeight: 6 }
    });

    const originInput = document.querySelector('#origin-input input') as HTMLInputElement | null;
    const destinationInput = document.querySelector('#destination-input input') as HTMLInputElement | null;

    if (originInput) {
      const autocompleteOrigin = new google.maps.places.Autocomplete(originInput);
      autocompleteOrigin.addListener('place_changed', () => {
        const place = autocompleteOrigin.getPlace();
        origin.value = place.formatted_address || origin.value;
      });
    }

    if (destinationInput) {
      const autocompleteDestination = new google.maps.places.Autocomplete(destinationInput);
      autocompleteDestination.addListener('place_changed', () => {
        const place = autocompleteDestination.getPlace();
        destination.value = place.formatted_address || destination.value;
      });
    }
  } catch (error) {
    console.error(error);
    alert('Não foi possível inicializar o mapa. Verifique sua conexão e a chave da API.');
  }
};

const requestLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocalização não suportada neste navegador.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async position => {
      origin.value = `${position.coords.latitude},${position.coords.longitude}`;
      if (!map.value) {
        await initMap();
      }
      const google = (window as any).google;
      const current = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map.value.setCenter(current);
      map.value.setZoom(14);
      new google.maps.Marker({ position: current, map: map.value, title: 'Você está aqui' });
    },
    () => {
      alert('Permissão de localização negada ou falha ao obter posição.');
    },
    { enableHighAccuracy: true }
  );
};

const calculateRoute = async () => {
  if (!origin.value || !destination.value) {
    alert('Informe origem e destino para traçar a rota.');
    return;
  }

  if (!directionsService.value || !directionsRenderer.value) {
    await initMap();
  }

  const google = (window as any).google;

  directionsService.value.route(
    {
      origin: origin.value,
      destination: destination.value,
      travelMode: google.maps.TravelMode.WALKING,
      provideRouteAlternatives: false
    },
    (result: any, status: string) => {
      if (status === 'OK') {
        directionsRenderer.value.setDirections(result);
        const route = result.routes[0].legs[0];
        routeInfo.value = {
          duration: route.duration.text,
          distance: route.distance.text,
          steps: route.steps.map((step: any) => step.instructions.replace(/<[^>]+>/g, ''))
        };
        map.value.fitBounds(result.routes[0].bounds);
      } else {
        alert('Não foi possível calcular a rota. Verifique os endereços digitados.');
      }
    }
  );
};

onMounted(() => {
  initMap();
});
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-card {
  background: linear-gradient(180deg, rgba(30, 127, 52, 0.18), rgba(255, 255, 255, 0.95));
  border: 1px solid var(--app-border);
  border-radius: 26px;
  padding: 26px;
  box-shadow: 0 22px 48px rgba(31, 107, 62, 0.08);
}

.hero-card h1 {
  margin-bottom: 12px;
  color: var(--ion-color-primary);
}

.hero-card p {
  margin-bottom: 18px;
  line-height: 1.75;
  color: var(--ion-text-color);
}

.emergency-button {
  font-weight: 700;
  border-radius: 16px;
}

.route-card {
  border-radius: 26px;
  border: 1px solid var(--app-border);
  box-shadow: 0 26px 60px rgba(31, 107, 62, 0.08);
  background: var(--app-surface);
}

.route-actions {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.route-info {
  margin-top: 18px;
  color: var(--ion-text-color);
}

.route-info p {
  margin: 0 0 8px;
}

.route-steps-label {
  margin-top: 12px;
  font-weight: 600;
}

.map-wrapper {
  position: relative;
  height: 420px;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid var(--app-border);
  box-shadow: 0 28px 60px rgba(31, 107, 62, 0.1);
}

.map {
  width: 100%;
  height: 100%;
}

ion-item {
  border-radius: 16px;
  --background: var(--app-surface-soft);
  margin-bottom: 12px;
}

ion-card-title {
  color: var(--ion-color-primary);
}

ion-card-subtitle {
  color: var(--ion-color-medium);
}
</style>
