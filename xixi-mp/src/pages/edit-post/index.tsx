import { useState, useEffect } from 'react'
import { View, Text, Input, Textarea, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { request, uploadFile } from '../../utils/request'
import Icon from '../../components/Icon'
import './index.css'

export default function EditPostPage() {
  const router = useRouter()
  const id = router.params.id
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<string[]>([])
  const [isPinned, setIsPinned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post: any = await request('/api/posts/' + id)
        setTitle(post.title || '')
        setContent(post.content)
        setExistingImages((post.images || []).map((img: any) => img.image_url))
        setIsPinned(post.is_pinned === 1)
      } catch (err: any) { setError(err.message || '加载失败') }
      finally { setLoading(false) }
    }
    if (id) fetchPost()
  }, [id])

  const chooseImages = async () => {
    const remain = 9 - existingImages.length - newFiles.length
    if (remain <= 0) return
    const res = await Taro.chooseMedia({ count: remain, mediaType: ['image'], sourceType: ['album', 'camera'] })
    setNewFiles(prev => [...prev, ...res.tempFiles.map((f: any) => f.tempFilePath)].slice(0, 9))
  }

  const handleSubmit = async () => {
    if (!content.trim()) { setError('请输入内容'); return }
    setSubmitting(true); setError('')
    try {
      await request('/api/posts/' + id, {
        method: 'PUT',
        body: JSON.stringify({ title: title.trim(), content, is_pinned: isPinned ? 1 : 0 })
      })
      for (const f of newFiles) {
        await uploadFile(`/api/posts/${id}/images`, f, null, 'images')
      }
      Taro.navigateBack()
    } catch (err: any) { setError(err.message || '更新失败'); setSubmitting(false) }
  }

  if (loading) return <View className='compose-page'><View className='loading'><View /><View /></View></View>

  return (
    <View className='compose-page'>
      <View className='compose-nav'>
        <Text className='compose-cancel' onClick={() => Taro.navigateBack()}>取消</Text>
        <Text className='compose-title-text'>编辑动态</Text>
        <Text className='compose-submit' onClick={handleSubmit}>{submitting ? '保存中' : '保存'}</Text>
      </View>
      {error && <Text className='compose-error'>{error}</Text>}
      <View className='compose-card'>
        <Input className='compose-input' placeholder='标题（可选）' value={title} onInput={e => setTitle(e.detail.value)} />
        <Textarea className='compose-textarea' placeholder='此刻的想法...' value={content} onInput={e => setContent(e.detail.value)} autoHeight />
        {existingImages.length > 0 && (
          <View className='compose-images'>
            {existingImages.map((url, i) => (
              <View key={'old-'+i} className='compose-img-wrap'><Image src={url} mode='aspectFill' className='compose-img' /><View className='compose-img-remove' onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}><Icon name='close' size={16} color='#fff' /></View></View>
            ))}
          </View>
        )}
        {newFiles.length > 0 && (
          <View className='compose-images'>
            {newFiles.map((f, i) => (
              <View key={'new-'+i} className='compose-img-wrap'><Image src={f} mode='aspectFill' className='compose-img' /><View className='compose-img-remove' onClick={() => setNewFiles(prev => prev.filter((_, idx) => idx !== i))}><Icon name='close' size={16} color='#fff' /></View></View>
            ))}
          </View>
        )}
      </View>
      <View className='compose-toolbar'>
        <View className='toolbar-btn' onClick={chooseImages}><Icon name='image' size={22} color='#f97316' /><Text className='toolbar-label'>图片</Text></View>
        <View className={'toolbar-btn ' + (isPinned ? 'active' : '')} onClick={() => setIsPinned(!isPinned)}><Icon name='pin' size={22} color={isPinned ? '#f97316' : '#999'} /><Text className='toolbar-label'>{isPinned ? '已置顶' : '置顶'}</Text></View>
      </View>
    </View>
  )
}
