<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "../Modal.vue";
import { useStore } from "../../store";

const props = defineProps(["deliveriesModal"]);
const emit = defineEmits(["deliveriesClose", "addToCart"]);

const store = useStore();

const tab = ref("today"); // 'today' or 'tomorrow'
const deliveries = ref({ today: [], tomorrow: [] });
const loading = ref(false);
const expanded = ref(new Set()); // track which delivery IDs are expanded


const STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Planifiée", color: "bg-gray text-black" },
  { value: "PREPARING", label: "En préparation", color: "bg-third text-black" },
  { value: "OUT_FOR_DELIVERY", label: "En livraison", color: "bg-second text-white" },
  { value: "DELIVERED", label: "Livrée", color: "bg-green-600 text-white" },
  { value: "SKIPPED", label: "Ignorée", color: "bg-yellow-300 text-black" },
  { value: "CANCELLED", label: "Annulée", color: "bg-red text-white" },
];

function fmtDateTime(x) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(x));
}

function fmtMAD(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n)) + " DH";
}
function toggleDetails(id) {
  if (expanded.value.has(id)) expanded.value.delete(id);
  else expanded.value.add(id);
  // force reactivity for Set
  expanded.value = new Set(expanded.value);
}
function itemLabel(it) {
  // expected line snapshot: { product:{id,name,image,price}, quantity, options:[{type,label}], lineTotal }
  const base = `${it?.name ?? 'Produit'} × ${it?.quantity ?? 1}`;
  const opts = Array.isArray(it?.options) && it.options.length
    ? " — " + it.options.map(o => o?.label).filter(Boolean).join(", ")
    : "";
  return base + opts;
}

function badgeClass(status) {
  const s = STATUS_OPTIONS.find((s) => s.value === status);
  return s ? `${s.color} px-2 py-1 text-xs rounded-full font-semibold` : "";
}

async function fetchDeliveries() {
  loading.value = true;
  try {
    const { data } = await axios.get("/deliveries/kitchen/board?day=both&includeItems=true", {
      headers: { Authorization: `Bearer ${store.user.accessToken}` },
    });
    deliveries.value = data?.data || { today: [], tomorrow: [] };
  } catch {
    Swal.fire("Erreur", "Impossible de charger les livraisons", "error");
  } finally {
    loading.value = false;
  }
}

async function updateStatus(delivery, newStatus) {
  const statusLabel = STATUS_OPTIONS.find((s) => s.value === newStatus)?.label || newStatus;
  const confirm = await Swal.fire({
    title: `Changer le statut`,
    text: `Voulez-vous marquer cette livraison comme "${statusLabel}" ?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Oui",
    cancelButtonText: "Annuler",
    confirmButtonColor: "#4d966d",
  });
  if (!confirm.isConfirmed) return;

  try {
    await axios.put(`/deliveries/${delivery.id}/status`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${store.user.accessToken}` },
    });
    await fetchDeliveries();
    Swal.fire("Succès", "Statut mis à jour", "success");
  } catch (error) {
    Swal.fire("Erreur", "Impossible de mettre à jour la livraison", "error");
  }
}

function addOrderToCart(order) {
  // return console.log(order);
  const newItems = [];
  for (let i = 0; i < order.items.items.length; i++) {
    const product = order.items.items[i];

    newItems.push({
      ...product,
      price: product.unitPriceWithExtras,
      sauces: product.options?.filter((o) => o.type === "sauce").map((o) => o.label) || [],
      extras: product.options?.filter((o) => o.type === "extra").map((o) => o.label) || [],
    });
  }
  order.items.items = newItems;
  emit("addToCart", order);
}

const todayDeliveries = computed(() => deliveries.value.today || []);
const tomorrowDeliveries = computed(() => deliveries.value.tomorrow || []);

const closeModal = () => emit("deliveriesClose");

onMounted(fetchDeliveries);
</script>

<template>
  <Modal :is-open="deliveriesModal" size="normal" @close-modal="closeModal">
    <template #title>
      <div class="flex justify-between items-center">
        <span class="text-2xl">Livraisons</span>
        <button
          @click="fetchDeliveries"
          class="text-sm border border-border px-3 py-1 rounded-md hover:bg-gray"
        >
          Rafraîchir
        </button>
      </div>
    </template>

    <template #body>
      <div class="mt-4">
        <!-- Tabs -->
        <div class="flex justify-center gap-6 mb-4">
          <button
            :class="tab === 'today' ? 'text-main font-bold border-b-2 border-main' : 'text-gray-500'"
            @click="tab = 'today'"
          >
            Aujourd’hui ({{ todayDeliveries.length }})
          </button>
          <button
            :class="tab === 'tomorrow' ? 'text-main font-bold border-b-2 border-main' : 'text-gray-500'"
            @click="tab = 'tomorrow'"
          >
            Demain ({{ tomorrowDeliveries.length }})
          </button>
        </div>

        <div v-if="loading" class="text-center py-10 text-gray-500">Chargement…</div>

        <!-- Deliveries List -->
        <div v-else class="max-h-[600px] overflow-y-auto">
          <div
            v-for="delivery in tab === 'today' ? todayDeliveries : tomorrowDeliveries"
            :key="delivery.id"
            class="border border-border rounded-xl p-4 mb-3 flex flex-col gap-2"
          >
            <div class="flex justify-between items-center">
              <div class="font-bold">
                {{ delivery.client?.name || 'Client inconnu' }}
              </div>
              <span :class="badgeClass(delivery.status)">
                {{
                  STATUS_OPTIONS.find((s) => s.value === delivery.status)?.label ||
                  delivery.status
                }}
              </span>
            </div>

            <div class="text-sm text-gray-700">
              <p><strong>Adresse :</strong> {{ delivery.address || delivery.client?.address || '—' }}</p>
              <p><strong>Téléphone :</strong> {{ delivery.phone || delivery.client?.phone || '—' }}</p>
              <p><strong>Prévue le :</strong> {{ fmtDateTime(delivery.scheduledFor) }}</p>
            </div>

            <!-- Items toggle -->
            <div class="mt-1">
              <button
                class="text-sm underline text-main"
                @click="toggleDetails(delivery.id)"
              >
                {{ expanded.has(delivery.id) ? 'Masquer les détails' : 'Voir détails' }}
              </button>
            </div>
            <!-- Items list -->
            <div v-if="expanded.has(delivery.id)" class="mt-2 border border-border rounded-lg p-3 bg-white">
              <template v-if="delivery.items && Array.isArray(delivery.items.items) && delivery.items.items.length">
                <ul class="space-y-2">
                  <li
                    v-for="(it, idx) in delivery.items.items"
                    :key="idx"
                    class="flex justify-between gap-3 text-sm"
                  >
                    <div class="flex-1">
                      {{ itemLabel(it) }}
                    </div>
                    <div class="whitespace-nowrap font-semibold">
                      {{ fmtMAD(it?.lineTotal ?? (it?.product?.price ?? 0) * (it?.quantity ?? 1)) }}
                    </div>
                  </li>
                </ul>
                <div class="mt-3 pt-2 border-t border-border flex justify-between text-sm">
                  <span class="font-semibold">Sous-total</span>
                  <span class="font-semibold">{{ fmtMAD(delivery.items.subtotal) }}</span>
                </div>
              </template>
              <p v-else class="text-sm text-gray-500">Aucun élément</p>
            </div>
            <!-- Status changer -->
            <div vif="tab === 'today'" class="flex gap-2 justify-between">
              <div class="flex gap-2 items-center mt-2">
                <label class="text-sm text-gray-600">Changer le statut :</label>
                <select
                  class="border border-border rounded-md px-2 py-1 text-sm"
                  v-model="delivery.status"
                  @change="updateStatus(delivery, delivery.status)"
                >
                  <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </option>
                </select>
              </div>
              <button
                class="bg-main text-white px-10 py-2 rounded-md hover:bg-main/80 transition disabled:bg-main/50 disabled:cursor-wait flex justify-center items-center"
                :disabled="loading"
                @click="addOrderToCart(delivery)"
              >
                Ajouter au panier
              </button>
            </div>
          </div>

          <div
            v-if="(tab === 'today' ? todayDeliveries.length : tomorrowDeliveries.length) === 0"
            class="text-center py-10 text-gray-500"
          >
            Aucune livraison trouvée
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>
