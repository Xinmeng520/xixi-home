import { useState } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import type { Post } from '../../utils/types'
import './index.css'

interface Props {
  post: Post
  currentUser: number
  onDelete: (id: number) => void
  onTogglePin: (id: number, isPinned: number) => void
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '\u521a\u521a'
  if (mins < 60) return mins + '\u5206\u949f\u524d'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + '\u5c0f\u65f6\u524d'
  const days = Math.floor(hours / 24)
  if (days < 30) return days + '\u5929\u524d'
  return (date.getMonth() + 1) + '\u6708' + date.getDate() + '\u65e5'
}

export default function PostCard({ post, currentUser, onDelete, onTogglePin }: Props) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const isAuthor = post.author.id === currentUser

  const toggleLike = async () => {
    try {
      const data = await request<{ liked: boolean; like_count: number }>('/api/posts/' + post.id + '/like', { method: 'POST' })
      setLiked(data.liked)
      setLikeCount(data.like_count)
    } catch (e) {}
  }

  const loadComments = async () => {
    try {
      const data = await request<any[]>('/api/posts/' + post.id + '/comments')
      setComments(data)
    } catch (e) {}
  }

  const toggleComments = () => {
    if (!showComments) loadComments()
    setShowComments(!showComments)
  }

  const submitComment = async () => {
    if (!commentText.trim()) return
    try {
      await request('/api/posts/' + post.id + '/comments', { method: 'POST', body: JSON.stringify({ content: commentText.trim() }) })
      setCommentText('')
      loadComments()
    } catch (e) {}
  }

  const handleDelete = async () => {
    const res = await Taro.showModal({ title: '\u63d0\u793a', content: '\u786e\u5b9a\u5220\u9664\u8fd9\u6761\u52a8\u6001\u5417\uff1f' })
    if (!res.confirm) return
    try { await request('/api/posts/' + post.id, { method: 'DELETE' }); onDelete(post.id) } catch (e) {}
  }

  const togglePin = async () => {
    try {
      const data = await request<{ is_pinned: number }>('/api/posts/' + post.id + '/pin', { method: 'POST' })
      onTogglePin(post.id, data.is_pinned)
    } catch (e) {}
  }

  return (
    <View className='post-card'>
      {post.is_pinned === 1 && <View className='post-pinned'>\u7f6e\u9876</View>}
      <View className='post-header'>
        <View className='post-avatar'>
          {post.author.avatar
            ? <Image src={post.author.avatar} mode='aspectFill' className='avatar-img' />
            : <Text className='avatar-text'>{post.author.nickname.charAt(0)}</Text>
          }
        </View>
        <View className='post-meta'>
          <Text className='post-author'>{post.author.nickname}</Text>
          <Text className='post-time'>{formatTime(post.created_at)}</Text>
        </View>
        {isAuthor && (
          <View className='post-menu-wrap'>
            <View className='post-menu-btn' onClick={() => setShowMenu(!showMenu)}>
              <View className='dot'></View><View className='dot'></View><View className='dot'></View>
            </View>
            {showMenu && (
              <View className='post-menu-dropdown'>
                <View className='menu-item' onClick={() => { setShowMenu(false); Taro.navigateTo({ url: '/src/pages/edit-post/index?id=' + post.id }) }}>\u7f16\u8f91</View>
                <View className='menu-item' onClick={() => { setShowMenu(false); togglePin() }}>{post.is_pinned === 1 ? '\u53d6\u6d88\u7f6e\u9876' : '\u7f6e\u9876'}</View>
                <View className='menu-item danger' onClick={() => { setShowMenu(false); handleDelete() }}>\u5220\u9664</View>
              </View>
            )}
          </View>
        )}
      </View>

      {post.content && <Text className='post-content'>{post.content}</Text>}

      {post.images && post.images.length > 0 && (
        <View className={'post-images img-count-' + (post.images.length === 1 ? '1' : post.images.length === 2 ? '2' : '3')}>
          {post.images.slice(0, 9).map((img, i) => (
            <View key={i} className='post-img-wrap' onClick={() => {
              Taro.previewImage({ urls: post.images.map((x: any) => x.image_url), current: img.image_url })
            }}>
              <Image src={img.image_url} mode='aspectFill' className='post-img' />
            </View>
          ))}
        </View>
      )}

      <View className='post-actions'>
        <View className={'action-btn ' + (liked ? 'liked' : '')} onClick={toggleLike}>
          <Text className='action-icon'>{liked ? '\u2764' : '\u2661'}</Text>
          <Text className='action-count'>{likeCount}</Text>
        </View>
        <View className='action-btn' onClick={toggleComments}>
          <Text className='action-icon'>\u2709</Text>
          <Text className='action-count'>{post.comment_count}</Text>
        </View>
      </View>

      {showComments && (
        <View className='post-comments'>
          {comments.length === 0
            ? <Text className='no-comments'>\u8fd8\u6ca1\u6709\u8bc4\u8bba</Text>
            : comments.map(c => (
              <View key={c.id} className='comment-item'>
                <Text className='comment-author'>{c.author.nickname}</Text>
                <Text className='comment-text'>{c.content}</Text>
              </View>
            ))
          }
          <View className='comment-input-row'>
            <Input className='comment-input' placeholder='\u5199\u4e0b\u4f60\u7684\u8bc4\u8bba...' value={commentText} onInput={e => setCommentText(e.detail.value)} confirm-type='send' onConfirm={submitComment} />
            <View className='comment-send' onClick={submitComment}>
              <Text>\u53d1\u9001</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
