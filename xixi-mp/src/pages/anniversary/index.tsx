import { useEffect, useState, useCallback } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { request } from '../../utils/request'
import { Anniversary } from '../../utils/types'
import Icon from '../../components/Icon'
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
    } catch (err: any) { setError(err.message || '加载失败') }
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
    } catch (err: any) { setError(err.message || '保存失败') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: number) => {
    try { await request('/api/anniversaries/' + id, { method: 'DELETE' }); setDeleteConfirm(null); fetchItems() }
    catch (err: any) { setError(err.message || '删除失败') }
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
        <Text className='anniv-title'>纪念日</Text>
        <View className='anniv-add-btn' onClick={openAdd}>
          <Icon name='add' size={24} color='#fff' />
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
            <View className='anniv-empty-icon-wrap'>
              <Icon name='calendar' size={48} color='#ccc' />
            </View>
            <Text>还没有纪念日</Text>
            <Text className='anniv-empty-sub'>点击右上角添加</Text>
          </View>
        ) : (
          items.map((item: Anniversary) => (
            <View key={item.id} className='anniv-card'>
              <View className='anniv-card-info'>
                <View className='anniv-card-text'>
                  <Text className='anniv-card-title'>{item.title}</Text>
                  {item.is_recurring === 1 && <Text className='anniv-card-badge'>每年</Text>}
                  <Text className='anniv-card-date'>{formatDate(item.date)}</Text>
                </View>
                <View className='anniv-card-countdown'>
                  <Text className='anniv-days'>{calcDaysLeft(item)}</Text>
                  <Text className='anniv-days-unit'>天后</Text>
                </View>
              </View>
              <View className='anniv-card-actions'>
                <View className='anniv-action-btn' onClick={() => openEdit(item)}>
                  <Icon name='edit' size={20} color='#f97316' />
                </View>
                <View className='anniv-action-btn danger' onClick={() => setDeleteConfirm(item.id)}>
                  <Icon name='delete' size={20} color='#ef4444' />
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
            <Text className='anniv-modal-title'>{editing ? '编辑纪念日' : '新增纪念日'}</Text>
            <View className='anniv-form'>
              <Text className='anniv-label'>标题</Text>
              <Input className='anniv-input' placeholder='如：确定关系日' value={formTitle} onInput={e => setFormTitle(e.detail.value)} />
              <Text className='anniv-label'>日期</Text>
              <Input className='anniv-input' type='date' value={formDate} onInput={e => setFormDate(e.detail.value)} />
              <View className='anniv-toggle-row'>
                <Text className='anniv-label'>每年重复</Text>
                <View className={'anniv-toggle ' + (formRecurring === 1 ? 'on' : '')} onClick={() => setFormRecurring(formRecurring === 1 ? 0 : 1)}>
                  <View className='anniv-toggle-dot'></View>
                </View>
              </View>
              <View className='anniv-form-actions'>
                <View className='anniv-btn-cancel' onClick={() => setShowForm(false)}><Text>取消</Text></View>
                <View className={'anniv-btn-save ' + (submitting ? 'disabled' : '')} onClick={handleSubmit}>
                  <Text>{submitting ? '保存中...' : '保存'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {deleteConfirm !== null && (
        <View className='anniv-modal-overlay' onClick={() => setDeleteConfirm(null)}>
          <View className='anniv-confirm' onClick={(e: any) => e.stopPropagation()}>
            <Text className='anniv-confirm-title'>确认删除</Text>
            <Text className='anniv-confirm-text'>删除后无法恢复</Text>
            <View className='anniv-confirm-actions'>
              <View className='anniv-btn-cancel' onClick={() => setDeleteConfirm(null)}><Text>取消</Text></View>
              <View className='anniv-btn-delete' onClick={() => handleDelete(deleteConfirm)}><Text>删除</Text></View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
