import { useEffect, useState, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request, resolveImageUrl } from '../../utils/request'
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
    } catch (err: any) { setError(err.message || '加载失败') }
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
      {/* Hero Section */}
      <View className='home-hero'>
        <View className='home-hero-decoration'></View>
        <View className='home-header-row'>
          <View className='home-logo'>
            <Text className='home-logo-icon'>熙</Text>
          </View>
          <View className='home-header-text'>
            <Text className='home-title'>熙熙小窝</Text>
            <Text className='home-subtitle'>Our Little World</Text>
          </View>
        </View>

        {homeData && (
          <View className='home-stats'>
            <View className='home-stat-item'>
              <Text className='home-stat-label'>Together For</Text>
              <Text className='home-stat-num'>{homeData.days_together}</Text>
              <Text className='home-stat-unit'>天 · 在一起</Text>
            </View>
            <View className='home-stat-divider'>
              <View className='home-stat-divider-line'></View>
              <View className='home-stat-divider-dot'></View>
              <View className='home-stat-divider-line'></View>
            </View>
            <View className='home-stat-item'>
              <Text className='home-stat-label'>Next Chapter</Text>
              <Text className='home-stat-anniv'>{homeData.next_anniversary ? homeData.next_anniversary.title : '纪念日'}</Text>
              <View className='home-stat-days-row'>
                <Text className='home-stat-days'>{homeData.next_anniversary ? homeData.next_anniversary.days_left : 0}</Text>
                <Text className='home-stat-days-unit'>天</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Posts Feed */}
      <View className='home-posts'>
        {error && (
          <View className='home-error'>
            <Text>{error}</Text>
            <Text className='home-retry' onClick={() => fetchData()}>重试</Text>
          </View>
        )}
        {loading ? (
          <View className='home-skeleton'>
            <View className='skeleton-card'><View className='skeleton-avatar' /><View className='skeleton-lines'><View className='skeleton-line' /><View className='skeleton-line short' /></View></View>
            <View className='skeleton-card'><View className='skeleton-avatar' /><View className='skeleton-lines'><View className='skeleton-line' /><View className='skeleton-line short' /></View></View>
          </View>
        ) : posts.length === 0 ? (
          <View className='home-empty'>
            <Text className='home-empty-icon'>📝</Text>
            <Text className='home-empty-title'>还没有动态</Text>
            <Text className='home-empty-sub'>点击右下角按钮，记录美好时光</Text>
          </View>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} onDelete={handleDelete} onTogglePin={handleTogglePin} />)
        )}
      </View>

      {/* FAB - New Post Button */}
      <View className='fab' onClick={() => Taro.navigateTo({ url: '/pages/compose/index' })}>
        <Text className='fab-icon'>+</Text>
      </View>
    </View>
  )
}
