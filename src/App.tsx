import { useState } from 'react'
import './App.css'
import itemsData from './data.json'

interface CostumeItem {
  id: number
  title: string
  frontImage: string
  backImage: string
  comment: string
}

const items: CostumeItem[] = itemsData

function App() {
  const [selectedItem, setSelectedItem] = useState<CostumeItem | null>(null)

  const closeModal = () => setSelectedItem(null)

  return (
    <div className="app">
      <header className="header">
        <h1>衣装ギャラリー</h1>
        <p className="subtitle">新体操衣装の貸し出し一覧</p>
      </header>

      <main className="gallery">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            className="card"
            onClick={() => setSelectedItem(item)}
          >
            <div className="card-images">
              <img
                src={item.frontImage}
                alt={`${item.title} 表`}
                className="card-image"
              />
            </div>
            <div className="card-content">
              <h2 className="card-title">{item.title}</h2>
              <p className="card-comment">{item.comment}</p>
            </div>
          </button>
        ))}
      </main>

      {selectedItem && (
        <dialog
          className="modal-overlay"
          onClick={closeModal}
          onKeyDown={(e) => e.key === 'Escape' && closeModal()}
          open
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button type="button" className="modal-close" onClick={closeModal}>
              ×
            </button>
            <h2 className="modal-title">{selectedItem.title}</h2>
            <div className="modal-images">
              <figure>
                <img
                  src={selectedItem.frontImage}
                  alt={`${selectedItem.title} 表`}
                />
                <figcaption>表</figcaption>
              </figure>
              <figure>
                <img
                  src={selectedItem.backImage}
                  alt={`${selectedItem.title} 裏`}
                />
                <figcaption>裏</figcaption>
              </figure>
            </div>
            <div className="modal-comment">
              <h3>所有者さんからのコメント</h3>
              <p>{selectedItem.comment}</p>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

export default App
