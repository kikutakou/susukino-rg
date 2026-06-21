import { useState } from 'react'
import itemsData from './data.json'

interface CostumeItem {
  id: number
  title: string
  frontImage: string
  backImage: string | null
  comment: string
}

const items: CostumeItem[] = itemsData

function App() {
  const [selectedItem, setSelectedItem] = useState<CostumeItem | null>(null)

  const closeModal = () => setSelectedItem(null)

  return (
    <div className="min-h-screen p-8 max-sm:p-4 bg-violet-400 text-gray-800 font-sans">
      <header className="text-center mb-12 text-white">
        <h1 className="text-4xl max-sm:text-3xl font-bold drop-shadow-lg">
          衣装ギャラリー
        </h1>
        <p className="text-lg opacity-90 mt-2">新体操衣装の貸し出し一覧</p>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            className="flex flex-col items-stretch bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all duration-300 ease-out border-none p-0 text-left font-inherit text-inherit w-full hover:-translate-y-2 hover:shadow-2xl focus:outline-3 focus:outline-indigo-500 focus:outline-offset-2"
            onClick={() => setSelectedItem(item)}
          >
            <span className="shrink-0 block bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold py-1.5 px-3 text-center">
              No.{item.id}
            </span>
            <div className="shrink-0 w-full aspect-[3/4] overflow-hidden">
              <img
                src={item.frontImage}
                alt={`${item.title} 表`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {item.title}
              </h2>
              {item.comment && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.comment}
                </p>
              )}
            </div>
          </button>
        ))}
      </main>

      {selectedItem && (
        <dialog
          className="fixed inset-0 w-full h-full max-w-full max-h-full bg-black/80 flex items-center justify-center z-[1000] p-4 border-none"
          onClick={closeModal}
          onKeyDown={(e) => e.key === 'Escape' && closeModal()}
          open
        >
          <div
            className="bg-white rounded-2xl max-w-[900px] w-full max-h-[90vh] overflow-y-auto relative p-8 max-sm:p-6"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-4 right-4 w-10 h-10 border-none bg-gray-100 rounded-full text-2xl cursor-pointer flex items-center justify-center transition-colors hover:bg-gray-200"
              onClick={closeModal}
            >
              ×
            </button>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 pr-12">
              {selectedItem.title}
            </h2>
            <div
              className={`grid gap-6 mb-6 ${selectedItem.backImage ? 'grid-cols-2 max-sm:grid-cols-1' : 'grid-cols-1 max-w-[400px] mx-auto'}`}
            >
              <figure className="text-center">
                <img
                  src={selectedItem.frontImage}
                  alt={`${selectedItem.title} 表`}
                  className="w-full max-h-[400px] object-contain rounded-xl bg-gray-100"
                />
                <figcaption className="mt-2 text-sm text-gray-600">
                  表
                </figcaption>
              </figure>
              {selectedItem.backImage && (
                <figure className="text-center">
                  <img
                    src={selectedItem.backImage}
                    alt={`${selectedItem.title} 裏`}
                    className="w-full max-h-[400px] object-contain rounded-xl bg-gray-100"
                  />
                  <figcaption className="mt-2 text-sm text-gray-600">
                    裏
                  </figcaption>
                </figure>
              )}
            </div>
            {selectedItem.comment && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
                <h3 className="text-base text-indigo-500 mb-3">
                  所有者さんからのコメント
                </h3>
                <p className="text-base text-gray-800 leading-relaxed">
                  {selectedItem.comment}
                </p>
              </div>
            )}
          </div>
        </dialog>
      )}
    </div>
  )
}

export default App
