<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mapa WalkAlert</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding map-page">
      <section class="hero-card">
        <div class="hero-copy">
          <div class="hero-tag">
            <span class="material-symbols-outlined">shield</span>
            Caminhada mais segura
          </div>
          <h2>Rota segura em destaque</h2>
          <p>Visualize o percurso planejado, sua posição atual e os pontos de segurança no mapa.</p>
        </div>

        <ion-button expand="block" color="success" @click="locateUser">
          <span class="material-symbols-outlined">my_location</span>
          Localizar meu trajeto
        </ion-button>
      </section>

      <ion-card class="save-card">
        <ion-card-header>
          <ion-card-title>
            <span class="material-symbols-outlined">bookmark</span>
            Rotas frequentes
          </ion-card-title>
          <ion-card-subtitle>Salve trajetos que você faz todo dia e acesse sem digitar.</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <div class="route-fields">
            <ion-item>
              <ion-label position="stacked">Nome da rota</ion-label>
              <ion-input v-model="routeName" placeholder="Casa → Trabalho" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Origem</ion-label>
              <ion-input v-model="routeOrigin" placeholder="Rua México, 100" @ionInput="onOriginInput" />
            </ion-item>
            <div class="suggestions" v-if="originSuggestions.length">
              <div class="suggestion" v-for="s in originSuggestions" :key="s.place_id" @click="selectOriginSuggestion(s)">
                {{ s.display_name }}
              </div>
            </div>

            <ion-item>
              <ion-label position="stacked">Destino</ion-label>
              <ion-input v-model="routeDestination" placeholder="Parque Central" @ionInput="onDestInput" />
            </ion-item>
            <div class="suggestions" v-if="destSuggestions.length">
              <div class="suggestion" v-for="s in destSuggestions" :key="s.place_id" @click="selectDestSuggestion(s)">
                {{ s.display_name }}
              </div>
            </div>
          </div>

          <div class="save-actions">
            <ion-button expand="block" color="success" @click="saveFavoriteRoute">
              <span class="material-symbols-outlined">save</span>
              Salvar rota
            </ion-button>
          </div>

          <div class="saved-list" v-if="favoriteRoutes.length">
            <div
              v-for="route in favoriteRoutes"
              :key="route.id"
              class="saved-route-card"
              :class="{ selected: route.id === selectedRouteId }"
            >
              <div class="saved-route-copy">
                <strong>{{ route.name }}</strong>
              </div>
              <ion-button size="small" fill="outline" color="success" @click="applyRoute(route)">
                <span class="material-symbols-outlined">keyboard_double_arrow_right</span>
                Usar rota
              </ion-button>
              <ion-button size="small" fill="clear" color="danger" @click="deleteFavoriteRoute(route.id)">
                <span class="material-symbols-outlined">delete</span>
              </ion-button>
            </div>
          </div>

          <p class="empty-saved" v-else>
            Nenhuma rota salva ainda. Adicione uma rota que você usa sempre.
          </p>
        </ion-card-content>
      </ion-card>

      <div class="map-card">
        <div id="map"></div>
      </div>

      <ion-button expand="block" color="primary" class="route-button" @click="calculateRoute">
        <span class="material-symbols-outlined">directions</span>
        Traçar rota
      </ion-button>

      <ion-button expand="block" color="secondary" class="route-button" router-link="/share-route">
        <span class="material-symbols-outlined">share_location</span>
        Compartilhar rota
      </ion-button>

      <ion-card class="status-card">
        <ion-card-header>
          <ion-card-title>Status da rota</ion-card-title>
          <ion-card-subtitle>{{ routeStatus }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="status-grid">
            <div>
              <span class="status-label">Distância</span>
              <strong><span class="material-symbols-outlined">directions_walk</span>{{ routeDistance }}</strong>
            </div>
            <div>
              <span class="status-label">Tempo</span>
              <strong><span class="material-symbols-outlined">schedule</span>{{ routeDuration }}</strong>
            </div>
          </div>
          <p class="status-note">
            <span class="material-symbols-outlined">notifications_active</span>
            Se você sair do trajeto, o WalkAlert estará pronto para avisar sua família.
          </p>
          <!-- não exibimos todos os passos detalhados por padrão -->
        </ion-card-content>
      </ion-card>

      <ion-button expand="block" color="success" router-link="/home">
        <span class="material-symbols-outlined">arrow_back</span>
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
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonToolbar
} from '@ionic/vue';
import { onMounted, ref } from 'vue';
import * as L from 'leaflet';

interface FavoriteRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
}

const routeName = ref('');
const routeOrigin = ref('');
const routeDestination = ref('');
const favoriteRoutes = ref<FavoriteRoute[]>([]);
const selectedRouteId = ref<string | null>(null);
const routeStatus = ref('Nenhuma rota traçada');
const routeDistance = ref('—');
const routeDuration = ref('—');
const routeSteps = ref<string[]>([]);
const mapInstance = ref<any>(null);
const FAVORITES_KEY = 'walkalert-favorite-routes';

// Autocomplete / suggestions
const originSuggestions = ref<Array<any>>([]);
const destSuggestions = ref<Array<any>>([]);
let originTimer: any = null;
let destTimer: any = null;
const originCoords = ref<{ lat: number; lng: number } | null>(null);
const destCoords = ref<{ lat: number; lng: number } | null>(null);

const routeLayer = ref<L.GeoJSON | null>(null);
const originMarker = ref<L.Marker | null>(null);
const destinationMarker = ref<L.Marker | null>(null);
const currentMarker = ref<L.Marker | null>(null);

const initMap = () => {
  mapInstance.value = L.map('map', {
    zoomControl: true
  }).setView([-23.55052, -46.633308], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  }).addTo(mapInstance.value);
};

const geocodeAddress = async (address: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
  );
  const data = await response.json();
  if (!data || data.length === 0) {
    throw new Error(`Endereço não encontrado: ${address}`);
  }
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    display_name: data[0].display_name
  };
};

const fetchSuggestions = async (q: string, useBounds = true) => {
  if (!q || q.trim().length < 2) return [];
  // Nominatim: prefer results inside current map bounds when available to improve precision
  let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1&accept-language=pt-BR`;
  try {
    if (useBounds && mapInstance.value) {
      const bounds = mapInstance.value.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      // viewbox expects: west,south,east,north
      const viewbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
      url += `&viewbox=${encodeURIComponent(viewbox)}&bounded=1`;
    }
  } catch (err) {
    // ignore bounding when map isn't ready or bounds fail
  }

  const resp = await fetch(url);
  const items = await resp.json();
  return items;
};

const onOriginInput = async (ev: any) => {
  const v = ev?.detail?.value ?? ev?.target?.value ?? '';
  routeOrigin.value = v;
  originCoords.value = null; // reset if user edits
  clearTimeout(originTimer);
  originTimer = setTimeout(async () => {
    originSuggestions.value = await fetchSuggestions(v, true);
  }, 350);
};

const onDestInput = async (ev: any) => {
  const v = ev?.detail?.value ?? ev?.target?.value ?? '';
  routeDestination.value = v;
  destCoords.value = null;
  clearTimeout(destTimer);
  destTimer = setTimeout(async () => {
    destSuggestions.value = await fetchSuggestions(v, true);
  }, 350);
};

const selectOriginSuggestion = (s: any) => {
  routeOrigin.value = s.display_name;
  originCoords.value = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) };
  originSuggestions.value = [];
};

const selectDestSuggestion = (s: any) => {
  routeDestination.value = s.display_name;
  destCoords.value = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) };
  destSuggestions.value = [];
};

const fetchRoute = async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
  const url = `https://router.project-osrm.org/route/v1/foot/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data || data.code !== 'Ok' || !data.routes?.length) {
    throw new Error('Não foi possível obter a rota.');
  }
  return data.routes[0];
};

const clearRoute = () => {
  if (routeLayer.value) {
    mapInstance.value.removeLayer(routeLayer.value);
    routeLayer.value = null;
  }
  if (originMarker.value) {
    mapInstance.value.removeLayer(originMarker.value);
    originMarker.value = null;
  }
  if (destinationMarker.value) {
    mapInstance.value.removeLayer(destinationMarker.value);
    destinationMarker.value = null;
  }
};

const loadFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      favoriteRoutes.value = JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Falha ao carregar rotas salvas', error);
  }
};

const storeFavorites = () => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteRoutes.value));
};

const saveFavoriteRoute = () => {
  if (!routeName.value.trim() || !routeOrigin.value.trim() || !routeDestination.value.trim()) {
    alert('Preencha nome, origem e destino para salvar a rota.');
    return;
  }

  const newRoute: FavoriteRoute = {
    id: String(Date.now()),
    name: routeName.value.trim(),
    origin: routeOrigin.value.trim(),
    destination: routeDestination.value.trim()
  };

  favoriteRoutes.value.unshift(newRoute);
  storeFavorites();
  selectedRouteId.value = newRoute.id;
  routeStatus.value = `Rota "${newRoute.name}" salva e selecionada`;
  routeDistance.value = '—';
  routeDuration.value = '—';
  routeSteps.value = [];
  routeName.value = '';
  routeOrigin.value = '';
  routeDestination.value = '';
};

const applyRoute = async (route: FavoriteRoute) => {
  selectedRouteId.value = route.id;
  routeOrigin.value = route.origin;
  routeDestination.value = route.destination;
  routeStatus.value = `Rota "${route.name}" selecionada`;
  await calculateRoute();
};

const deleteFavoriteRoute = (id: string) => {
  favoriteRoutes.value = favoriteRoutes.value.filter(r => r.id !== id);
  storeFavorites();
  if (selectedRouteId.value === id) selectedRouteId.value = null;
};

const calculateRoute = async () => {
  if (!routeOrigin.value.trim() || !routeDestination.value.trim()) {
    alert('Informe origem e destino para traçar a rota.');
    return;
  }

  try {
    const originGeo = originCoords.value ? { lat: originCoords.value.lat, lng: originCoords.value.lng, display_name: routeOrigin.value } : await geocodeAddress(routeOrigin.value);
    const destinationGeo = destCoords.value ? { lat: destCoords.value.lat, lng: destCoords.value.lng, display_name: routeDestination.value } : await geocodeAddress(routeDestination.value);
  const route = await fetchRoute(originGeo, destinationGeo);
    // limpar sugestões
    originSuggestions.value = [];
    destSuggestions.value = [];
    clearRoute();
    originMarker.value = L.marker([originGeo.lat, originGeo.lng]).addTo(mapInstance.value).bindPopup('Origem').openPopup();
    destinationMarker.value = L.marker([destinationGeo.lat, destinationGeo.lng])
      .addTo(mapInstance.value)
      .bindPopup('Destino')
      .openPopup();

    const geoJsonLayer = L.geoJSON(route.geometry, {
      style: {
        color: '#1e7f34',
        weight: 6,
        opacity: 0.9
      }
    }).addTo(mapInstance.value);

    routeLayer.value = geoJsonLayer;
    mapInstance.value.fitBounds(geoJsonLayer.getBounds(), { padding: [24, 24] });
    routeDistance.value = `${(route.distance / 1000).toFixed(1)} km`;
    routeDuration.value = formatDuration(route.duration);
    routeSteps.value = route.legs[0].steps.map((step: any) => {
      const modifier = step.maneuver.modifier ? `${step.maneuver.modifier} ` : '';
      const name = step.name ? `em ${step.name}` : '';
      return `${step.maneuver.type} ${modifier}${name}`.trim();
    });
    routeStatus.value = `${originGeo.display_name} → ${destinationGeo.display_name}`;
  } catch (error) {
    console.error(error);
    alert('Não foi possível traçar a rota. Verifique origem e destino.');
  }
};

const formatDuration = (seconds: number) => {
  if (!seconds || Number.isNaN(seconds)) return '—';
  const mins = Math.round(seconds / 60);
  if (mins < 1) return '<1 min';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hrs} h` : `${hrs} h ${rem} min`;
};

const reverseGeocode = async (lat: number, lon: number) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=pt-BR`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!data) return null;
    // Prefer a short street-ish name when available
    const addr = data.address || {};
    const road = addr.road || addr.pedestrian || addr.cycleway || addr.footway || addr.residential || '';
    const number = addr.house_number ? ` ${addr.house_number}` : '';
    const neighborhood = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || '';
    const streetPart = road ? `${road}${number}` : '';
    const composed = streetPart ? (neighborhood ? `${streetPart}, ${neighborhood}` : streetPart) : data.display_name;
    return { display_name: composed, lat: parseFloat(data.lat), lon: parseFloat(data.lon) };
  } catch (err) {
    console.warn('Reverse geocode failed', err);
    return null;
  }
};

const locateUser = () => {
  if (!mapInstance.value || !navigator.geolocation) {
    alert('Geolocalização não está disponível neste dispositivo.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async position => {
      const userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
      if (mapInstance.value) {
        mapInstance.value.setCenter(userCoords);
        mapInstance.value.setZoom(15);
      }
      // reverse geocode and populate origin input with street-like name
      const rev = await reverseGeocode(userCoords.lat, userCoords.lng);
      if (rev) {
        routeOrigin.value = rev.display_name || '';
        originCoords.value = { lat: rev.lat, lng: rev.lon };
      }
    },
    () => {
      alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
    },
    { enableHighAccuracy: true }
  );
};

onMounted(async () => {
  await initMap();
  loadFavorites();
});
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 18px;
}

..hero-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 20px 40px rgba(39, 101, 62, 0.08);
}

.hero-card h2 {
  margin: 0;
  color: var(--ion-color-primary);
  font-size: 1.4rem;
}

.hero-card p {
  margin: 0;
  line-height: 1.7;
  color: var(--ion-text-color);
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(30, 127, 52, 0.12);
  color: var(--ion-color-primary);
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.hero-tag .material-symbols-outlined {
  font-size: 1.15rem;
}

.save-card,
.status-card {
  border-radius: 24px;
  border: 1px solid var(--app-border);
  box-shadow: 0 26px 60px rgba(31, 107, 62, 0.08);
  --background: var(--app-surface);
}

.route-fields {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.save-actions {
  margin-bottom: 18px;
}

.save-actions ion-button {
  --background: var(--ion-color-success);
  --background-activated: var(--ion-color-success-shade);
  --background-focused: var(--ion-color-success-shade);
  --color: #ffffff;
}

.saved-list {
  display: grid;
  gap: 12px;
}

.saved-route-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: var(--app-surface-soft);
  border: 1px solid var(--app-border);
  border-radius: 18px;
  padding: 14px 16px;
}

.saved-route-card.selected {
  border-color: var(--ion-color-success-shade);
  box-shadow: inset 0 0 0 1px rgba(30, 127, 52, 0.15);
}

.saved-route-copy strong {
  display: block;
  margin-bottom: 4px;
  color: var(--ion-color-primary);
}

.saved-route-copy p {
  margin: 0;
  color: var(--ion-text-color);
  font-size: 0.95rem;
  line-height: 1.4;
}

.empty-saved {
  margin: 0;
  color: var(--ion-color-medium);
}

.map-card {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid var(--app-border);
  box-shadow: 0 28px 70px rgba(31, 107, 62, 0.1);
  min-height: 420px;
}

#map {
  width: 100%;
  height: 100%;
  min-height: 420px;
}

.route-button {
  margin-top: 16px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.status-value {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-label {
  font-size: 0.95rem;
  color: var(--ion-text-color);
}

.status-note {
  margin: 0;
  color: var(--ion-color-medium);
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 10px;
}

.route-steps {
  margin-top: 18px;
}

.steps-title {
  margin: 0 0 10px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.route-steps ol {
  padding-left: 18px;
  margin: 0;
}

.route-steps li {
  margin-bottom: 8px;
  color: var(--ion-text-color);
  line-height: 1.5;
}

ion-button {
  border-radius: 16px;
}

ion-card-title {
  color: var(--ion-color-primary);
}

ion-card-subtitle {
  color: var(--ion-color-medium);
}

@media (max-width: 600px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
}
  .suggestions {
    background: var(--app-surface);
    border: 1px solid var(--app-border);
    border-radius: 8px;
    margin: 6px 0 12px 0;
    max-height: 180px;
    overflow: auto;
  }
  .suggestion {
    padding: 10px 12px;
    cursor: pointer;
    border-bottom: 1px solid rgba(0,0,0,0.04);
  }
  .suggestion:hover {
    background: rgba(0,0,0,0.03);
  }
</style>

