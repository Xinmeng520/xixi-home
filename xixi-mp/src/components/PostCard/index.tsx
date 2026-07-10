import { useState } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request, resolveImageUrl } from '../../utils/request'
import { Post } from '../../utils/types'
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
  if (mins < 1) return '刚刚'
  if (mins < 60) return mins + '分钟前'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + '小时前'
  const days = Math.floor(hours / 24)
  if (days < 30) return days + '天前'
  return (date.getMonth() + 1) + '月' + date.getDate() + '日'
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
    setShowMenu(false)
    const res = await Taro.showModal({ title: '提示', content: '确定删除这条动态吗？' })
    if (!res.confirm) return
    try { await request('/api/posts/' + post.id, { method: 'DELETE' }); onDelete(post.id) } catch (e) {}
  }

  const togglePin = async () => {
    setShowMenu(false)
    try {
      const data = await request<{ is_pinned: number }>('/api/posts/' + post.id + '/pin', { method: 'POST' })
      onTogglePin(post.id, data.is_pinned)
    } catch (e) {}
  }

  return (
    <View className='post-card'>
      {post.is_pinned === 1 && <View className='post-pinned-badge'>置顶</View>}

      {/* Header */}
      <View className='post-header'>
        <View className='post-avatar-wrap'>
          {post.author.avatar
            ? <Image src={resolveImageUrl(post.author.avatar)} mode='aspectFill' className='post-avatar' />
            : <Text className='post-avatar-text'>{post.author.nickname.charAt(0)}</Text>
          }
        </View>
        <View className='post-meta'>
          <Text className='post-author-name'>{post.author.nickname}</Text>
          <Text className='post-time'>{formatTime(post.created_at)}</Text>
        </View>
        {isAuthor && (
          <View className='post-menu'>
            <View className='post-menu-trigger' onClick={() => setShowMenu(!showMenu)}>
              <View className='post-menu-dot'></View>
              <View className='post-menu-dot'></View>
              <View className='post-menu-dot'></View>
            </View>
            {showMenu && (
              <View className='post-menu-dropdown'>
                <View className='post-menu-item' onClick={() => { setShowMenu(false); Taro.navigateTo({ url: '/pages/edit-post/index?id=' + post.id }) }}>
                  <Text>编辑</Text>
                </View>
                <View className='post-menu-item' onClick={togglePin}>
                  <Text>{post.is_pinned === 1 ? '取消置顶' : '置顶'}</Text>
                </View>
                <View className='post-menu-item danger' onClick={handleDelete}>
                  <Text>删除</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Content */}
      {post.content && <Text className='post-content'>{post.content}</Text>}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <View className={'post-images post-images-' + (post.images.length === 1 ? '1' : post.images.length === 2 ? '2' : '3')}>
          {post.images.slice(0, 9).map((img, i) => (
            <View key={i} className='post-image-item' onClick={() => {
              Taro.previewImage({ urls: post.images.map((x: any) => resolveImageUrl(x.image_url)), current: resolveImageUrl(img.image_url) })
            }}>
              <Image src={resolveImageUrl(img.image_url)} mode='aspectFill' className='post-image' />
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View className='post-actions'>
        <View className={'post-action ' + (liked ? 'liked' : '')} onClick={toggleLike}>
          <Text className='post-action-icon'>{liked ? '❤️' : '🤍'}</Text>
          <Text className='post-action-count'>{likeCount}</Text>
        </View>
        <View className='post-action' onClick={toggleComments}>
          <Text className='post-action-icon'>💬</Text>
          <Text className='post-action-count'>{post.comment_count}</Text>
        </View>
      </View>

      {/* Comments */}
      {showComments && (
        <View className='post-comments'>
          {comments.length === 0
            ? <Text className='post-comments-empty'>还没有评论</Text>
            : comments.map(c => (
              <View key={c.id} className='post-comment'>
                <Text className='post-comment-author'>{c.author.nickname}</Text>
                <Text className='post-comment-text'>{c.content}</Text>
              </View>
            ))
          }
          <View className='post-comment-input-row'>
            <Input className='post-comment-input' placeholder='写下你的评论...' value={commentText} onInput={e => setCommentText(e.detail.value)} confirm-type='send' onConfirm={submitComment} />
            <View className='post-comment-send' onClick={submitComment}>
              <Text>发送</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
