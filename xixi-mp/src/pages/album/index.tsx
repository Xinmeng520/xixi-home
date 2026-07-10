import { useEffect, useState, useCallback } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request, uploadFile, resolveImageUrl } from '../../utils/request'
import { Album, Photo } from '../../utils/types'
import Icon from '../../components/Icon'
import './index.css'

export default function AlbumPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeAlbum, setActiveAlbum] = useState<number | null>(null)
  const [showAlbumForm, setShowAlbumForm] = useState(false)
  const [albumName, setAlbumName] = useState('')
  const [albumDesc, setAlbumDesc] = useState('')
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadAlbum, setUploadAlbum] = useState<number | null>(null)

  // Photo viewer state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [viewerPhotos, setViewerPhotos] = useState<Photo[]>([])
  const [deleteMode, setDeleteMode] = useState(false)

  const fetchAlbums = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await request<Album[]>('/api/albums')
      setAlbums(data)
    } catch (err: any) { setError(err.message || '加载失败') }
    finally { setLoading(false) }
  }, [])

  const fetchPhotos = useCallback(async (albumId: number) => {
    setError('')
    try {
      const data = await request<Photo[]>('/api/albums/' + albumId + '/photos')
      setPhotos(data)
    } catch (err: any) { setError(err.message || '加载失败') }
  }, [])

  useEffect(() => { fetchAlbums() }, [fetchAlbums])

  useEffect(() => {
    if (activeAlbum !== null) fetchPhotos(activeAlbum)
  }, [activeAlbum, fetchPhotos])

  const openAddAlbum = () => { setEditingAlbum(null); setAlbumName(''); setAlbumDesc(''); setShowAlbumForm(true) }
  const openEditAlbum = (album: Album) => { setEditingAlbum(album); setAlbumName(album.name); setAlbumDesc(album.description || ''); setShowAlbumForm(true) }

  const handleAlbumSubmit = async () => {
    if (!albumName.trim()) return
    try {
      const body = JSON.stringify({ name: albumName.trim(), description: albumDesc.trim() })
      if (editingAlbum) { await request('/api/albums/' + editingAlbum.id, { method: 'PUT', body }) }
      else { await request('/api/albums', { method: 'POST', body }) }
      setShowAlbumForm(false); fetchAlbums()
    } catch (err: any) { setError(err.message || '保存失败') }
  }

  const handleDeleteAlbum = async (id: number) => {
    const res = await Taro.showModal({ title: '提示', content: '确定删除这个相册吗？' })
    if (!res.confirm) return
    try { await request('/api/albums/' + id, { method: 'DELETE' }); fetchAlbums() } catch (e) {}
  }

  const handleUploadPhoto = async () => {
    if (uploadAlbum === null) return
    try {
      const res = await Taro.chooseMedia({ count: 9, mediaType: ['image'], sourceType: ['album', 'camera'] })
      setShowUpload(false)
      for (const file of res.tempFiles) {
        await uploadFile('/api/photos', file.tempFilePath, { album_id: String(uploadAlbum) })
      }
      fetchPhotos(uploadAlbum)
    } catch (err: any) {
      if (err.errMsg?.indexOf('cancel') === -1) setError(err.message || '上传失败')
    }
  }

  // Photo viewer
  const openViewer = (index: number) => {
    if (deleteMode) return
    setViewerPhotos(photos)
    setViewerIndex(index)
    setViewerOpen(true)
  }

  const handleDeletePhoto = async (id: number) => {
    const res = await Taro.showModal({ title: '提示', content: '确定删除这张照片吗？' })
    if (!res.confirm) return
    try {
      await request('/api/photos/' + id, { method: 'DELETE' })
      if (activeAlbum !== null) fetchPhotos(activeAlbum)
    } catch (e) {}
  }

  const handleLongPress = (photoId: number) => {
    Taro.showActionSheet({
      itemList: ['保存到相册', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          const photo = photos.find(p => p.id === photoId)
          if (photo) {
            Taro.downloadFile({
              url: resolveImageUrl(photo.image_url),
              success: (downloadRes) => {
                Taro.saveImageToPhotosAlbum({
                  filePath: downloadRes.tempFilePath,
                  success: () => Taro.showToast({ title: '已保存', icon: 'success' }),
                  fail: () => Taro.showToast({ title: '保存失败', icon: 'none' })
                })
              }
            })
          }
        } else if (res.tapIndex === 1) {
          handleDeletePhoto(photoId)
        }
      }
    })
  }

  // Photo viewer full screen
  if (viewerOpen) {
    const currentPhoto = viewerPhotos[viewerIndex]
    const hasPrev = viewerIndex > 0
    const hasNext = viewerIndex < viewerPhotos.length - 1
    return (
      <View className='photo-viewer'>
        <View className='photo-viewer-header'>
          <View className='photo-viewer-close' onClick={() => setViewerOpen(false)}>
            <Icon name='close' size={24} color='#fff' />
          </View>
          <Text className='photo-viewer-counter'>{viewerIndex + 1} / {viewerPhotos.length}</Text>
          <View className='photo-viewer-save' onClick={() => {
            if (!currentPhoto) return
            Taro.downloadFile({
              url: resolveImageUrl(currentPhoto.image_url),
              success: (downloadRes) => {
                Taro.saveImageToPhotosAlbum({
                  filePath: downloadRes.tempFilePath,
                  success: () => Taro.showToast({ title: '已保存', icon: 'success' }),
                  fail: () => Taro.showToast({ title: '保存失败', icon: 'none' })
                })
              }
            })
          }}>
            <Icon name='save' size={20} color='#fff' />
          </View>
        </View>

        <View className='photo-viewer-swiper'>
          <View className='photo-viewer-track' style={{ transform: 'translateX(-' + viewerIndex * 100 + '%)' }}>
            {viewerPhotos.map((photo, i) => (
              <View key={photo.id} className='photo-viewer-slide'>
                <Image src={resolveImageUrl(photo.image_url)} mode='aspectFit' className='photo-viewer-image' />
              </View>
            ))}
          </View>
          {hasPrev && (
            <View className='photo-viewer-nav photo-viewer-nav-prev' onClick={() => setViewerIndex(viewerIndex - 1)}>
              <Icon name='chevron-left' size={28} color='#fff' />
            </View>
          )}
          {hasNext && (
            <View className='photo-viewer-nav photo-viewer-nav-next' onClick={() => setViewerIndex(viewerIndex + 1)}>
              <Icon name='chevron-right' size={28} color='#fff' />
            </View>
          )}
        </View>

        <View className='photo-viewer-footer'>
          <Text className='photo-viewer-hint'>长按图片可保存</Text>
        </View>
      </View>
    )
  }

  // Photo grid (inside album)
  if (activeAlbum !== null) {
    const album = albums.find(a => a.id === activeAlbum)
    return (
      <View className='album-page'>
        <View className='album-photo-header'>
          <View className='album-back-btn' onClick={() => { setActiveAlbum(null); setDeleteMode(false) }}>
            <Icon name='back' size={24} color='#f97316' />
          </View>
          <Text className='album-photo-title'>{album?.name}</Text>
          <View className='album-header-actions'>
            <View className='album-header-btn' onClick={() => { setUploadAlbum(activeAlbum); setShowUpload(true) }}>
              <Icon name='upload' size={18} color='#f97316' />
              <Text className='album-header-btn-text'>上传</Text>
            </View>
            <View className={'album-header-btn ' + (deleteMode ? 'active' : '')} onClick={() => setDeleteMode(!deleteMode)}>
              <Icon name='delete' size={18} color={deleteMode ? '#fff' : '#f97316'} />
              <Text className='album-header-btn-text'>删除</Text>
            </View>
          </View>
        </View>

        {deleteMode && (
          <View className='album-delete-hint'>
            <Icon name='delete' size={16} color='#ef4444' />
            <Text className='album-delete-hint-text'> 点击照片删除</Text>
          </View>
        )}

        <ScrollView className='album-photo-grid-scroll' scrollY>
          <View className='album-photo-grid'>
            {photos.length === 0 ? (
              <View className='album-empty'><Text>还没有照片</Text></View>
            ) : (
              photos.map((photo, i) => (
                <View
                  key={photo.id}
                  className={'album-photo-item ' + (deleteMode ? 'delete-mode' : '')}
                  onClick={() => deleteMode ? handleDeletePhoto(photo.id) : openViewer(i)}
                  onLongPress={() => handleLongPress(photo.id)}
                >
                  <Image src={resolveImageUrl(photo.image_url)} mode='aspectFill' className='album-photo-img' />
                  {deleteMode && (
                    <View className='album-photo-delete-mark'>
                      <Icon name='close' size={14} color='#fff' />
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {showUpload && (
          <View className='album-modal-overlay' onClick={() => setShowUpload(false)}>
            <View className='album-confirm' onClick={(e: any) => e.stopPropagation()}>
              <Text className='album-confirm-title'>上传照片</Text>
              <Text className='album-confirm-text'>选择要上传的照片（最多9张）</Text>
              <View className='album-confirm-actions'>
                <View className='album-btn-cancel' onClick={() => setShowUpload(false)}><Text>取消</Text></View>
                <View className='album-btn-save' onClick={handleUploadPhoto}><Text>选择照片</Text></View>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }

  // Album list
  return (
    <View className='album-page'>
      <View className='album-header'>
        <Text className='album-title'>相册</Text>
        <View className='album-header-actions-top'>
          <View className='album-pill album-pill-create' onClick={openAddAlbum}>
            <Icon name='add' size={18} color='#c2410c' />
            <Text className='album-pill-text'>新建相册</Text>
          </View>
          <View className='album-pill album-pill-upload' onClick={() => { if (albums.length > 0) { setUploadAlbum(albums[0].id); setShowUpload(true) } }}>
            <Icon name='upload' size={18} color='#fff' />
            <Text className='album-pill-text-upload'>上传</Text>
          </View>
        </View>
      </View>

      {error && <View className='album-error'><Text>{error}</Text></View>}

      <ScrollView className='album-scroll' scrollY>
        {loading ? (
          <View className='album-skeleton'>
            <View className='skeleton-card' />
            <View className='skeleton-card' />
          </View>
        ) : albums.length === 0 ? (
          <View className='album-empty'>
            <View className='album-empty-icon-wrap'>
              <Icon name='album' size={48} color='#ccc' />
            </View>
            <Text>还没有相册</Text>
            <Text className='album-empty-sub'>点击新建相册创建</Text>
          </View>
        ) : (
          albums.map(album => (
            <View key={album.id} className='album-card' onClick={() => setActiveAlbum(album.id)}>
              <View className='album-cover'>
                {album.cover_url
                  ? <Image src={resolveImageUrl(album.cover_url)} mode='aspectFill' className='album-cover-img' />
                  : <View className='album-cover-placeholder'><Icon name='image' size={32} color='#ccc' /></View>
                }
              </View>
              <View className='album-card-info'>
                <Text className='album-card-name'>{album.name}</Text>
                <Text className='album-card-count'>{album.photo_count || 0} 张照片</Text>
              </View>
              <View className='album-card-actions' onClick={(e: any) => e.stopPropagation()}>
                <View className='album-action-btn album-action-edit' onClick={() => openEditAlbum(album)}>
                  <Icon name='edit' size={20} color='#f97316' />
                </View>
                <View className='album-action-btn album-action-delete' onClick={() => handleDeleteAlbum(album.id)}>
                  <Icon name='delete' size={20} color='#ef4444' />
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {showUpload && (
        <View className='album-modal-overlay' onClick={() => setShowUpload(false)}>
          <View className='album-confirm' onClick={(e: any) => e.stopPropagation()}>
            <Text className='album-confirm-title'>上传照片</Text>
            <Text className='album-confirm-text'>选择要上传的照片（最多9张）</Text>
            <View className='album-confirm-actions'>
              <View className='album-btn-cancel' onClick={() => setShowUpload(false)}><Text>取消</Text></View>
              <View className='album-btn-save' onClick={handleUploadPhoto}><Text>选择照片</Text></View>
            </View>
          </View>
        </View>
      )}

      {showAlbumForm && (
        <View className='album-modal-overlay' onClick={() => setShowAlbumForm(false)}>
          <View className='album-modal' onClick={(e: any) => e.stopPropagation()}>
            <View className='album-modal-handle'></View>
            <Text className='album-modal-title'>{editingAlbum ? '编辑相册' : '新建相册'}</Text>
            <View className='album-form'>
              <Text className='album-label'>名称</Text>
              <Input className='album-input' placeholder='相册名称' value={albumName} onInput={e => setAlbumName(e.detail.value)} />
              <Text className='album-label'>描述</Text>
              <Input className='album-input' placeholder='可选' value={albumDesc} onInput={e => setAlbumDesc(e.detail.value)} />
              <View className='album-form-actions'>
                <View className='album-btn-cancel' onClick={() => setShowAlbumForm(false)}><Text>取消</Text></View>
                <View className='album-btn-save' onClick={handleAlbumSubmit}><Text>保存</Text></View>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
