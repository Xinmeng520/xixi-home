import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import { HomeData, Post } from '../../utils/types'
import PostCard from '../../components/PostCard'
import Icon from '../../components/Icon'
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

  return (
    <View className='home-page'>
      {/* Literary Header */}
      <View className='home-hero'>
        <View className='home-hero-bg'></View>
        <View className='home-header-row'>
          <View className='home-logo'>
            <Icon name='logo' size={28} color='#fff' />
          </View>
          <View>
            <Text className='home-title'>熙熙小窝</Text>
            <Text className='home-subtitle'>Our Little World</Text>
          </View>
        </View>

        {homeData && (
          <View className='home-stats-card'>
            <View className='home-stat-left'>
              <Text className='home-stat-label'>Together For</Text>
              <Text className='home-stat-num'>{homeData.days_together}</Text>
              <Text className='home-stat-unit'>天 · 在一起</Text>
            </View>
            <View className='home-stat-divider'>
              <View className='home-stat-divider-line'></View>
              <View className='home-stat-divider-dot'></View>
              <View className='home-stat-divider-line'></View>
            </View>
            <View className='home-stat-right'>
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
            <Text className='home-error-text'>{error}</Text>
            <Text className='home-retry' onClick={() => fetchData()}>重试</Text>
          </View>
        )}
        {loading ? (
          <View className='home-skeleton'>
            <View className='skeleton-card'>
              <View className='skeleton-avatar' />
              <View className='skeleton-lines'>
                <View className='skeleton-line' />
                <View className='skeleton-line short' />
              </View>
            </View>
            <View className='skeleton-card'>
              <View className='skeleton-avatar' />
              <View className='skeleton-lines'>
                <View className='skeleton-line' />
                <View className='skeleton-line short' />
              </View>
            </View>
          </View>
        ) : posts.length === 0 ? (
          <View className='home-empty'>
            <View className='home-empty-icon'>
              <Icon name='image' size={40} color='#fdba74' />
            </View>
            <Text className='home-empty-title'>暂无动态</Text>
            <Text className='home-empty-sub'>发第一条动态记录美好吧</Text>
          </View>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} onDelete={handleDelete} onTogglePin={handleTogglePin} />)
        )}
      </View>

      {/* FAB */}
      <View className='fab' onClick={() => Taro.navigateTo({ url: '/pages/compose/index' })}>
        <Icon name='add' size={32} color='#fff' />
      </View>
    </View>
  )
}
