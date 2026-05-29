const HISTORY_KEY = 'columbus_estimate_history'
const MAX_HISTORY = 10

export function useEstimateHistory() {
  const getHistory = () => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  const saveEstimate = (data) => {
    const history = getHistory()
    const entry = {
      ...data,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
    }
    const newHistory = [entry, ...history].slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
  }

  const deleteEstimate = (id) => {
    const history = getHistory()
    const newHistory = history.filter((e) => e.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
  }

  return { getHistory, saveEstimate, deleteEstimate }
}
