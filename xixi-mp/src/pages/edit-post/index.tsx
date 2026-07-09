import { useState, useEffect } from 'react'
import { View, Text, Input, Textarea, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { request, uploadFile } from '../../utils/request'
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
      } catch (err: any) { setError(err.message || '\u52a0\u8f7d\u5931\u8d25') }
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
    if (!content.trim()) { setError('\u8bf7\u8f93\u5165\u5185\u5bb9'); return }
    setSubmitting(true); setError('')
    try {
      await request('/api/posts/' + id, {
        method: 'PUT',
        body: JSON.stringify({ title: title.trim(), content, is_pinned: isPinned ? 1 : 0 })
      })
      // Upload new images
      for (const f of newFiles) {
        await uploadFile(`/api/posts/${id}/images`, f, null, 'images')
      }
      Taro.navigateBack()
    } catch (err: any) { setError(err.message || '\u66f4\u65b0\u5931\u8d25'); setSubmitting(false) }
  }

  if (loading) return <View className='compose-page'><View className='loading'><View /><View /></View></View>

  return (
    <View className='compose-page'>
      <View className='compose-nav'>
        <Text className='compose-cancel' onClick={() => Taro.navigateBack()}>\u53d6\u6d88</Text>
        <Text className='compose-title-text'>\u7f16\u8f91\u52a8\u6001</Text>
        <Text className='compose-submit' onClick={handleSubmit}>{submitting ? '\u4fdd\u5b58\u4e2d' : '\u4fdd\u5b58'}</Text>
      </View>
      {error && <Text className='compose-error'>{error}</Text>}
      <View className='compose-card'>
        <Input className='compose-input' placeholder='\u6807\u9898\uff08\u53ef\u9009\uff09' value={title} onInput={e => setTitle(e.detail.value)} />
        <Textarea className='compose-textarea' placeholder='\u6b64\u523b\u7684\u60f3\u6cd5...' value={content} onInput={e => setContent(e.detail.value)} autoHeight />
        {existingImages.length > 0 && (
          <View className='compose-images'>
            {existingImages.map((url, i) => (
              <View key={'old-'+i} className='compose-img-wrap'><Image src={url} mode='aspectFill' className='compose-img' /><View className='compose-img-remove' onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}>\u2716</View></View>
            ))}
          </View>
        )}
        {newFiles.length > 0 && (
          <View className='compose-images'>
            {newFiles.map((f, i) => (
              <View key={'new-'+i} className='compose-img-wrap'><Image src={f} mode='aspectFill' className='compose-img' /><View className='compose-img-remove' onClick={() => setNewFiles(prev => prev.filter((_, idx) => idx !== i))}>\u2716</View></View>
            ))}
          </View>
        )}
      </View>
      <View className='compose-toolbar'>
        <View className='toolbar-btn' onClick={chooseImages}><Text>\ud83d\uddbc</Text><Text className='toolbar-label'>\u56fe\u7247</Text></View>
        <View className={'toolbar-btn ' + (isPinned ? 'active' : '')} onClick={() => setIsPinned(!isPinned)}><Text>\ud83d\udccc</Text><Text className='toolbar-label'>{isPinned ? '\u5df2\u7f6e\u9876' : '\u7f6e\u9876'}</Text></View>
      </View>
    </View>
  )
}
