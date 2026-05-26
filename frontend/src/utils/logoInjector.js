export function injectLogo(htmlString, logoDataUrl) {
  if (!logoDataUrl) return htmlString
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')

  const img = doc.createElement('img')
  img.src = logoDataUrl
  img.className = 'doc-logo'
  img.alt = 'ロゴ'

  const logoArea = doc.querySelector('.doc-logo-area')
  if (logoArea) {
    logoArea.appendChild(img)
  } else {
    const wrapper = doc.createElement('div')
    wrapper.style.marginBottom = '12px'
    const fallbackImg = doc.createElement('img')
    fallbackImg.src = logoDataUrl
    fallbackImg.style.cssText = 'max-height:60px;max-width:200px;object-fit:contain;display:block;'
    fallbackImg.alt = 'ロゴ'
    wrapper.appendChild(fallbackImg)

    const docEl = doc.querySelector('.doc')
    if (docEl) {
      docEl.insertBefore(wrapper, docEl.firstChild)
    } else {
      doc.body.insertBefore(wrapper, doc.body.firstChild)
    }
  }

  return '<!DOCTYPE html>' + doc.documentElement.outerHTML
}
