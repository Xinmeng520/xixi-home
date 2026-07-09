import { useEffect, useState, useCallback } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request, uploadFile } from '../../utils/request'
import { Album, Photo } from '../../utils/types'
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

  const fetchAlbums = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await request<Album[]>('/api/albums')
      setAlbums(data)
    } catch (err: any) { setError(err.message || '\u52a0\u8f7d\u5931\u8d25') }
    finally { setLoading(false) }
  }, [])

  const fetchPhotos = useCallback(async (albumId: number) => {
    setError('')
    try {
      const data = await request<Photo[]>('/api/albums/' + albumId + '/photos')
      setPhotos(data)
    } catch (err: any) { setError(err.message || '\u52a0\u8f7d\u5931\u8d25') }
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
    } catch (err: any) { setError(err.message || '\u4fdd\u5b58\u5931\u8d25') }
  }

  const handleDeleteAlbum = async (id: number) => {
    const res = await Taro.showModal({ title: '\u63d0\u793a', content: '\u786e\u5b9a\u5220\u9664\u8fd9\u4e2a\u76f8\u518c\u5417\uff1f' })
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
      if (err.errMsg?.indexOf('cancel') === -1) setError(err.message || '\u4e0a\u4f20\u5931\u8d25')
    }
  }

  const handleDeletePhoto = async (id: number) => {
    const res = await Taro.showModal({ title: '\u63d0\u793a', content: '\u786e\u5b9a\u5220\u9664\u8fd9\u5f20\u7167\u7247\u5417\uff1f' })
    if (!res.confirm) return
    try { await request('/api/photos/' + id, { method: 'DELETE' }); if (activeAlbum !== null) fetchPhotos(activeAlbum) } catch (e) {}
  }

  if (activeAlbum !== null) {
    const album = albums.find(a => a.id === activeAlbum)
    return (
      <View className='album-page'>
        <View className='album-photo-header'>
          <View className='album-back-btn' onClick={() => setActiveAlbum(null)}>
            <Text className='album-back-icon'>\u2190</Text>
          </View>
          <Text className='album-photo-title'>{album?.name}</Text>
          <View className='album-upload-btn' onClick={() => { setUploadAlbum(activeAlbum); setShowUpload(true) }}>
            <Text className='album-upload-icon'>+</Text>
          </View>
        </View>
        {error && <View className='album-error'><Text>{error}</Text></View>}
        <ScrollView className='album-photo-grid-scroll' scrollY>
          <View className='album-photo-grid'>
            {photos.length === 0 ? (
              <View className='album-empty'><Text>\u8fd8\u6ca1\u6709\u7167\u7247</Text></View>
            ) : (
              photos.map(photo => (
                <View key={photo.id} className='album-photo-item' onLongPress={() => handleDeletePhoto(photo.id)}>
                  <Image src={photo.image_url} mode='aspectFill' className='album-photo-img' />
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {showUpload && (
          <View className='album-modal-overlay' onClick={() => setShowUpload(false)}>
            <View className='album-confirm' onClick={(e: any) => e.stopPropagation()}>
              <Text className='album-confirm-title'>\u4e0a\u4f20\u7167\u7247</Text>
              <Text className='album-confirm-text'>\u9009\u62e9\u8981\u4e0a\u4f20\u7684\u7167\u7247\uff08\u6700\u591a9\u5f20\uff09</Text>
              <View className='album-confirm-actions'>
                <View className='album-btn-cancel' onClick={() => setShowUpload(false)}><Text>\u53d6\u6d88</Text></View>
                <View className='album-btn-save' onClick={handleUploadPhoto}><Text>\u9009\u62e9\u7167\u7247</Text></View>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }

  return (
    <View className='album-page'>
      <View className='album-header'>
        <Text className='album-title'>\u76f8\u518c</Text>
        <View className='album-add-btn' onClick={openAddAlbum}>
          <Text className='album-add-icon'>+</Text>
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
            <Text className='empty-icon'>\u2728</Text>
            <Text>\u8fd8\u6ca1\u6709\u76f8\u518c</Text>
            <Text className='empty-sub'>\u70b9\u51fb\u53f3\u4e0a\u89d2\u521b\u5efa</Text>
          </View>
        ) : (
          albums.map(album => (
            <View key={album.id} className='album-card' onClick={() => setActiveAlbum(album.id)}>
              <View className='album-cover'>
                {album.cover_url
                  ? <Image src={album.cover_url} mode='aspectFill' className='album-cover-img' />
                  : <View className='album-cover-placeholder'><Text>\ud83d\uddbc</Text></View>
                }
              </View>
              <View className='album-card-info'>
                <Text className='album-card-name'>{album.name}</Text>
                <Text className='album-card-count'>{album.photo_count || 0} \u5f20</Text>
              </View>
              <View className='album-card-actions' onClick={(e: any) => e.stopPropagation()}>
                <View className='album-action-btn' onClick={() => openEditAlbum(album)}>
                  <Text className='album-action-icon'>\u270e</Text>
                </View>
                <View className='album-action-btn' onClick={() => handleDeleteAlbum(album.id)}>
                  <Text className='album-action-icon danger'>\u2716</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {showAlbumForm && (
        <View className='album-modal-overlay' onClick={() => setShowAlbumForm(false)}>
          <View className='album-modal' onClick={(e: any) => e.stopPropagation()}>
            <View className='album-modal-handle'></View>
            <Text className='album-modal-title'>{editingAlbum ? '\u7f16\u8f91\u76f8\u518c' : '\u65b0\u589e\u76f8\u518c'}</Text>
            <View className='album-form'>
              <Text className='album-label'>\u540d\u79f0</Text>
              <Input className='album-input' placeholder='\u76f8\u518c\u540d\u79f0' value={albumName} onInput={e => setAlbumName(e.detail.value)} />
              <Text className='album-label'>\u63cf\u8ff0</Text>
              <Input className='album-input' placeholder='\u53ef\u9009' value={albumDesc} onInput={e => setAlbumDesc(e.detail.value)} />
              <View className='album-form-actions'>
                <View className='album-btn-cancel' onClick={() => setShowAlbumForm(false)}><Text>\u53d6\u6d88</Text></View>
                <View className='album-btn-save' onClick={handleAlbumSubmit}><Text>\u4fdd\u5b58</Text></View>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
