import { useCallback, useEffect, useState } from 'react'
import { decryptData, verifyPassword } from './crypto'
import encryptedData from './encryptedData.json'
import passwordHash from './passwordHash.json'

interface CostumeItem {
  id: number
  title: string
  frontImage: string
  backImage: string | null
  comment: string
}

function PasswordScreen({
  onUnlock,
}: {
  onUnlock: (items: CostumeItem[]) => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const isValid = await verifyPassword(password, passwordHash)
      if (!isValid) {
        setError('パスワードが正しくありません')
        setIsLoading(false)
        return
      }

      const items = await decryptData<CostumeItem[]>(password, encryptedData)
      onUnlock(items)
    } catch {
      setError('認証に失敗しました')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-violet-400">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">衣装ギャラリー</h1>
          <p className="text-gray-600 mt-2">閲覧にはパスワードが必要です</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="パスワードを入力"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '認証中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Gallery({ items }: { items: CostumeItem[] }) {
  const [selectedItem, setSelectedItem] = useState<CostumeItem | null>(null)

  const closeModal = useCallback(() => setSelectedItem(null), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    if (selectedItem) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedItem, closeModal])

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

function App() {
  const [items, setItems] = useState<CostumeItem[] | null>(null)

  if (!items) {
    return <PasswordScreen onUnlock={setItems} />
  }

  return <Gallery items={items} />
}

export default App
