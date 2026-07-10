import { useState } from 'react'
import { View, Text, Input, Textarea, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request, uploadFile } from '../../utils/request'
import Icon from '../../components/Icon'
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
    try {
      const res = await Taro.chooseMedia({ count: remain, mediaType: ['image'], sourceType: ['album', 'camera'] })
      setFiles(prev => [...prev, ...res.tempFiles.map((f: any) => f.tempFilePath)].slice(0, 9))
    } catch (e: any) {
      if (!e.errMsg?.includes('cancel')) setError('选择图片失败')
    }
  }

  const removeFile = (idx: number) => { setFiles(prev => prev.filter((_, i) => i !== idx)) }

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) { setError('记录点什么吧'); return }
    setSubmitting(true); setError('')
    try {
      const postRes: any = await request('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), content, is_pinned: isPinned ? 1 : 0 })
      })
      if (files.length > 0 && postRes && postRes.id) {
        for (const f of files) {
          await uploadFile('/api/posts/' + postRes.id + '/images', f, null, 'images')
        }
      }
      Taro.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 500)
    } catch (err: any) { setError(err.message || '发布失败'); setSubmitting(false) }
  }

  return (
    <View className='compose-page'>
      {/* Nav Bar */}
      <View className='compose-nav'>
        <Text className='compose-nav-btn compose-cancel' onClick={() => Taro.navigateBack()}>取消</Text>
        <Text className='compose-nav-title'>记录我们的点点滴滴</Text>
        <Text className={'compose-nav-btn compose-submit ' + (submitting ? 'disabled' : '')} onClick={handleSubmit}>
          {submitting ? '发布中...' : '发布'}
        </Text>
      </View>

      {error && <Text className='compose-error'>{error}</Text>}

      {/* Editor Card */}
      <View className='compose-card'>
        <Input
          className='compose-title-input'
          placeholder='标题（可选）'
          value={title}
          onInput={(e: any) => setTitle(e.detail.value)}
          maxlength={50}
        />
        <Textarea
          className='compose-content-input'
          placeholder='此刻的想法...'
          value={content}
          onInput={(e: any) => setContent(e.detail.value)}
          autoHeight
          maxlength={2000}
        />
      </View>

      {/* Image Grid */}
      {files.length > 0 && (
        <View className='compose-images-section'>
          <View className='compose-images-grid'>
            {files.map((f, i) => (
              <View key={i} className='compose-image-item'>
                <Image src={f} mode='aspectFill' className='compose-image' />
                <View className='compose-image-remove' onClick={() => removeFile(i)}>
                  <Icon name='close' size={14} color='#fff' />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Add Image Button */}
      {files.length < 9 && (
        <View className='compose-add-section' onClick={chooseImages}>
          <Icon name='add' size={28} color='#ccc' />
          <Text className='compose-add-text'>添加图片</Text>
          <Text className='compose-add-count'>{files.length}/9</Text>
        </View>
      )}

      {/* Toolbar */}
      <View className='compose-toolbar'>
        <View className='compose-toolbar-inner'>
          <View className='compose-toolbar-btn' onClick={chooseImages}>
            <Icon name='image' size={20} color='#f97316' />
            <Text className='compose-toolbar-label'>图片</Text>
          </View>
          <View className={'compose-toolbar-btn ' + (isPinned ? 'active' : '')} onClick={() => setIsPinned(!isPinned)}>
            <Icon name='pin' size={20} color={isPinned ? '#f97316' : '#999'} />
            <Text className='compose-toolbar-label'>{isPinned ? '已置顶' : '置顶'}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
