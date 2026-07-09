import { useEffect, useState, useCallback } from 'react'
import { View, Text, Image, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request, uploadFile } from '../../utils/request'
import { User } from '../../utils/types'
import './index.css'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [nickname, setNickname] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchProfile = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await request<User>('/api/auth/me')
      setUser(data)
    } catch (err: any) { setError(err.message || '\u52a0\u8f7d\u5931\u8d25') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleEdit = () => { setNickname(user?.nickname || ''); setOldPassword(''); setNewPassword(''); setEditMode(true) }

  const handleSaveProfile = async () => {
    if (!nickname.trim()) return
    setSubmitting(true)
    try {
      await request('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ nickname: nickname.trim() }) })
      setEditMode(false); fetchProfile()
    } catch (err: any) { setError(err.message || '\u4fdd\u5b58\u5931\u8d25') }
    finally { setSubmitting(false) }
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return
    setSubmitting(true)
    try {
      await request('/api/auth/password', { method: 'PUT', body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }) })
      setOldPassword(''); setNewPassword('')
      Taro.showToast({ title: '\u4fee\u6539\u6210\u529f', icon: 'success' })
    } catch (err: any) { setError(err.message || '\u4fee\u6539\u5931\u8d25') }
    finally { setSubmitting(false) }
  }

  const handleUploadAvatar = async () => {
    try {
      const res = await Taro.chooseMedia({ count: 1, mediaType: ['image'], sourceType: ['album', 'camera'] })
      const filePath = res.tempFiles[0].tempFilePath
      const result = await uploadFile('/api/auth/avatar', filePath, undefined, 'avatar')
      setUser(prev => prev ? { ...prev, avatar: result.url } : prev)
      Taro.showToast({ title: '\u4e0a\u4f20\u6210\u529f', icon: 'success' })
    } catch (err: any) {
      if (err.errMsg?.indexOf('cancel') === -1) setError(err.message || '\u4e0a\u4f20\u5931\u8d25')
    }
  }

  const handleLogout = async () => {
    const res = await Taro.showModal({ title: '\u63d0\u793a', content: '\u786e\u5b9a\u9000\u51fa\u767b\u5f55\u5417\uff1f' })
    if (!res.confirm) return
    Taro.removeStorageSync('token')
    Taro.reLaunch({ url: '/src/pages/login/index' })
  }

  if (loading) {
    return (
      <View className='profile-page'>
        <View className='profile-skeleton'>
          <View className='skeleton-avatar' />
          <View className='skeleton-line' />
          <View className='skeleton-line short' />
        </View>
      </View>
    )
  }

  return (
    <View className='profile-page'>
      {error && <View className='profile-error'><Text>{error}</Text></View>}

      <View className='profile-hero'>
        <View className='profile-avatar-wrap'>
          <View className='profile-avatar' onClick={handleUploadAvatar}>
            {user?.avatar
              ? <Image src={user.avatar} mode='aspectFill' className='avatar-img' />
              : <Text className='avatar-text'>{user?.nickname?.charAt(0) || '?'}</Text>
            }
          </View>
          <View className='profile-avatar-edit'>
            <Text className='avatar-edit-icon'>\ud83d\udcf8</Text>
          </View>
        </View>
        <Text className='profile-name'>{user?.nickname}</Text>
        <Text className='profile-username'>@{user?.username}</Text>
      </View>

      <View className='profile-section'>
        <Text className='profile-section-title'>\u4e2a\u4eba\u4fe1\u606f</Text>
        <View className='profile-field'>
          <Text className='profile-field-label'>\u663e\u793a\u540d\u79f0</Text>
          {!editMode ? (
            <View className='profile-field-row'>
              <Text className='profile-field-value'>{user?.nickname}</Text>
              <View className='profile-edit-btn' onClick={handleEdit}>
                <Text className='profile-edit-icon'>\u270e</Text>
              </View>
            </View>
          ) : (
            <View className='profile-edit-form'>
              <Input className='profile-input' placeholder='\u663e\u793a\u540d\u79f0' value={nickname} onInput={e => setNickname(e.detail.value)} />
              <View className='profile-form-actions'>
                <View className='profile-btn-cancel' onClick={() => setEditMode(false)}><Text>\u53d6\u6d88</Text></View>
                <View className={'profile-btn-save ' + (submitting ? 'disabled' : '')} onClick={handleSaveProfile}>
                  <Text>{submitting ? '\u4fdd\u5b58\u4e2d...' : '\u4fdd\u5b58'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className='profile-section'>
        <Text className='profile-section-title'>\u4fee\u6539\u5bc6\u7801</Text>
        <View className='profile-field'>
          <Input className='profile-input' password placeholder='\u65e7\u5bc6\u7801' value={oldPassword} onInput={e => setOldPassword(e.detail.value)} />
          <Input className='profile-input' password placeholder='\u65b0\u5bc6\u7801' value={newPassword} onInput={e => setNewPassword(e.detail.value)} />
          <View className='profile-btn-save full' onClick={handleChangePassword}>
            <Text>{submitting ? '\u4fdd\u5b58\u4e2d...' : '\u4fee\u6539\u5bc6\u7801'}</Text>
          </View>
        </View>
      </View>

      <View className='profile-section'>
        <View className='profile-logout-btn' onClick={handleLogout}>
          <Text>\u9000\u51fa\u767b\u5f55</Text>
        </View>
      </View>
    </View>
  )
}
