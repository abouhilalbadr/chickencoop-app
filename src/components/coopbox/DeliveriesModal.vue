<script setup>
import { ref, watch, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "../Modal.vue";
import AppButton from "../ui/AppButton.vue";
import Badge from "../ui/Badge.vue";
import Choice from "../ui/Choice.vue";
import { useStore } from "../../store";

const props = defineProps(["deliveriesModal"]);
const emit = defineEmits(["deliveriesClose", "addToCart"]);

const store = useStore();

const tab = ref("today"); // 'today' or 'tomorrow'
const deliveries = ref({ today: [], tomorrow: [] });
const loading = ref(false);
const expanded = ref(new Set()); // track which delivery IDs are expanded


// Tones, not fills: a status is data on a row, not an action.
const STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Planifiée", tone: "neutral" },
  { value: "PREPARING", label: "En préparation", tone: "warning" },
  { value: "OUT_FOR_DELIVERY", label: "En livraison", tone: "brand" },
  { value: "DELIVERED", label: "Livrée", tone: "positive" },
  { value: "SKIPPED", label: "Ignorée", tone: "warning" },
  { value: "CANCELLED", label: "Annulée", tone: "danger" },
];

// The same map the API enforces (AllowedTransitions in routes/delivery). The
// list used to offer all six from any row, so half the options came back 400:
// a delivered box could be sent back to "En préparation" on screen only.
const ALLOWED_TRANSITIONS = {
  SCHEDULED: ["PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "SKIPPED", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  SKIPPED: [],
  CANCELLED: [],
};

// Current status first (it is what the control shows), then where it may go
function statusChoices(current) {
  const options = [current, ...(ALLOWED_TRANSITIONS[current] || [])];
  return STATUS_OPTIONS.filter((s) => options.includes(s.value));
}

function isTerminal(current) {
  return (ALLOWED_TRANSITIONS[current] || []).length === 0;
}

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

function statusTone(status) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.tone || "neutral";
}

function statusLabel(status) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
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

// `event` is the change on the control. The status is NOT bound with v-model
// any more: it used to be written into the row before the confirm, so saying
// "Annuler" — or a rejected transition — still left the new label on screen
// until someone hit Rafraîchir.
async function updateStatus(delivery, event) {
  const newStatus = event.target.value;
  const revert = () => { event.target.value = delivery.status; };

  if (newStatus === delivery.status) return;

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
  if (!confirm.isConfirmed) return revert();

  try {
    await axios.put(`/deliveries/${delivery.id}/status`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${store.user.accessToken}` },
    });
    await fetchDeliveries();
    Swal.fire("Succès", "Statut mis à jour", "success");
  } catch (error) {
    revert();
    // The API answers with the reason a transition was refused; show it
    Swal.fire("Erreur", error?.response?.data?.error || "Impossible de mettre à jour la livraison", "error");
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

// Only load deliveries when the modal is actually opened — never on mount.
// On the stockage page this component briefly mounts (store.type defaults to
// 'caisse'), and STOCK has no deliveries permission, so an eager fetch 403s.
watch(() => props.deliveriesModal, (open) => {
  if (open) fetchDeliveries();
});
</script>

<template>
  <Modal :is-open="deliveriesModal" size="normal" @close-modal="closeModal">
    <template #title>
      <div class="flex justify-between items-center gap-4">
        <span>Livraisons</span>
        <AppButton size="md" :loading="loading" @click="fetchDeliveries">Rafraîchir</AppButton>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-4">
        <!-- Day switch, the same segmented control as the order types -->
        <div class="grid grid-cols-2 gap-2 max-w-md">
          <Choice :selected="tab === 'today'" block @click="tab = 'today'">
            Aujourd'hui ({{ todayDeliveries.length }})
          </Choice>
          <Choice :selected="tab === 'tomorrow'" block @click="tab = 'tomorrow'">
            Demain ({{ tomorrowDeliveries.length }})
          </Choice>
        </div>

        <div v-if="loading" class="py-14 flex justify-center">
          <span class="loading big"></span>
        </div>

        <div v-else class="flex flex-col gap-3">
          <article
            v-for="delivery in tab === 'today' ? todayDeliveries : tomorrowDeliveries"
            :key="delivery.id"
            class="border border-border rounded-xl overflow-hidden"
          >
            <div class="flex justify-between items-center gap-3 px-4 py-3 bg-gray-light border-b border-border">
              <h3 class="font-medium">{{ delivery.client?.name || 'Client inconnu' }}</h3>
              <Badge :tone="statusTone(delivery.status)">{{ statusLabel(delivery.status) }}</Badge>
            </div>

            <dl class="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div class="flex flex-col">
                <dt class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Adresse</dt>
                <dd>{{ delivery.address || delivery.client?.address || '—' }}</dd>
              </div>
              <div class="flex flex-col">
                <dt class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Téléphone</dt>
                <dd class="tabular-nums">{{ delivery.phone || delivery.client?.phone || '—' }}</dd>
              </div>
              <div class="flex flex-col">
                <dt class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Prévue le</dt>
                <dd class="tabular-nums">{{ fmtDateTime(delivery.scheduledFor) }}</dd>
              </div>
            </dl>

            <div class="px-4 pb-3">
              <button
                class="text-sm text-main hover:underline"
                @click="toggleDetails(delivery.id)"
              >
                {{ expanded.has(delivery.id) ? 'Masquer les détails' : 'Voir les détails' }}
              </button>
            </div>

            <div v-if="expanded.has(delivery.id)" class="mx-4 mb-3 border border-border rounded-lg p-3">
              <template v-if="delivery.items && Array.isArray(delivery.items.items) && delivery.items.items.length">
                <ul class="flex flex-col divide-y divide-border">
                  <li
                    v-for="(it, idx) in delivery.items.items"
                    :key="idx"
                    class="flex justify-between gap-3 text-sm py-2 first:pt-0 last:pb-0"
                  >
                    <span class="flex-1">{{ itemLabel(it) }}</span>
                    <span class="whitespace-nowrap tabular-nums font-medium">
                      {{ fmtMAD(it?.lineTotal ?? (it?.product?.price ?? 0) * (it?.quantity ?? 1)) }}
                    </span>
                  </li>
                </ul>
                <div class="mt-3 pt-2.5 border-t border-border flex justify-between text-sm font-medium">
                  <span>Sous-total</span>
                  <span class="tabular-nums">{{ fmtMAD(delivery.items.subtotal) }}</span>
                </div>
              </template>
              <p v-else class="text-sm text-black/45">Aucun élément</p>
            </div>

            <div class="px-4 py-3 border-t border-border flex flex-wrap gap-3 items-center justify-between">
              <div class="flex gap-2.5 items-center">
                <label class="text-sm text-black/55" :for="`status-${delivery.id}`">Statut</label>
                <!-- Only the moves the API will accept from here. A finished
                     delivery has none, so the control is closed rather than
                     offering options that come back refused. -->
                <select
                  :id="`status-${delivery.id}`"
                  class="h-11 px-3 border border-border rounded-lg text-sm bg-white outline-none
                    focus:border-main focus:ring-[3px] focus:ring-main/[.15]
                    disabled:bg-gray-light disabled:text-black/45"
                  :value="delivery.status"
                  :disabled="isTerminal(delivery.status)"
                  @change="updateStatus(delivery, $event)"
                >
                  <option v-for="s in statusChoices(delivery.status)" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </option>
                </select>
              </div>
              <AppButton variant="primary" :disabled="loading" @click="addOrderToCart(delivery)">
                Ajouter au panier
              </AppButton>
            </div>
          </article>

          <p
            v-if="(tab === 'today' ? todayDeliveries.length : tomorrowDeliveries.length) === 0"
            class="border border-dashed border-border rounded-xl py-12 text-center text-black/45"
          >
            Aucune livraison trouvée
          </p>
        </div>
      </div>
    </template>
  </Modal>
</template>
