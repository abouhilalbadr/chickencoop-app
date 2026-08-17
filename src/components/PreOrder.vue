<script setup>
import { ref } from "vue"
import axios from "axios"
import Swal from "sweetalert2"

import { useStore } from "../store"
import Close from "./icons/Close.vue";
import Amount from "./ui/Money.vue";
import AppButton from "./ui/AppButton.vue";

const store = useStore()
const emits = defineEmits(['change-page', 'add-to-cart'])

const deleting = ref(null)

const updatePage = (p) => {
  emits('change-page', p)
}

const addOrderToCart = (order) => {
  emits('add-to-cart', order)
}

/**
 * Les lignes d'une précommande, quelle que soit la forme reçue.
 *
 * `Preorder.products` est une colonne Json : le site et la caisse y écrivent
 * une chaîne, mais une ligne écrite autrement revient déjà décodée. Un
 * JSON.parse() sec sur un tableau lève, et l'erreur ne tombait pas sur la seule
 * ligne fautive : elle interrompait le rendu de tout le tiroir, si bien que
 * plus aucune commande n'affichait ses boutons Supprimer / Ajouter à la caisse.
 * Une commande illisible doit rester encaissable — ou au moins supprimable.
 */
const jsonProducts = (products) => {
  if (Array.isArray(products)) return products
  if (typeof products === 'string') {
    try {
      const parsed = JSON.parse(products)
      return Array.isArray(parsed) ? parsed : Object.values(parsed ?? {})
    } catch {
      return []
    }
  }
  if (products && typeof products === 'object') return Object.values(products)
  return []
}

// A client can place an order on the site and then call to cancel it. The row
// stays on the till for ever otherwise: it is only cleared by being rung up.
const removeOrder = async (order) => {
  const confirm = await Swal.fire({
    title: 'Supprimer la précommande ?',
    text: `La commande de ${order.clientName} sera définitivement supprimée.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Supprimer',
    cancelButtonText: 'Annuler',
    confirmButtonColor: '#c9382b',
  })
  if (!confirm.isConfirmed) return

  deleting.value = order.id
  try {
    await axios.delete(`/preorder/${order.id}`, {
      headers: { Authorization: `Bearer ${store.user.accessToken}` },
    })
    store.removePreorder(order.id)
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Précommande supprimée',
      showConfirmButton: false,
      timer: 1500,
    })
  } catch (error) {
    Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: 'Suppression impossible. Veuillez réessayer',
      showConfirmButton: false,
      timer: 2000,
    })
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="relative">
    <div class="fixed inset-0 z-40 bg-black/50" @click="updatePage('caisse')"></div>
    <!-- A drawer, not a page: the till behind it stays where it was -->
    <aside class="fixed top-0 right-0 h-screen w-full max-w-2xl z-50 bg-white border-l border-border shadow-lg flex flex-col">
      <header class="flex justify-between items-center gap-4 px-5 h-16 border-b border-border shrink-0">
        <div class="flex items-center gap-2.5">
          <h2 class="font-bree-serif text-xl">Précommandes du site</h2>
          <span
            v-if="store.preorders.length"
            class="min-w-[26px] h-[26px] px-1.5 rounded-full bg-main text-white text-[13px] font-bold flex items-center justify-center tabular-nums"
          >
            {{ store.preorders.length }}
          </span>
        </div>
        <button
          @click="updatePage('caisse')"
          class="h-11 w-11 rounded-lg border border-border flex justify-center items-center text-black/55 transition-colors hover:bg-gray-light"
          aria-label="Fermer"
        >
          <close />
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <!-- shrink-0 : une carte est un enfant de flex, donc compressible par
             défaut. Dès qu'il y avait plus de commandes que de hauteur d'écran,
             le navigateur les écrasait au lieu de faire défiler la liste, et
             overflow-hidden rognait le reste : les lignes se coupaient en plein
             milieu et les boutons Supprimer / Ajouter à la caisse disparaissaient
             de toutes les commandes à la fois. -->
        <div
          v-for="(item, i) in store.preorders"
          :key="i"
          class="shrink-0 border border-border rounded-xl overflow-hidden"
        >
          <div class="flex justify-between items-center gap-4 px-4 py-3 bg-gray-light border-b border-border">
            <div>
              <h3 class="font-medium">{{ item.clientName }}</h3>
              <p class="text-[13px] text-black/55">{{ item.clientPhone }}</p>
            </div>
            <Amount :value="item.total" size="total" tone="brand" :decimals="false" />
          </div>

          <div class="px-4 divide-y divide-border">
            <!-- Le détail peut manquer, la commande reste à traiter : on le dit
                 au lieu de laisser une carte muette. -->
            <p v-if="jsonProducts(item.products).length === 0" class="py-3 text-[13px] text-black/55">
              Détail illisible — rappelez le client au {{ item.clientPhone }}
            </p>
            <div v-for="(product, j) in jsonProducts(item.products)" :key="j" class="flex items-start gap-3 py-3">
              <img v-if="product.image" :src="product.image" :alt="product.name" class="h-12 w-12 object-cover rounded-lg shrink-0">
              <div class="flex flex-col gap-1 flex-1 min-w-0">
                <h4 class="font-bree-serif text-[15px] leading-tight">
                  <span v-if="product.number > 1" class="text-main">{{ product.number }}×</span>
                  {{ product.name }}
                  <span v-if="product.size" class="uppercase text-main">({{ product.size }})</span>
                </h4>
                <div v-if="product.viandes?.length || product.sauces?.length || product.extras?.length" class="flex flex-col gap-0.5 text-black/55 text-xs">
                  <span v-if="product.viandes?.length">Viandes : {{ product.viandes.join(', ') }}</span>
                  <span v-if="product.sauces?.length">Sauces : {{ product.sauces.join(', ') }}</span>
                  <span v-if="product.extras?.length">Extras : {{ product.extras.join(', ') }}</span>
                </div>
              </div>
              <Amount :value="product.price" :decimals="false" />
            </div>
          </div>

          <div class="px-4 py-3 border-t border-border flex justify-between gap-3">
            <!-- Destructive, so outlined: it never looks like the main action -->
            <AppButton
              variant="danger"
              :loading="deleting === item.id"
              @click="removeOrder(item)"
            >
              Supprimer
            </AppButton>
            <AppButton variant="primary" @click="addOrderToCart(item)">Ajouter à la caisse</AppButton>
          </div>
        </div>

        <p v-if="store.preorders.length === 0" class="text-black/45 text-center py-16">
          Pas de commandes sur le site Web
        </p>
      </div>
    </aside>
  </div>
</template>
