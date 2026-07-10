import { useEffect, useState, useCallback } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request, uploadRawFile, resolveImageUrl } from '../../utils/request'
import { User } from '../../utils/types'
import Icon from '../../components/Icon'
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
    } catch (err: any) { setError(err.message || '加载失败') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleEdit = () => {
    setNickname(user?.nickname || '')
    setOldPassword('')
    setNewPassword('')
    setEditMode(true)
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setOldPassword('')
    setNewPassword('')
  }

  const handleSaveProfile = async () => {
    if (!nickname.trim()) return
    setSubmitting(true)
    try {
      await request('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ nickname: nickname.trim() }) })
      setEditMode(false); fetchProfile()
    } catch (err: any) { setError(err.message || '保存失败') }
    finally { setSubmitting(false) }
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return
    setSubmitting(true)
    try {
      await request('/api/auth/password', { method: 'PUT', body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }) })
      setOldPassword(''); setNewPassword('')
      Taro.showToast({ title: '修改成功', icon: 'success' })
    } catch (err: any) { setError(err.message || '修改失败') }
    finally { setSubmitting(false) }
  }

  const handleUploadAvatar = async () => {
    try {
      const res = await Taro.chooseMedia({ count: 1, mediaType: ['image'], sourceType: ['album', 'camera'] })
      const filePath = res.tempFiles[0].tempFilePath
      const result = await uploadRawFile('/api/auth/avatar-base64', filePath)
      setUser(prev => prev ? { ...prev, avatar: result.avatar } : prev)
      Taro.showToast({ title: '上传成功', icon: 'success' })
    } catch (err: any) {
      if (err.errMsg?.indexOf('cancel') === -1) setError(err.message || '上传失败')
    }
  }

  const handleLogout = async () => {
    const res = await Taro.showModal({ title: '提示', content: '确定退出登录吗？' })
    if (!res.confirm) return
    Taro.removeStorageSync('token')
    Taro.reLaunch({ url: '/pages/login/index' })
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

      {/* Header */}
      <View className='profile-header'>
        <Text className='profile-title'>我的</Text>
      </View>

      {/* Profile card */}
      <View className='profile-card'>
        <View className='profile-info-row'>
          <View className='profile-avatar-wrap' onClick={handleUploadAvatar}>
            <View className='profile-avatar'>
              {user?.avatar
                ? <Image src={resolveImageUrl(user.avatar)} mode='aspectFill' className='profile-avatar-img' />
                : <Text className='profile-avatar-text'>{user?.nickname?.charAt(0) || '?'}</Text>
              }
            </View>
            <View className='profile-avatar-badge'>
              <Icon name='camera' size={18} color='#fff' />
            </View>
          </View>
          <View className='profile-name-section'>
            {!editMode ? (
              <View className='profile-name-row'>
                <Text className='profile-name'>{user?.nickname}</Text>
                <View className='profile-edit-btn' onClick={handleEdit}>
                  <Icon name='edit' size={16} color='#f97316' />
                  <Text className='profile-edit-btn-text'>编辑</Text>
                </View>
              </View>
            ) : (
              <View className='profile-edit-row'>
                <Input className='profile-name-input' placeholder='昵称' value={nickname} onInput={e => setNickname(e.detail.value)} />
              </View>
            )}
            <Text className='profile-username'>@{user?.username}</Text>
          </View>
        </View>

        {editMode && (
          <View className='profile-edit-actions'>
            <View className='profile-btn-cancel' onClick={handleCancelEdit}><Text>取消</Text></View>
            <View className={'profile-btn-save ' + (submitting ? 'disabled' : '')} onClick={handleSaveProfile}>
              <Text>{submitting ? '保存中' : '保存'}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Info section */}
      <View className='profile-section'>
        <View className='profile-info-item'>
          <Text className='profile-info-label'>用户ID</Text>
          <Text className='profile-info-value'>{user?.id}</Text>
        </View>
        <View className='profile-info-divider' />
        <View className='profile-info-item'>
          <Text className='profile-info-label'>用户名</Text>
          <Text className='profile-info-value'>{user?.username}</Text>
        </View>
        <View className='profile-info-divider' />
        <View className='profile-info-item'>
          <Text className='profile-info-label'>昵称</Text>
          <Text className='profile-info-value'>{user?.nickname}</Text>
        </View>
      </View>

      {/* Password Section */}
      <View className='profile-section'>
        <Text className='profile-section-title'>修改密码</Text>
        <View className='profile-field' style={{ marginBottom: '12px' }}>
          <Input className='profile-input' password placeholder='旧密码' value={oldPassword} onInput={e => setOldPassword(e.detail.value)} />
        </View>
        <View className='profile-field' style={{ marginBottom: '16px' }}>
          <Input className='profile-input' password placeholder='新密码' value={newPassword} onInput={e => setNewPassword(e.detail.value)} />
        </View>
        <View className={'profile-btn-save full ' + (submitting ? 'disabled' : '')} onClick={handleChangePassword}>
          <Text>{submitting ? '保存中' : '修改密码'}</Text>
        </View>
      </View>

      {/* Logout */}
      <View className='profile-logout-wrap'>
        <View className='profile-logout-btn' onClick={handleLogout}>
          <Icon name='logout' size={20} color='#ef4444' />
          <Text className='profile-logout-text'>退出登录</Text>
        </View>
      </View>
    </View>
  )
}
