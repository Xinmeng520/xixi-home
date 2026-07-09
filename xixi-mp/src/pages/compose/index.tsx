import { useState } from 'react'
import { View, Text, Input, Textarea, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request, uploadFile } from '../../utils/request'
import './index.css'

export default function ComposePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const [isPinned, setIsPinned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const chooseImages = async () => {
    const remain = 9 - files.length
    if (remain <= 0) return
    const res = await Taro.chooseMedia({ count: remain, mediaType: ['image'], sourceType: ['album', 'camera'] })
    setFiles(prev => [...prev, ...res.tempFiles.map((f: any) => f.tempFilePath)].slice(0, 9))
  }

  const removeFile = (idx: number) => { setFiles(prev => prev.filter((_, i) => i !== idx)) }

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) { setError('记录点什么吧'); return }
    setSubmitting(true); setError('')
    try {
      // Step 1: Create post with text content
      const postRes: any = await request('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), content, is_pinned: isPinned ? 1 : 0 })
      })
      // Step 2: Upload images one by one
      if (files.length > 0 && postRes && postRes.id) {
        for (const f of files) {
          await uploadFile(`/api/posts/${postRes.id}/images`, f, null, 'images')
        }
      }
      Taro.navigateBack()
    } catch (err: any) { setError(err.message || '发布失败'); setSubmitting(false) }
  }

  return (
    <View className='compose-page'>
      <View className='compose-nav'>
        <Text className='compose-cancel' onClick={() => Taro.navigateBack()}>取消</Text>
        <Text className='compose-title-text'>记录我们的点点滴滴</Text>
        <Text className='compose-submit' onClick={handleSubmit}>{submitting ? '发布中' : '发布'}</Text>
      </View>
      {error && <Text className='compose-error'>{error}</Text>}
      <View className='compose-card'>
        <Input className='compose-input' placeholder='标题（可选）' value={title} onInput={e => setTitle(e.detail.value)} />
        <Textarea className='compose-textarea' placeholder='此刻的想法...' value={content} onInput={e => setContent(e.detail.value)} autoHeight />
        {files.length > 0 && (
          <View className='compose-images'>
            {files.map((f, i) => (
              <View key={i} className='compose-img-wrap'><Image src={f} mode='aspectFill' className='compose-img' /><View className='compose-img-remove' onClick={() => removeFile(i)}>✖</View></View>
            ))}
          </View>
        )}
      </View>
      <View className='compose-toolbar'>
        <View className='toolbar-btn' onClick={chooseImages}><Text>🖼</Text><Text className='toolbar-label'>图片</Text></View>
        <View className={'toolbar-btn ' + (isPinned ? 'active' : '')} onClick={() => setIsPinned(!isPinned)}><Text>📌</Text><Text className='toolbar-label'>{isPinned ? '已置顶' : '置顶'}</Text></View>
      </View>
    </View>
  )
}
