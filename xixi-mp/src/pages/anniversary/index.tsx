import { useEffect, useState, useCallback } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import type { Anniversary } from '../../utils/types'
import './index.css'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export default function AnniversaryPage() {
  const [items, setItems] = useState<Anniversary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Anniversary | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formRecurring, setFormRecurring] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await request<Anniversary[]>('/api/anniversaries')
      setItems(data)
    } catch (err: any) { setError(err.message || '\u52a0\u8f7d\u5931\u8d25') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = () => { setEditing(null); setFormTitle(''); setFormDate(''); setFormRecurring(1); setShowForm(true) }
  const openEdit = (item: Anniversary) => { setEditing(item); setFormTitle(item.title); setFormDate(formatDate(item.date)); setFormRecurring(item.is_recurring); setShowForm(true) }

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formDate) return
    setSubmitting(true)
    try {
      const body = JSON.stringify({ title: formTitle, date: formDate, is_recurring: formRecurring })
      if (editing) { await request('/api/anniversaries/' + editing.id, { method: 'PUT', body }) }
      else { await request('/api/anniversaries', { method: 'POST', body }) }
      setShowForm(false); fetchItems()
    } catch (err: any) { setError(err.message || '\u4fdd\u5b58\u5931\u8d25') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: number) => {
    try { await request('/api/anniversaries/' + id, { method: 'DELETE' }); setDeleteConfirm(null); fetchItems() }
    catch (err: any) { setError(err.message || '\u5220\u9664\u5931\u8d25') }
  }

  const calcDaysLeft = (item: Anniversary): number => {
    const target = new Date(item.date)
    const now = new Date()
    if (item.is_recurring === 1) {
      target.setFullYear(now.getFullYear())
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      if (target.getTime() < todayStart.getTime()) { target.setFullYear(now.getFullYear() + 1) }
    }
    return Math.ceil((target.getTime() - now.getTime()) / 86400000)
  }

  return (
    <View className='anniv-page'>
      <View className='anniv-header'>
        <Text className='anniv-title'>\u7eaa\u5ff5\u65e5</Text>
        <View className='anniv-add-btn' onClick={openAdd}>
          <Text className='anniv-add-icon'>+</Text>
        </View>
      </View>

      {error && <View className='anniv-error'><Text>{error}</Text></View>}

      <ScrollView className='anniv-scroll' scrollY>
        {loading ? (
          <View className='anniv-skeleton'>
            <View className='skeleton-card'><View className='skeleton-line' /><View className='skeleton-line short' /></View>
            <View className='skeleton-card'><View className='skeleton-line' /><View className='skeleton-line short' /></View>
          </View>
        ) : items.length === 0 ? (
          <View className='anniv-empty'>
            <Text className='empty-icon'>\u2728</Text>
            <Text>\u8fd8\u6ca1\u6709\u7eaa\u5ff5\u65e5</Text>
            <Text className='empty-sub'>\u70b9\u51fb\u53f3\u4e0a\u89d2\u6dfb\u52a0</Text>
          </View>
        ) : (
          items.map((item: Anniversary) => (
            <View key={item.id} className='anniv-card'>
              <View className='anniv-card-info'>
                <View className='anniv-card-text'>
                  <Text className='anniv-card-title'>{item.title}</Text>
                  {item.is_recurring === 1 && <Text className='anniv-card-badge'>\u6bcf\u5e74</Text>}
                  <Text className='anniv-card-date'>{formatDate(item.date)}</Text>
                </View>
                <View className='anniv-card-countdown'>
                  <Text className='anniv-days'>{calcDaysLeft(item)}</Text>
                  <Text className='anniv-days-unit'>\u5929\u540e</Text>
                </View>
              </View>
              <View className='anniv-card-actions'>
                <View className='anniv-action-btn' onClick={() => openEdit(item)}>
                  <Text className='anniv-action-icon'>\u270e</Text>
                </View>
                <View className='anniv-action-btn' onClick={() => setDeleteConfirm(item.id)}>
                  <Text className='anniv-action-icon danger'>\u2716</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {showForm && (
        <View className='anniv-modal-overlay' onClick={() => setShowForm(false)}>
          <View className='anniv-modal' onClick={(e: any) => e.stopPropagation()}>
            <View className='anniv-modal-handle'></View>
            <Text className='anniv-modal-title'>{editing ? '\u7f16\u8f91\u7eaa\u5ff5\u65e5' : '\u65b0\u589e\u7eaa\u5ff5\u65e5'}</Text>
            <View className='anniv-form'>
              <Text className='anniv-label'>\u6807\u9898</Text>
              <Input className='anniv-input' placeholder='\u5982\uff1a\u786e\u5b9a\u5173\u7cfb\u65e5' value={formTitle} onInput={e => setFormTitle(e.detail.value)} />
              <Text className='anniv-label'>\u65e5\u671f</Text>
              <Input className='anniv-input' type='date' value={formDate} onInput={e => setFormDate(e.detail.value)} />
              <View className='anniv-toggle-row'>
                <Text className='anniv-label'>\u6bcf\u5e74\u91cd\u590d</Text>
                <View className={'anniv-toggle ' + (formRecurring === 1 ? 'on' : '')} onClick={() => setFormRecurring(formRecurring === 1 ? 0 : 1)}>
                  <View className='anniv-toggle-dot'></View>
                </View>
              </View>
              <View className='anniv-form-actions'>
                <View className='anniv-btn-cancel' onClick={() => setShowForm(false)}><Text>\u53d6\u6d88</Text></View>
                <View className={'anniv-btn-save ' + (submitting ? 'disabled' : '')} onClick={handleSubmit}>
                  <Text>{submitting ? '\u4fdd\u5b58\u4e2d...' : '\u4fdd\u5b58'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {deleteConfirm !== null && (
        <View className='anniv-modal-overlay' onClick={() => setDeleteConfirm(null)}>
          <View className='anniv-confirm' onClick={(e: any) => e.stopPropagation()}>
            <Text className='anniv-confirm-title'>\u786e\u8ba4\u5220\u9664</Text>
            <Text className='anniv-confirm-text'>\u5220\u9664\u540e\u65e0\u6cd5\u6062\u590d</Text>
            <View className='anniv-confirm-actions'>
              <View className='anniv-btn-cancel' onClick={() => setDeleteConfirm(null)}><Text>\u53d6\u6d88</Text></View>
              <View className='anniv-btn-delete' onClick={() => handleDelete(deleteConfirm)}><Text>\u5220\u9664</Text></View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
