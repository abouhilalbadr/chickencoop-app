import { defineStore } from 'pinia'
import { io } from "socket.io-client";

export const useStore = defineStore('main', {
  state: () => {
    return {
      baseUrl: window.navigator.onLine ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL_OFFLINE,
      socket: null,
      connected: false,
      user: JSON.parse( localStorage.getItem('user') || null ),
      type: "caisse",
      settings: {
        money: true,
        percentage: false
      },
      notifications: [],
      alert: {
        show: false,
        status: '',
        message: '',

      },
      unique: 0
    }
  },
  actions: {
    setUnique() {
      this.unique += 1
    },
    resetUnique() {
      this.unique = 0
    },
    toggleMoney() {
      this.settings.money = !this.settings.money
    },
    togglePercent() {
      this.settings.percentage = !this.settings.percentage
    },
    updateType(type) {
      this.type = type
    },
    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
      this.socket = io(this.baseUrl, {
        reconnectionDelayMax: 10000,
        auth: {
          token: user.accessToken
        }
      })
      this.socket.on("connect", () => {
        this.connected = true;
      });

      this.socket.on('order:update', (order) => {
        if (order.status === 'TERMINEE') {
          this.notifications.push(order)
          this.alert.show = true
          this.alert.status = 'success'
          this.alert.message = `La commande N&#186; ${order.number} est prête`
          setTimeout(() => {
            this.alert = {
              show: false,
              status: '',
              message: '',
            }
          }, 3000);
        }
      })
    },
    setNotifications(data) {
      this.notifications = data
    },
    removeNotification(i) {
      console.log(i, this.notifications);
      this.notifications.splice(i, 1);
    },
    logout() {
      this.user = null
      localStorage.removeItem('user')
      this.socket.on("disconnect", () => {
        this.connected = false;
      });
    }
  },
})
