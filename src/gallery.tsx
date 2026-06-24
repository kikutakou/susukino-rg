import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GalleryPage from './GalleryPage.tsx'
import './index.css'

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <GalleryPage />
    </StrictMode>,
  )
}
