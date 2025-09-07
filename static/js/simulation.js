document.addEventListener("DOMContentLoaded", () => {
  new AdvancedPlantSimulation()
})

class AdvancedPlantSimulation {
  constructor() {
    this.currentPlantType = "tropical"
    this.simulationDays = 30
    this.growthChart = null
    this.currentSimulationData = null
    this.init()
  }

  init() {
    this.setupControls()
    this.setupPlantTypes()
    this.setupSimulationButton()
    this.loadJournalEntries()
  }

  setupControls() {
    const sliders = ["sunlight", "water", "temperature", "fertilizer", "simulationDays"]

    sliders.forEach((type) => {
      const slider = document.getElementById(`${type}Slider`)
      const valueDisplay = document.getElementById(`${type}Value`)

      if (slider && valueDisplay) {
        slider.addEventListener("input", (e) => {
          const value = e.target.value
          if (type === "temperature") {
            valueDisplay.textContent = `${value}°C`
          } else if (type === "simulationDays") {
            valueDisplay.textContent = value
            this.simulationDays = parseInt(value)
          } else {
            valueDisplay.textContent = `${value}%`
          }
        })
      }
    })
  }

  setupPlantTypes() {
    const plantTypeSelect = document.getElementById("plantType")
    if (plantTypeSelect) {
      plantTypeSelect.addEventListener("change", (e) => {
        this.currentPlantType = e.target.value
        this.updatePlantDisplay()
      })
    }
  }

  setupSimulationButton() {
    const simulateBtn = document.getElementById("simulateBtn")
    if (simulateBtn) {
      simulateBtn.addEventListener("click", () => {
        this.runSimulation()
      })
    }
  }

  updatePlantDisplay() {
    const plantVisual = document.getElementById("plantVisual")
    const plantTypes = {
      tropical: "🌴",
      desert: "🌵",
      temperate: "🌳",
    }

    if (plantVisual) {
      const plantEmoji = plantVisual.querySelector(".plant-pot")
      if (plantEmoji) {
        plantEmoji.textContent = plantTypes[this.currentPlantType] || "🌱"
      }
    }
  }

  async runSimulation() {
    try {
      const simulateBtn = document.getElementById("simulateBtn")
      const btnText = simulateBtn.querySelector(".btn-text")
      const btnLoader = simulateBtn.querySelector(".btn-loader")

      // Show loading state
      btnText.textContent = "Running Simulation..."
      btnLoader.style.display = "block"
      simulateBtn.disabled = true

      const sunlight = document.getElementById("sunlightSlider")?.value || 50
      const water = document.getElementById("waterSlider")?.value || 50
      const temperature = document.getElementById("temperatureSlider")?.value || 20
      const fertilizer = document.getElementById("fertilizerSlider")?.value || 50

      const response = await window.apiCall("/api/simulate-plant", {
        method: "POST",
        body: JSON.stringify({
          sunlight: Number.parseInt(sunlight),
          water: Number.parseInt(water),
          temperature: Number.parseInt(temperature),
          fertilizer: Number.parseInt(fertilizer),
          plant_type: this.currentPlantType,
          simulation_days: this.simulationDays,
        }),
      })

      if (response.success) {
        this.currentSimulationData = response
        this.updateHealthMetrics(response.health)
        this.updateGrowthChart(response.growth_progression)
        this.updateScientificAnalysis(response.scientific_analysis)
        this.updateRecommendations(response.recommendations)
        this.updatePlantStatus(response.status, response.plant_info)
        this.showResults()
      } else {
        window.showToast("Simulation failed: " + response.error, "error")
      }
    } catch (error) {
      console.error("Simulation failed:", error)
      window.showToast("Simulation failed. Please try again.", "error")
    } finally {
      // Reset button state
      const simulateBtn = document.getElementById("simulateBtn")
      const btnText = simulateBtn.querySelector(".btn-text")
      const btnLoader = simulateBtn.querySelector(".btn-loader")
      btnText.textContent = "Run Advanced Simulation"
      btnLoader.style.display = "none"
      simulateBtn.disabled = false
    }
  }

  updateHealthMetrics(health) {
    const metrics = [
      { key: "sunlight", label: "Photosynthesis Efficiency" },
      { key: "water", label: "Water Use Efficiency" },
      { key: "temperature", label: "Thermal Stress Resistance" },
      { key: "fertilizer", label: "Nutrient Uptake" },
    ]

    metrics.forEach((metric) => {
      const barElement = document.getElementById(`${metric.key}Bar`)
      const valueElement = document.getElementById(`${metric.key}Value`)
      const value = health[metric.key] || 0

      if (barElement) {
        barElement.style.width = `${value}%`
        // Color based on health
        if (value >= 80) {
          barElement.style.background = "linear-gradient(90deg, #16a34a, #22c55e)"
        } else if (value >= 50) {
          barElement.style.background = "linear-gradient(90deg, #f59e0b, #fbbf24)"
        } else {
          barElement.style.background = "linear-gradient(90deg, #ef4444, #f87171)"
        }
      }

      if (valueElement) {
        valueElement.textContent = `${value}%`
      }
    })

    // Update overall health
    const overallHealth = document.getElementById("overallHealth")
    if (overallHealth) {
      overallHealth.textContent = `${health.overall}%`
    }
  }

  updateGrowthChart(growthProgression) {
    const canvas = document.getElementById("growthCanvas")
    if (!canvas || !growthProgression) return

    const ctx = canvas.getContext("2d")

    // Destroy existing chart if it exists
    if (this.growthChart) {
      this.growthChart.destroy()
    }

    const labels = growthProgression.map((day) => `Day ${day.day}`)
    const heightData = growthProgression.map((day) => day.height)
    const biomassData = growthProgression.map((day) => day.biomass)
    const healthData = growthProgression.map((day) => day.health)

    this.growthChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Height (cm)",
            data: heightData,
            borderColor: "#16a34a",
            backgroundColor: "rgba(22, 163, 74, 0.1)",
            tension: 0.4,
            yAxisID: "y",
          },
          {
            label: "Biomass (g)",
            data: biomassData,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            yAxisID: "y1",
          },
          {
            label: "Health (%)",
            data: healthData,
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            tension: 0.4,
            yAxisID: "y2",
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Time (Days)",
            },
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Height (cm)",
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Biomass (g)",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y2: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Health (%)",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: "Plant Growth Progression",
          },
          legend: {
            display: true,
            position: "top",
          },
        },
      },
    })
  }

  updateScientificAnalysis(analysis) {
    const analysisGrid = document.getElementById("analysisGrid")
    if (!analysisGrid || !analysis) return

    const analysisItems = [
      {
        title: "Photosynthesis Rate",
        value: analysis.photosynthesis_rate,
        unit: "μmol/m²/s",
        icon: "☀️",
        description: "Rate of carbon fixation",
      },
      {
        title: "Water Use Efficiency",
        value: analysis.water_use_efficiency,
        unit: "g CO₂/kg H₂O",
        icon: "💧",
        description: "Carbon gain per water loss",
      },
      {
        title: "Nutrient Uptake",
        value: analysis.nutrient_uptake,
        unit: "mg/g",
        icon: "🧪",
        description: "Nutrient absorption rate",
      },
      {
        title: "Stress Resistance",
        value: analysis.stress_resistance,
        unit: "index",
        icon: "🛡️",
        description: "Environmental stress tolerance",
      },
      {
        title: "Biomass Production",
        value: analysis.biomass_production,
        unit: "g",
        icon: "🌱",
        description: "Total dry matter production",
      },
      {
        title: "Height Growth",
        value: analysis.height_growth,
        unit: "cm",
        icon: "📏",
        description: "Vertical growth achieved",
      },
      {
        title: "Leaf Area Index",
        value: analysis.leaf_area_index,
        unit: "m²/m²",
        icon: "🍃",
        description: "Leaf area per ground area",
      },
      {
        title: "Root Mass Ratio",
        value: analysis.root_mass_ratio,
        unit: "ratio",
        icon: "🌿",
        description: "Root to shoot mass ratio",
      },
    ]

    analysisGrid.innerHTML = analysisItems
      .map(
        (item) => `
        <div class="analysis-item">
          <div class="analysis-header">
            <span class="analysis-icon">${item.icon}</span>
            <h4>${item.title}</h4>
          </div>
          <div class="analysis-value">
            <span class="value-number">${item.value}</span>
            <span class="value-unit">${item.unit}</span>
          </div>
          <p class="analysis-description">${item.description}</p>
        </div>
      `
      )
      .join("")
  }

  updateRecommendations(recommendations) {
    const recommendationsList = document.getElementById("recommendationsList")
    if (!recommendationsList || !recommendations) return

    recommendationsList.innerHTML = recommendations
      .map(
        (rec) => `
        <div class="recommendation-item ${rec.type}">
          <div class="recommendation-header">
            <span class="recommendation-icon">${rec.icon}</span>
            <span class="recommendation-impact">${rec.impact}</span>
          </div>
          <p class="recommendation-text">${rec.text}</p>
        </div>
      `
      )
      .join("")
  }

  updatePlantStatus(status, plantInfo) {
    const plantStatus = document.getElementById("plantStatus")
    const statusText = plantStatus.querySelector(".status-text")

    if (statusText) {
      statusText.textContent = `${plantInfo.name}: ${status}`

      // Update status color
      plantStatus.className = "plant-status"
      if (status === "Thriving") {
        plantStatus.classList.add("thriving")
      } else if (status === "Struggling") {
        plantStatus.classList.add("struggling")
      } else {
        plantStatus.classList.add("critical")
      }
    }
  }

  showResults() {
    const elements = [
      "healthMetrics",
      "growthChart",
      "scientificAnalysis",
      "recommendations",
    ]

    elements.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        element.style.display = "block"
      }
    })
  }

  // Scientific Journal Functions
  async loadJournalEntries() {
    try {
      const response = await window.apiCall("/api/get-scientific-journals")
      if (response.success) {
        this.displayJournalEntries(response.entries)
      }
    } catch (error) {
      console.error("Failed to load journal entries:", error)
    }
  }

  displayJournalEntries(entries) {
    const journalEntries = document.getElementById("journalEntries")
    if (!journalEntries) return

    if (entries.length === 0) {
      journalEntries.innerHTML = `
        <div class="empty-journal">
          <span class="empty-icon">📚</span>
          <p>No research publications yet</p>
          <p>Start your first scientific study!</p>
        </div>
      `
      return
    }

    journalEntries.innerHTML = entries
      .map(
        (entry) => `
        <div class="journal-entry">
          <div class="entry-header">
            <h4 class="entry-title">${entry.title}</h4>
            <span class="entry-status ${entry.status}">${entry.status}</span>
          </div>
          <p class="entry-abstract">${entry.abstract}</p>
          <div class="entry-meta">
            <span class="entry-date">${new Date(entry.timestamp).toLocaleDateString()}</span>
            <span class="entry-tags">${entry.tags.join(", ")}</span>
          </div>
          <div class="entry-actions">
            <button onclick="editJournalEntry('${entry.id}')" class="btn-secondary">Edit</button>
            <button onclick="viewJournalEntry('${entry.id}')" class="btn-primary">View</button>
          </div>
        </div>
      `
      )
      .join("")
  }

  async saveJournalEntry(isDraft = false) {
    try {
      const formData = new FormData(document.getElementById("journalForm"))
      const data = {
        title: formData.get("title"),
        abstract: formData.get("abstract"),
        hypothesis: formData.get("hypothesis"),
        methodology: formData.get("methodology"),
        results: formData.get("results"),
        conclusions: formData.get("conclusions"),
        tags: formData.get("tags"),
        plant_type: this.currentPlantType,
        environmental_conditions: this.currentSimulationData?.health || {},
        measurements: this.currentSimulationData?.scientific_analysis || {},
        is_draft: isDraft,
      }

      const response = await window.apiCall("/api/add-scientific-journal", {
        method: "POST",
        body: JSON.stringify(data),
      })

      if (response.success) {
        window.showToast(
          `Research ${isDraft ? "saved as draft" : "published"} successfully!`,
          "success"
        )
        this.closeJournalModal()
        this.loadJournalEntries()
      } else {
        window.showToast("Failed to save research: " + response.error, "error")
      }
    } catch (error) {
      console.error("Failed to save journal entry:", error)
      window.showToast("Failed to save research. Please try again.", "error")
    }
  }
}

// Global functions for journal modal
function openJournalModal() {
  const modal = document.getElementById("journalModal")
  if (modal) {
    modal.style.display = "flex"
  }
}

function closeJournalModal() {
  const modal = document.getElementById("journalModal")
  if (modal) {
    modal.style.display = "none"
    document.getElementById("journalForm").reset()
  }
}

function saveAsDraft() {
  window.simulationInstance.saveJournalEntry(true)
}

function toggleJournalPanel() {
  const panel = document.getElementById("journalPanel")
  if (panel) {
    panel.style.display = panel.style.display === "none" ? "block" : "none"
  }
}

// Form submission
document.addEventListener("DOMContentLoaded", () => {
  const journalForm = document.getElementById("journalForm")
  if (journalForm) {
    journalForm.addEventListener("submit", (e) => {
      e.preventDefault()
      window.simulationInstance.saveJournalEntry(false)
    })
  }
})

// Initialize global instance
window.simulationInstance = null
document.addEventListener("DOMContentLoaded", () => {
  window.simulationInstance = new AdvancedPlantSimulation()
})
