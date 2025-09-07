// Global app functionality
class RootIntelApp {
  constructor() {
    this.init()
  }

  init() {
    this.setupNavigation()
    this.setupPWA()
    this.setupOfflineDetection()
    this.setupInstallPrompt()
  }

  setupNavigation() {
    const navToggle = document.getElementById("navToggle")
    const navMenu = document.getElementById("navMenu")

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        navToggle.classList.toggle("active")
        navMenu.classList.toggle("active")
      })

      // Close menu when clicking on a link
      navMenu.addEventListener("click", (e) => {
        if (e.target.classList.contains("nav-link")) {
          navToggle.classList.remove("active")
          navMenu.classList.remove("active")
        }
      })

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navToggle.classList.remove("active")
          navMenu.classList.remove("active")
        }
      })
    }
  }

  setupPWA() {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/static/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration)
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError)
          })
      })
    }
  }

  setupOfflineDetection() {
    const offlineIndicator = document.getElementById("offlineIndicator")

    if (offlineIndicator) {
      const updateOnlineStatus = () => {
        if (navigator.onLine) {
          offlineIndicator.style.display = "none"
        } else {
          offlineIndicator.style.display = "flex"
        }
      }

      window.addEventListener("online", updateOnlineStatus)
      window.addEventListener("offline", updateOnlineStatus)
      updateOnlineStatus()
    }
  }

  setupInstallPrompt() {
    let deferredPrompt
    const installPrompt = document.getElementById("installPrompt")
    const installBtn = document.getElementById("installBtn")
    const dismissBtn = document.getElementById("dismissBtn")

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      deferredPrompt = e

      if (installPrompt) {
        installPrompt.style.display = "block"
      }
    })

    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt()
          const { outcome } = await deferredPrompt.userChoice
          console.log(`User response to the install prompt: ${outcome}`)
          deferredPrompt = null
          installPrompt.style.display = "none"
        }
      })
    }

    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        installPrompt.style.display = "none"
        localStorage.setItem("installPromptDismissed", "true")
      })
    }

    // Don't show if previously dismissed
    if (localStorage.getItem("installPromptDismissed") === "true") {
      if (installPrompt) {
        installPrompt.style.display = "none"
      }
    }
  }

  // Utility functions
  showMessage(message, type = "success") {
    const messageEl = document.createElement("div")
    messageEl.className = `${type}-message`
    messageEl.innerHTML = `
            <span class="${type}-icon">${type === "success" ? "✅" : "⚠️"}</span>
            <span class="${type}-text">${message}</span>
        `

    document.body.appendChild(messageEl)

    setTimeout(() => {
      messageEl.remove()
    }, 3000)
  }

  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Request failed:", error)
      throw error
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.rootIntelApp = new RootIntelApp()
})

// Global utility functions
window.RootIntelUtils = {
  showLoader: (element) => {
    const loader = element.querySelector(".btn-loader")
    const text = element.querySelector(".btn-text")
    if (loader && text) {
      loader.style.display = "flex"
      text.style.display = "none"
      element.disabled = true
    }
  },

  hideLoader: (element) => {
    const loader = element.querySelector(".btn-loader")
    const text = element.querySelector(".btn-text")
    if (loader && text) {
      loader.style.display = "none"
      text.style.display = "inline"
      element.disabled = false
    }
  },

  animateValue: (element, start, end, duration) => {
    const startTime = performance.now()
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const value = Math.floor(start + (end - start) * progress)
      element.textContent = value + "%"

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  },
}
