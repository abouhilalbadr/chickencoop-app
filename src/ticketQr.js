import qrcode from 'qrcode-generator'

/**
 * Turns the receipt's QR code into a link to the order's tracking page
 * (www.chickencoop.ma/suivi/<token>), for orders collected at the counter.
 *
 * Cart.vue clears the cart right before calling window.print(), and Vue only
 * removes the receipt on its next render, so print still sees it. A reactive
 * prop would arrive on that same render, too late; the QR is therefore
 * written straight into the receipt, as an inline SVG that needs no image
 * decoding before the page is printed. The receipt must be freshly rendered
 * for each ticket so a QR code never carries over to the next one.
 */
export const showTrackingQr = (token) => {
  const qr = qrcode(0, 'M')
  qr.addData(`https://www.chickencoop.ma/suivi/${token}`)
  qr.make()
  // A little larger than the logo QR it replaces: the link is longer, so the
  // code has more, smaller squares
  const svg = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true })
    .replace('<svg ', '<svg style="width:10rem;height:10rem" ')
  document.querySelectorAll('#printArea [data-ticket-qr]').forEach((slot) => {
    slot.innerHTML = svg
  })
  document.querySelectorAll('#printArea [data-ticket-qr-caption]').forEach((caption) => {
    caption.textContent = 'Scannez pour suivre votre commande'
  })
}
