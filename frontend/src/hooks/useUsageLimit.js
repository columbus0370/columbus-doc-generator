const STORAGE_KEY = 'columbus_usage'

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { count: 0, month: getCurrentMonth(), accessKey: null }
    const data = JSON.parse(raw)
    if (data.month !== getCurrentMonth()) {
      return { count: 0, month: getCurrentMonth(), accessKey: data.accessKey ?? null }
    }
    return data
  } catch {
    return { count: 0, month: getCurrentMonth(), accessKey: null }
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getUsage() {
  const data = load()
  return {
    count: data.count,
    limit: 3,
    isUnlimited: !!data.accessKey,
  }
}

export function increment() {
  const data = load()
  save({ ...data, count: data.count + 1 })
}

export function setAccessKey(key) {
  const data = load()
  save({ ...data, accessKey: key })
}

export function isUnlimited() {
  return !!load().accessKey
}
