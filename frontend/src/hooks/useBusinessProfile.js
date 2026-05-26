import React from 'react'

const STORAGE_KEY = 'columbus_business_profile'

export const EMPTY_PROFILE = {
  business_name: '',
  contact_name: '',
  zip: '',
  address: '',
  tel: '',
  email: '',
}

export function useBusinessProfile() {
  const [profile, setProfile] = React.useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const saveProfile = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setProfile(data)
  }

  const clearProfile = () => {
    localStorage.removeItem(STORAGE_KEY)
    setProfile(null)
  }

  return { profile, saveProfile, clearProfile }
}

/** プロフィールを Claude に渡す company_name 形式にフォーマットする */
export function formatProfileForPrompt(profile) {
  if (!profile || !profile.business_name) return ''
  const lines = [
    profile.business_name,
    profile.contact_name ? `担当: ${profile.contact_name}` : null,
    profile.zip && profile.address
      ? `〒${profile.zip} ${profile.address}`
      : profile.address || null,
    profile.tel ? `TEL: ${profile.tel}` : null,
    profile.email ? `E-mail: ${profile.email}` : null,
  ]
  return lines.filter(Boolean).join('\n')
}
