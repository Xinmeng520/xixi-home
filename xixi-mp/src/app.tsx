import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import './app.css'

function App({ children }) {
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const token = Taro.getStorageSync('token')
    if (token) {
      setAuthed(true)
    }
    setReady(true)
  }, [])

  if (!ready) return null

  return children
}

export default App
