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
export const jsonProducts = (products) => {
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
