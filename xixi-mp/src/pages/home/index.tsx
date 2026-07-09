import { useEffect, useState, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import { HomeData, Post } from '../../utils/types'
import PostCard from '../../components/PostCard'
import './index.css'

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await request<HomeData>('/api/home')
      setHomeData(data)
      setPosts(data.latest_posts || [])
      const me = await request<{ id: number }>('/api/auth/me')
      setCurrentUser(me.id)
    } catch (err: any) { setError(err.message || '\u52a0\u8f7d\u5931\u8d25') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = (id: number) => { setPosts(prev => prev.filter(p => p.id !== id)) }
  const handleTogglePin = (id: number, isPinned: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, is_pinned: isPinned } : p).sort((a, b) => b.is_pinned - a.is_pinned))
  }

  const onPullDownRefresh = async () => { await fetchData(); Taro.stopPullDownRefresh() }

  return (
    <View className='home-page'>
      {/* Hero Header */}
      <View className='home-hero'>
        <View className='home-hero-bg'></View>
        <View className='home-header-row'>
          <View className='home-heart-icon'>
            <Text className='heart-symbol'>\u2764</Text>
          </View>
          <View>
            <Text className='home-title'>\u7199\u7199\u5c0f\u7a9d</Text>
            <Text className='home-subtitle'>Our Little World</Text>
          </View>
        </View>

        {homeData && (
          <View className='home-stats'>
            <View className='home-days-section'>
              <Text className='home-label-sm'>Together For</Text>
              <Text className='home-days-num'>{homeData.days_together}</Text>
              <Text className='home-days-unit'>\u5929 \u00b7 \u5728\u4e00\u8d77</Text>
            </View>

            <View className='home-divider'>
              <View className='home-divider-line'></View>
              <View className='home-divider-dot'></View>
              <View className='home-divider-line'></View>
            </View>

            <View className='home-anniv-section'>
              <Text className='home-label-sm'>Next Chapter</Text>
              <Text className='home-anniv-title'>{homeData.next_anniversary ? homeData.next_anniversary.title : '\u7eaa\u5ff5\u65e5'}</Text>
              <View className='home-anniv-days-row'>
                <Text className='home-anniv-days'>{homeData.next_anniversary ? homeData.next_anniversary.days_left : 0}</Text>
                <Text className='home-anniv-unit'>\u5929</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Posts */}
      <View className='home-posts'>
        {error && (
          <View className='home-error'>
            <Text>{error}</Text>
            <Text className='home-retry' onClick={() => fetchData()}>\u91cd\u8bd5</Text>
          </View>
        )}
        {loading ? (
          <View className='home-skeleton'>
            <View className='skeleton-card'><View className='skeleton-avatar' /><View className='skeleton-lines'><View className='skeleton-line' /><View className='skeleton-line short' /></View></View>
          </View>
        ) : posts.length === 0 ? (
          <View className='home-empty'>
            <Text className='empty-icon'>\u2728</Text>
            <Text>\u6682\u65e0\u52a8\u6001</Text>
            <Text className='empty-sub'>\u53d1\u7b2c\u4e00\u6761\u52a8\u6001\u8bb0\u5f55\u7f8e\u597d\u5427</Text>
          </View>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} onDelete={handleDelete} onTogglePin={handleTogglePin} />)
        )}
      </View>
    </View>
  )
}
