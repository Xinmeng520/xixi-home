import { useEffect, useState, useCallback } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request, uploadRawFile, resolveImageUrl } from '../../utils/request'
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
    } catch (err: any) { setError(err.message || '加载失败') }
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

      {/* Hero */}
      <View className='profile-hero'>
        <View className='profile-avatar-wrap' onClick={handleUploadAvatar}>
          <View className='profile-avatar'>
            {user?.avatar
              ? <Image src={resolveImageUrl(user.avatar)} mode='aspectFill' className='profile-avatar-img' />
              : <Text className='profile-avatar-text'>{user?.nickname?.charAt(0) || '?'}</Text>
            }
          </View>
          <View className='profile-avatar-badge'>
            <Text>📷</Text>
          </View>
        </View>
        <Text className='profile-name'>{user?.nickname}</Text>
        <Text className='profile-username'>@{user?.username}</Text>
      </View>

      {/* Info Section */}
      <View className='profile-section'>
        <Text className='profile-section-title'>个人信息</Text>
        <View className='profile-field'>
          <Text className='profile-field-label'>显示名称</Text>
          {!editMode ? (
            <View className='profile-field-row'>
              <Text className='profile-field-value'>{user?.nickname}</Text>
              <View className='profile-edit-btn' onClick={handleEdit}>
                <Text>编辑</Text>
              </View>
            </View>
          ) : (
            <View className='profile-edit-form'>
              <Input className='profile-input' placeholder='显示名称' value={nickname} onInput={e => setNickname(e.detail.value)} />
              <View className='profile-form-actions'>
                <View className='profile-btn-cancel' onClick={() => setEditMode(false)}><Text>取消</Text></View>
                <View className={'profile-btn-save ' + (submitting ? 'disabled' : '')} onClick={handleSaveProfile}>
                  <Text>{submitting ? '保存中' : '保存'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Password Section */}
      <View className='profile-section'>
        <Text className='profile-section-title'>修改密码</Text>
        <View className='profile-field'>
          <Input className='profile-input' password placeholder='旧密码' value={oldPassword} onInput={e => setOldPassword(e.detail.value)} />
          <Input className='profile-input' password placeholder='新密码' value={newPassword} onInput={e => setNewPassword(e.detail.value)} />
          <View className={'profile-btn-save full ' + (submitting ? 'disabled' : '')} onClick={handleChangePassword}>
            <Text>{submitting ? '保存中' : '修改密码'}</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <View className='profile-section'>
        <View className='profile-logout-btn' onClick={handleLogout}>
          <Text>退出登录</Text>
        </View>
      </View>
    </View>
  )
}
