<script setup>
/**
 * A charge paid at the till, in three kinds, one tab each:
 *  - Achat stock: an article from the stock list, its quantity and what was
 *    paid. The quantity goes into stock and the price becomes the article's.
 *    An article bought by the pack (cheddar: paquet de 24) is typed in packs;
 *    the API turns them into units.
 *  - Dépense: a running cost (gaz, transport, nettoyage…).
 *  - Avance: money advanced to someone on the staff list.
 * The till only records what it paid out itself; charges the owner paid are
 * entered from the back office.
 */
import { ref, reactive, computed, onMounted, watch } from 'vue'
import axios from 'axios'

import AppButton from '../ui/AppButton.vue'
import Choice from '../ui/Choice.vue'

const props = defineProps(['token'])
const emit = defineEmits(['saved'])
const auth = () => ({ headers: { Authorization: `Bearer ${props.token}` } })

const KINDS = [
  { key: 'STOCK', label: 'Achat stock' },
  { key: 'DEPENSE', label: 'Dépense' },
  { key: 'AVANCE', label: 'Avance' },
]
// Day-to-day costs only: the monthly bills are entered from the back office
const DEPENSES = [
  { value: 'GAZ', label: 'Gaz' },
  { value: 'TRANSPORT', label: 'Transport / essence' },
  { value: 'NETTOYAGE', label: 'Nettoyage' },
  { value: 'MATERIEL', label: 'Petit matériel' },
  { value: 'AUTRE', label: 'Autre' },
]
const SUPPLIERS = ['Favorita', 'Boucherie', 'Boulangerie', 'Pesserie', 'Légumes', 'Fruits', 'Poulet', 'Coca-Cola', 'Boissons', 'Emballage', 'Huile', 'Autre']
const CATEGORIES = [
  { value: 'BOI', label: 'Boissons' }, { value: 'SAU', label: 'Sauces' }, { value: 'EMB', label: 'Emballage' },
  { value: 'EPI', label: 'Épicerie' }, { value: 'SUR', label: 'Surgelés' }, { value: 'PAI', label: 'Pains & pâtes' },
  { value: 'FRO', label: 'Fromages' }, { value: 'CRE', label: 'Crèmerie' }, { value: 'VIA', label: 'Viandes' },
  { value: 'CHA', label: 'Charcuterie' }, { value: 'POI', label: 'Poisson' }, { value: 'EPC', label: 'Épices' },
  { value: 'LEG', label: 'Légumes' }, { value: 'FRU', label: 'Fruits' },
]
const UNITS = { Kg: 'kg', l: 'l', P: 'pièce' }
// French plural from 2 on: paquet → paquets, plateau → plateaux; kg and l stay
const plural = (word, n) =>
  Math.abs(Number(n)) >= 2 && word && !/[sxz]$/.test(word) ? word + (/(au|eu)$/.test(word) ? 'x' : 's') : word
const unitText = (type, n) => (type === 'P' ? plural('pièce', n) : UNITS[type] || '')

const kind = ref('STOCK')
const stocks = ref([])
const staff = ref([])
const loading = ref(false)
const formError = ref('')
const errors = reactive({})

const form = reactive({
  // Achat stock
  search: '',
  stock: null,
  isNew: false,
  newName: '',
  newCategory: '',
  newType: 'Kg',
  supplier: '',
  size: '',
  // Dépense
  category: '',
  note: '',
  // Avance
  staffId: null,
  // All
  price: '',
})

onMounted(async () => {
  const [stockRes, staffRes] = await Promise.allSettled([
    axios.get('/stocks', auth()),
    axios.get('/staff', auth()),
  ])
  if (stockRes.status === 'fulfilled') stocks.value = stockRes.value.data.data
  if (staffRes.status === 'fulfilled') staff.value = staffRes.value.data.data
})

// Switching tabs keeps the amount and who paid, and clears the old tab's errors
watch(kind, () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  formError.value = ''
})

// « 84,50 » and « 84.5 » are the same amount
const parseAmount = (value) => {
  const text = String(value ?? '').replace(/\s/g, '').replace(',', '.')
  return text === '' ? NaN : Number(text)
}
const fmt = (n, digits = 2) => Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
const fmtQty = (n) => Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 3 })

// Article search: names starting with what was typed first, then names
// containing it, then refs — « frites » finds Frites before Sachet frites
const normalize = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const matches = computed(() => {
  const q = normalize(form.search).trim()
  if (!q || form.stock) return []
  const rank = (s) => {
    const name = normalize(s.name)
    if (name.startsWith(q)) return 0
    if (name.includes(q)) return 1
    if (normalize(s.ref).includes(q)) return 2
    return -1
  }
  return stocks.value
    .map((s) => ({ s, r: rank(s) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r || a.s.name.length - b.s.name.length)
    .slice(0, 6)
    .map((x) => x.s)
})

const pick = (stock) => {
  form.stock = stock
  form.search = ''
  delete errors.stock
}

const unit = computed(() => UNITS[form.isNew ? form.newType : form.stock?.type] || '')

// « paquet de 24 pièces », for an article bought by the pack
const packText = (s) => (s?.packSize ? `${s.packLabel || 'paquet'} de ${fmtQty(s.packSize)} ${unitText(s.type, s.packSize)}` : '')
const pack = computed(() => (!form.isNew && form.stock?.packSize ? form.stock : null))
const byPack = ref(false)
watch(() => form.stock, (stock) => { byPack.value = !!stock?.packSize })
const inPacks = computed(() => byPack.value && !!pack.value)
const typed = computed(() => parseAmount(form.size))
// What goes into stock, in the article's unit
const units = computed(() => (inPacks.value ? typed.value * pack.value.packSize : typed.value))
const sizeSuffix = computed(() => (inPacks.value ? plural(pack.value.packLabel, typed.value || 2) : unit.value))

// Switching keeps the same goods: 2 paquets ⇄ 48 pièces
const setByPack = (value) => {
  if (value === byPack.value) return
  if (typed.value > 0) {
    const converted = value ? typed.value / pack.value.packSize : typed.value * pack.value.packSize
    form.size = String(Math.round(converted * 1000) / 1000).replace('.', ',')
  }
  byPack.value = value
}

const perUnit = computed(() => {
  const price = parseAmount(form.price)
  if (kind.value !== 'STOCK' || !(units.value > 0) || !(price > 0)) return ''
  return `${fmt(price / units.value)} DH / ${unit.value || 'unité'}`
})

const stockAfter = computed(() => {
  if (!form.stock || form.isNew || !(units.value > 0)) return ''
  const type = form.stock.type
  const total = form.stock.quantity + units.value
  const after = `Stock ${fmtQty(form.stock.quantity)} → ${fmtQty(total)} ${unitText(type, total)}`
  return inPacks.value ? `= ${fmtQty(units.value)} ${unitText(type, units.value)} · ${after}` : after
})

const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (kind.value === 'STOCK') {
    if (form.isNew) {
      if (form.newName.trim().length < 2) errors.newName = "Le nom de l'article est requis"
      if (!form.newCategory) errors.newCategory = 'La catégorie est requise'
    } else if (!form.stock) errors.stock = 'Choisissez un article'
    if (!(parseAmount(form.size) > 0)) errors.size = 'Quantité invalide'
    if (!form.supplier) errors.supplier = 'Le fournisseur est requis'
  }
  if (kind.value === 'DEPENSE' && !form.category) errors.category = 'Choisissez la dépense'
  if (kind.value === 'AVANCE' && !form.staffId) errors.staffId = "Choisissez l'employé"
  if (!(parseAmount(form.price) > 0)) errors.price = 'Montant invalide'
  return Object.keys(errors).length === 0
}

const body = () => {
  const common = { kind: kind.value, date: new Date(), price: parseAmount(form.price), paidFrom: 'CAISSE' }
  if (kind.value === 'DEPENSE') {
    return { ...common, category: form.category, ...(form.note.trim() && { product: form.note.trim() }) }
  }
  if (kind.value === 'AVANCE') return { ...common, staffId: form.staffId }
  return {
    ...common,
    supplier: form.supplier,
    ...(inPacks.value ? { packs: typed.value } : { size: typed.value }),
    ...(form.isNew
      ? { newStock: { name: form.newName.trim(), category: form.newCategory, type: form.newType } }
      : { stockId: form.stock.id }),
  }
}

const submitCharge = async () => {
  formError.value = ''
  if (!validate()) return
  loading.value = true
  try {
    const { data } = await axios.post('/charge', body(), auth())
    emit('saved', data.data)
  } catch (error) {
    // The new article already exists: pick it instead of adding it twice
    const existing = error?.response?.status === 409 && error.response.data?.data
    if (existing) {
      const match = stocks.value.find((s) => s.id === existing.id)
      if (match) {
        form.isNew = false
        pick(match)
      }
    }
    formError.value = error?.response?.data?.message || "Échec de l'enregistrement, veuillez réessayer"
  } finally {
    loading.value = false
  }
}

const label = 'text-[11px] font-bold uppercase tracking-[.07em]'
const input = 'h-12 px-3 w-full border rounded-lg outline-none bg-white focus:border-main focus:ring-[3px] focus:ring-main/[.15]'
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="submitCharge">
    <!-- Kind -->
    <div class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-gray-light">
      <button
        v-for="k in KINDS"
        :key="k.key"
        type="button"
        class="h-11 rounded-lg text-[15px] font-medium transition-colors"
        :class="kind === k.key ? 'bg-white text-black shadow-sm' : 'text-black/55 hover:text-black'"
        @click="kind = k.key"
      >
        {{ k.label }}
      </button>
    </div>

    <!-- Achat stock -->
    <template v-if="kind === 'STOCK'">
      <div v-if="!form.isNew" class="flex flex-col gap-1.5">
        <label :class="[label, errors.stock ? 'text-danger' : 'text-black/50']">Article</label>
        <div v-if="form.stock" class="h-12 px-3 border border-main rounded-lg flex items-center gap-3 bg-main/[.05]">
          <span class="font-mono text-[13px] text-black/50">{{ form.stock.ref }}</span>
          <span class="font-medium">{{ form.stock.name }}</span>
          <span v-if="pack" class="text-xs text-black/50">{{ packText(pack) }}</span>
          <button type="button" class="ml-auto text-sm text-black/55 hover:text-main" @click="form.stock = null">Changer</button>
        </div>
        <div v-else class="relative">
          <input v-model="form.search" type="text" :class="[input, errors.stock ? 'border-danger' : 'border-border']" placeholder="Chercher : frites, SUR-001…" autocomplete="off">
          <div v-if="matches.length" class="absolute z-10 left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
            <button
              v-for="s in matches"
              :key="s.id"
              type="button"
              class="w-full h-12 px-3 flex items-center gap-3 text-left border-t border-border first:border-t-0 hover:bg-gray-light"
              @click="pick(s)"
            >
              <span class="font-mono text-[13px] text-black/50 w-[64px]">{{ s.ref }}</span>
              <span class="font-medium">{{ s.name }}</span>
              <span class="ml-auto text-xs text-black/45">{{ packText(s) || UNITS[s.type] }}</span>
            </button>
          </div>
          <p v-else-if="form.search.trim().length > 1" class="text-[13px] text-black/55 mt-1.5">Aucun article trouvé.</p>
        </div>
        <span v-if="errors.stock" class="text-danger text-xs">{{ errors.stock }}</span>
        <button type="button" class="self-start text-[13px] text-black/55 hover:text-main underline underline-offset-2" @click="form.isNew = true; form.newName = form.search">
          Article absent du stock ?
        </button>
      </div>

      <div v-else class="flex flex-col gap-3 border border-dashed border-border rounded-xl p-3">
        <div class="flex items-center justify-between">
          <span class="font-medium">Nouvel article</span>
          <button type="button" class="text-[13px] text-black/55 hover:text-main" @click="form.isNew = false">Choisir dans le stock</button>
        </div>
        <div class="flex flex-col gap-1.5">
          <label :class="[label, errors.newName ? 'text-danger' : 'text-black/50']">Nom</label>
          <input v-model="form.newName" type="text" :class="[input, errors.newName ? 'border-danger' : 'border-border']" placeholder="Vinaigre">
          <span v-if="errors.newName" class="text-danger text-xs">{{ errors.newName }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label :class="[label, errors.newCategory ? 'text-danger' : 'text-black/50']">Catégorie</label>
            <select v-model="form.newCategory" :class="[input, errors.newCategory ? 'border-danger' : 'border-border']">
              <option value="" disabled>Choisir</option>
              <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label :class="[label, 'text-black/50']">Compté en</label>
            <div class="grid grid-cols-3 gap-2">
              <Choice v-for="(text, code) in UNITS" :key="code" size="md" block :selected="form.newType === code" @click="form.newType = code">{{ text }}</Choice>
            </div>
          </div>
        </div>
        <p class="text-[12.5px] text-black/50">L'article est ajouté au stock et sera vérifié depuis le back office.</p>
      </div>

      <div class="flex flex-col gap-1.5">
        <label :class="[label, errors.supplier ? 'text-danger' : 'text-black/50']">Fournisseur</label>
        <div class="flex flex-wrap gap-2">
          <Choice v-for="s in SUPPLIERS" :key="s" size="sm" :selected="form.supplier === s" @click="form.supplier = s; delete errors.supplier">{{ s }}</Choice>
        </div>
        <span v-if="errors.supplier" class="text-danger text-xs">{{ errors.supplier }}</span>
      </div>

      <div v-if="pack" class="flex flex-col gap-1.5">
        <label :class="[label, 'text-black/50']">Quantité en</label>
        <div class="grid grid-cols-2 gap-2">
          <Choice size="md" block :selected="byPack" @click="setByPack(true)">{{ plural(pack.packLabel, 2) }} ({{ packText(pack) }})</Choice>
          <Choice size="md" block :selected="!byPack" @click="setByPack(false)">{{ unitText(pack.type, 2) }}</Choice>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label :class="[label, errors.size ? 'text-danger' : 'text-black/50']">Quantité</label>
          <div class="relative">
            <input v-model="form.size" type="text" inputmode="decimal" :class="[input, 'pr-24 tabular-nums', errors.size ? 'border-danger' : 'border-border']" :placeholder="inPacks ? '2' : '12,5'">
            <span class="absolute top-1/2 right-1.5 -translate-y-1/2 px-3 h-9 rounded-md bg-gray-light text-black/65 text-sm flex items-center">{{ sizeSuffix || '—' }}</span>
          </div>
          <span v-if="errors.size" class="text-danger text-xs">{{ errors.size }}</span>
          <span v-else-if="stockAfter" class="text-xs text-black/50">{{ stockAfter }}</span>
        </div>
        <div class="flex flex-col gap-1.5">
          <label :class="[label, errors.price ? 'text-danger' : 'text-black/50']">Montant payé</label>
          <div class="relative">
            <input v-model="form.price" type="text" inputmode="decimal" :class="[input, 'pr-14 tabular-nums', errors.price ? 'border-danger' : 'border-border']" placeholder="275">
            <span class="absolute top-1/2 right-3 -translate-y-1/2 text-black/45 text-sm">DH</span>
          </div>
          <span v-if="errors.price" class="text-danger text-xs">{{ errors.price }}</span>
          <span v-else-if="perUnit" class="text-xs text-second">= {{ perUnit }}</span>
        </div>
      </div>
    </template>

    <!-- Dépense -->
    <template v-else-if="kind === 'DEPENSE'">
      <div class="flex flex-col gap-1.5">
        <label :class="[label, errors.category ? 'text-danger' : 'text-black/50']">Dépense</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Choice v-for="c in DEPENSES" :key="c.value" block :selected="form.category === c.value" @click="form.category = c.value; delete errors.category">{{ c.label }}</Choice>
        </div>
        <span v-if="errors.category" class="text-danger text-xs">{{ errors.category }}</span>
      </div>
      <div class="flex flex-col gap-1.5">
        <label :class="[label, 'text-black/50']">Note (facultatif)</label>
        <input v-model="form.note" type="text" maxlength="100" :class="[input, 'border-border']" placeholder="Bouteille de gaz, taxi marché…">
      </div>
    </template>

    <!-- Avance -->
    <template v-else>
      <div class="flex flex-col gap-1.5">
        <label :class="[label, errors.staffId ? 'text-danger' : 'text-black/50']">Employé</label>
        <div v-if="staff.length" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Choice v-for="p in staff" :key="p.id" block :selected="form.staffId === p.id" @click="form.staffId = p.id; delete errors.staffId">{{ p.name }}</Choice>
        </div>
        <p v-else class="border border-dashed border-border rounded-lg px-3 py-4 text-sm text-black/55">
          Aucun employé dans la liste. Le personnel s'ajoute depuis le back office (Charges › Salaires &amp; avances).
        </p>
        <span v-if="errors.staffId" class="text-danger text-xs">{{ errors.staffId }}</span>
      </div>
    </template>

    <!-- Amount (Dépense and Avance; Achat stock has it beside the quantity) -->
    <div v-if="kind !== 'STOCK'" class="flex flex-col gap-1.5">
      <label :class="[label, errors.price ? 'text-danger' : 'text-black/50']">Montant</label>
      <div class="relative">
        <input v-model="form.price" type="text" inputmode="decimal" :class="[input, 'pr-14 tabular-nums', errors.price ? 'border-danger' : 'border-border']" placeholder="50">
        <span class="absolute top-1/2 right-3 -translate-y-1/2 text-black/45 text-sm">DH</span>
      </div>
      <span v-if="errors.price" class="text-danger text-xs">{{ errors.price }}</span>
    </div>

    <p v-if="formError" class="text-danger text-sm">{{ formError }}</p>

    <div class="flex justify-end pt-2 border-t border-border">
      <AppButton type="submit" variant="primary" size="lg" :loading="loading">Sauvegarder</AppButton>
    </div>
  </form>
</template>
