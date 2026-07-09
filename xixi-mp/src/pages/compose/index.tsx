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
    if (!content.trim() && files.length === 0) { setError('\u8bb0\u5f55\u70b9\u4ec0\u4e48\u5427'); return }
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
    } catch (err: any) { setError(err.message || '\u53d1\u5e03\u5931\u8d25'); setSubmitting(false) }
  }

  return (
    <View className='compose-page'>
      <View className='compose-nav'>
        <Text className='compose-cancel' onClick={() => Taro.navigateBack()}>\u53d6\u6d88</Text>
        <Text className='compose-title-text'>\u8bb0\u5f55\u6211\u4eec\u7684\u70b9\u70b9\u6ef4\u6ef4</Text>
        <Text className='compose-submit' onClick={handleSubmit}>{submitting ? '\u53d1\u5e03\u4e2d' : '\u53d1\u5e03'}</Text>
      </View>
      {error && <Text className='compose-error'>{error}</Text>}
      <View className='compose-card'>
        <Input className='compose-input' placeholder='\u6807\u9898\uff08\u53ef\u9009\uff09' value={title} onInput={e => setTitle(e.detail.value)} />
        <Textarea className='compose-textarea' placeholder='\u6b64\u523b\u7684\u60f3\u6cd5...' value={content} onInput={e => setContent(e.detail.value)} autoHeight />
        {files.length > 0 && (
          <View className='compose-images'>
            {files.map((f, i) => (
              <View key={i} className='compose-img-wrap'><Image src={f} mode='aspectFill' className='compose-img' /><View className='compose-img-remove' onClick={() => removeFile(i)}>\u2716</View></View>
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
