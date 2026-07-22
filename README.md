# chickencoop-app

Desktop app used on site at the coop — till (caisse), tablet ordering, stock entry, cash counting and receipt printing.

Tauri 1 + Vue 3 + Vite, Pinia, vue-router, socket.io-client, Tailwind CSS, SweetAlert2.
Bundle id `com.chicken-coop.cyou`, product name `chickencoop`.

## Getting Started

```bash
npm install
npm run tauri dev     # desktop app
npm run dev           # browser only
npm run tauri build   # installers
```

## Environment

Vite env vars, from `.env`:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | `chicken-coop-api` base URL used when online |
| `VITE_API_URL_OFFLINE` | Fallback base URL (LAN/local API) when `navigator.onLine` is false |

The store picks between the two at startup (`src/store.js`).

## Screens

Routes use hash history; `router.js` redirects on login based on the user's name.

| Route | Screen | Who |
|-------|--------|-----|
| `/` | Login | — |
| `/password` | Password entry | — |
| `/caisse` | Till: orders, cart, payment, printing | user `Caisse` |
| `/stockage` | Stock and charges entry | user `Charge` |
| `/tablet` | Tablet ordering | everyone else |

## Realtime

On login the store opens a Socket.io connection to the API, authenticating with the user's `accessToken`, and handles:

- `order:created` — queues the order for printing and shows an alert
- `order:update` — pushes a notification when status becomes `TERMINEE`

## Structure

- `src/views/` — `Home`, `Password`, `Caisse`, `stockage/`, `tablet/`
- `src/components/` — cart and product modals, printing (`OrdersPrints`, `PrintItem`, `PrinterMsg`), cash counting (`Money`, `MoneyAll`, `Calc`), `PreOrder`, `OrdersNotif`
- `src/store.js` — Pinia store: auth, socket, settings, print queue, preorders
- `src/assets/` — bill/coin images for cash counting, notification sounds
- `src-tauri/` — Rust shell (`main.rs`), `tauri.conf.json`
