<script setup>
import { ref, reactive, computed } from "vue"
import Modal from "./Modal.vue";
import Stepper from "./Stepper.vue";
import Viande from "./Viande.vue";
import Sauce from "./Sauce.vue";
import Extra from "./Extra.vue";
import Amount from "./ui/Money.vue";
import AppButton from "./ui/AppButton.vue";
import Tacos from "./icons/food/Tacos.vue";

import { useStore } from "../store"

const store = useStore()

const props = defineProps(['tacosModal', 'step', 'settings', 'hidePrev', 'hideNext'])
const emit = defineEmits(['tacosClose', 'changeStep', 'sendData'])

const make = reactive(JSON.parse(props.settings[0].make || ''))

const plusPrice = ref(0)
const size = ref('m')
const order = ref({})
const note = ref('')

// The sizes, as the settings name them. Everything past XXXL is a recipe with
// its own price, which is why they sit in the same row.
const SIZES = [
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: 'xxl', label: 'XXL' },
  { value: 'xxxl', label: 'XXXL' },
  { value: 'gourmet', label: 'Gourmet' },
  { value: 'diavolo', label: 'Le Diavolo' },
  { value: 'gold', label: 'Le Gold' },
  { value: 'fromy', label: 'Le 4 Fromy' },
]

const addSize = (s) => {
  size.value = s
}

// What the size costs on its own, before sauces and extras
const sizePrice = (s) =>
  parseInt(store.glovo ? make[s]?.priceGlovo : make[s]?.price) || 0

const basePrice = computed(() => sizePrice(size.value))
const total = computed(() => basePrice.value + plusPrice.value)

// The picks, read back for the summary rail
const picks = computed(() => ({
  viandes: order.value.viandes || [],
  sauces: order.value.sauces || [],
  extras: order.value.extras || [],
}))

// Sauces past this count are charged; the number comes with the size
const freeSauces = computed(() => parseInt(make[size.value]?.sauces) || 0)
const viandesMax = computed(() => parseInt(make[size.value]?.size) || 1)

// What a further sauce or an extra adds, straight from Setting.more
const more = JSON.parse(props.settings[0]?.more || '{}')
const saucePrice = more?.sauces?.price ?? 2
const extraPrice = more?.extras?.price ?? 3

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

const STEPS = [
  { n: 1, label: 'Taille & viandes' },
  { n: 2, label: 'Sauces & extras' },
]

const closeTacosModal = () => {
  emit('tacosClose')
  emit('changeStep', 'reset')
  size.value = 'm'
  plusPrice.value = 0
}

const nextStep = () => {
  emit('changeStep', 'next')
}

const prevStep = () => {
  emit('changeStep', 'prev')
}

const addSauces = ({ sauces, price, operation }) => {
  order.value.sauces = sauces
  const make = JSON.parse(props.settings[0]?.make)
  if (operation === 'plus' && sauces.length > parseInt(make[size.value].sauces))
    plusPrice.value += parseInt(price)
  if (operation === 'minus' && sauces.length >= parseInt(make[size.value].sauces))
    plusPrice.value -= parseInt(price)
}
const addExtras = ({ extras, price, operation }) => {
  order.value.extras = extras
  if (operation === 'plus')
    plusPrice.value += parseInt(price)
  else
    plusPrice.value -= parseInt(price)
}
const addViandes = ({ viandes }) => {
  order.value.viandes = viandes
}

const saveData = () => {
  order.value.size = size.value
  order.value.name = "Tacos Composer"
  order.value.image = store.baseUrl + "/public/tacos-composez.jpg"
  order.value.price = (store.glovo ? parseInt(make[size.value].priceGlovo) : parseInt(make[size.value].price)) + plusPrice.value
  order.value.productId = 0
  order.value.mode = 'make-tacos'
  order.value.note = note.value.trim()
  emit('sendData', order.value)
  emit('tacosClose')
  size.value = 'm'
  plusPrice.value = 0
  note.value = ''
  order.value = {}
  emit('changeStep', 'reset')
}

</script>
<template>
  <Modal :is-open="tacosModal" @close-modal="closeTacosModal">
    <template v-slot:title>
      <div class="flex items-center gap-3">
        <span>Composer votre Tacos</span>
        <!-- Named steps, not two dashes: the cashier knows what is still coming -->
        <span class="flex items-center gap-2 font-roboto">
          <span
            v-for="s in STEPS"
            :key="s.n"
            class="flex items-center gap-1.5 h-8 pl-1.5 pr-3 rounded-full text-[13px] transition-colors"
            :class="step === s.n ? 'bg-main/[.12] text-[#c14a28]' : 'text-black/45'"
          >
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors"
              :class="step > s.n ? 'bg-second text-white' : step === s.n ? 'bg-main text-white' : 'bg-black/[.08] text-black/50'"
            >
              <svg v-if="step > s.n" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <template v-else>{{ s.n }}</template>
            </span>
            {{ s.label }}
          </span>
        </span>
      </div>
    </template>
    <template v-slot:body>
      <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <!-- The tacos being built, kept in view: what has been picked so far and
             what it costs, so nothing has to be remembered between the two steps -->
        <aside class="rounded-xl border border-border bg-gray-light p-4 flex flex-col gap-4 self-start">
          <div class="flex items-center gap-3">
            <span class="w-14 h-14 rounded-xl bg-main/[.10] flex items-center justify-center shrink-0">
              <Tacos class="h-9 fill-main" />
            </span>
            <div class="min-w-0">
              <p class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Taille</p>
              <p class="font-bree-serif text-xl leading-tight">
                {{ SIZES.find(s => s.value === size)?.label }}
              </p>
            </div>
          </div>

          <dl class="flex flex-col gap-3 text-[13px] border-t border-border pt-3">
            <div class="flex flex-col gap-1">
              <dt class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">
                Viandes <span class="tabular-nums">{{ picks.viandes.length }}/{{ viandesMax }}</span>
              </dt>
              <dd :class="picks.viandes.length ? 'text-black/80' : 'text-black/35'">
                {{ picks.viandes.length ? picks.viandes.map(cap).join(', ') : 'Aucune' }}
              </dd>
            </div>
            <div class="flex flex-col gap-1">
              <dt class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">
                Sauces <span class="tabular-nums">{{ picks.sauces.length }}</span>
              </dt>
              <dd :class="picks.sauces.length ? 'text-black/80' : 'text-black/35'">
                {{ picks.sauces.length ? picks.sauces.map(cap).join(', ') : 'Aucune' }}
              </dd>
            </div>
            <div class="flex flex-col gap-1">
              <dt class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">
                Extras <span class="tabular-nums">{{ picks.extras.length }}</span>
              </dt>
              <dd :class="picks.extras.length ? 'text-black/80' : 'text-black/35'">
                {{ picks.extras.length ? picks.extras.map(cap).join(', ') : 'Aucun' }}
              </dd>
            </div>
          </dl>

          <div class="border-t border-border pt-3 flex flex-col gap-1">
            <div class="flex items-baseline justify-between">
              <span class="text-[13px] text-black/55">Base</span>
              <Amount :value="basePrice" :decimals="false" />
            </div>
            <div class="flex items-baseline justify-between">
              <span class="text-[13px] text-black/55">Suppléments</span>
              <!-- `key` restarts the animation, so a change is seen -->
              <Amount :key="plusPrice" class="animate-pop" :value="plusPrice" :decimals="false" />
            </div>
          </div>
        </aside>

        <div class="min-h-[340px] relative">
          <Stepper :is-showing="step === 1">
            <template v-slot:stepBody>
              <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-2.5">
                  <span class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Les tailles</span>
                  <!-- Each size carries its price and how many meats it includes:
                       the two things that decide which one is picked -->
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <button
                      v-for="item in SIZES"
                      :key="item.value"
                      type="button"
                      class="h-[72px] px-3 rounded-lg border text-left flex flex-col justify-center gap-0.5 transition-all active:scale-95
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main/40"
                      :class="size === item.value
                        ? 'bg-main border-main text-white shadow-sm'
                        : 'bg-white border-border hover:border-main/40 hover:bg-gray-light'"
                      @click="addSize(item.value)"
                    >
                      <span class="font-bree-serif text-[17px] leading-none">{{ item.label }}</span>
                      <span class="text-[12.5px] tabular-nums" :class="size === item.value ? 'text-white/80' : 'text-black/55'">
                        {{ sizePrice(item.value) }} DH · {{ make[item.value]?.size }} viande{{ parseInt(make[item.value]?.size) > 1 ? 's' : '' }}
                      </span>
                    </button>
                  </div>
                </div>
                <div class="flex flex-col gap-2.5">
                  <span class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Les viandes</span>
                  <viande :max="make[size].size" :settings="settings" @save-viandes="addViandes" />
                </div>
              </div>
            </template>
          </Stepper>
          <Stepper :is-showing="step === 2">
            <template v-slot:stepBody>
              <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-2.5">
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Les sauces</span>
                    <span class="text-[12.5px] text-black/50">
                      {{ freeSauces }} incluses, puis +{{ saucePrice }} DH
                    </span>
                  </div>
                  <sauce :settings="settings" @save-sauces="addSauces" />
                </div>
                <div class="flex flex-col gap-2.5">
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Les extras</span>
                    <span class="text-[12.5px] text-black/50">+{{ extraPrice }} DH chacun</span>
                  </div>
                  <extra :settings="settings" @save-extras="addExtras" />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="tacos-note" class="text-[11px] font-bold uppercase tracking-[.07em] text-black/50">Note pour la cuisine</label>
                  <textarea
                    id="tacos-note"
                    v-model="note"
                    rows="2"
                    placeholder="Ex : sans oignon, allergie…"
                    class="w-full border border-border rounded-lg p-3 text-base outline-none resize-none
                      focus:border-main focus:ring-[3px] focus:ring-main/[.15]"
                  ></textarea>
                </div>
              </div>
            </template>
          </Stepper>
        </div>
      </div>
    </template>
    <template v-slot:buttons>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-baseline gap-2.5">
          <span class="text-black/55">Total</span>
          <Amount :key="total" class="animate-pop" :value="total" size="total" tone="brand" :decimals="false" />
        </div>
        <div class="ml-auto flex gap-3">
          <AppButton variant="secondary" size="lg" :disabled="hidePrev" @click="prevStep">Précédent</AppButton>
          <AppButton v-if="step < 2" variant="primary" size="lg" :disabled="hideNext" @click="nextStep">Suivant</AppButton>
          <AppButton v-else variant="primary" size="lg" @click="saveData">Ajouter au panier</AppButton>
        </div>
      </div>
    </template>
  </Modal>
</template>
