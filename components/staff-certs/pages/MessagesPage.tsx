'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import NurseAvatar from '../shared/NurseAvatar'
import type { ChatMessageRow } from '@/lib/staff-certs'
import { formatRelativeTime, LANGUAGE_LABELS } from '@/lib/staff-certs'

interface Conversation {
  nurseId: number
  nurseName: string
  nurseRole: string
  whatsappNumber: string | null
  preferredLanguage: string
  lastMessage: ChatMessageRow | null
  messageCount: number
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const nurseIdParam = searchParams.get('nurseId')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeNurseId, setActiveNurseId] = useState<number | null>(nurseIdParam ? Number(nurseIdParam) : null)
  const [messages, setMessages] = useState<ChatMessageRow[]>([])
  const [search, setSearch] = useState('')
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/staff-certs/messages/conversations')
      .then((r) => r.json())
      .then((d) => { setConversations(d); setLoading(false); if (d.length > 0 && !nurseIdParam) setActiveNurseId(d[0].nurseId) })
  }, [])

  useEffect(() => {
    if (!activeNurseId) return
    fetch(`/api/staff-certs/messages?nurseId=${activeNurseId}`)
      .then((r) => r.json())
      .then(setMessages)
  }, [activeNurseId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!newMsg.trim() || !activeNurseId) return
    setSending(true)
    const res = await fetch('/api/staff-certs/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nurseId: activeNurseId, direction: 'outbound', messageText: newMsg.trim() }),
    })
    const msg = await res.json()
    setMessages((prev) => [...prev, msg])
    setNewMsg('')
    setSending(false)
    // Update last message in conversations
    setConversations((prev) => prev.map((c) => c.nurseId === activeNurseId ? { ...c, lastMessage: msg } : c))
  }

  const filteredConvos = conversations.filter((c) =>
    !search || c.nurseName.toLowerCase().includes(search.toLowerCase()) || (c.whatsappNumber ?? '').includes(search)
  )

  const activeConvo = conversations.find((c) => c.nurseId === activeNurseId)

  // Group messages by date
  const grouped = messages.reduce<{ date: string; msgs: ChatMessageRow[] }[]>((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
    const last = acc[acc.length - 1]
    if (!last || last.date !== date) acc.push({ date, msgs: [msg] })
    else last.msgs.push(msg)
    return acc
  }, [])

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-72 shrink-0 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#1e2a4a]"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-xs text-gray-400 animate-pulse">Loading…</div>
            ) : filteredConvos.length === 0 ? (
              <div className="p-4 text-xs text-gray-400">No conversations found.</div>
            ) : filteredConvos.map((convo) => (
              <button
                key={convo.nurseId}
                onClick={() => setActiveNurseId(convo.nurseId)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeNurseId === convo.nurseId ? 'bg-[#1e2a4a]/5 border-l-2 border-l-[#1e2a4a]' : ''}`}
              >
                <NurseAvatar name={convo.nurseName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-semibold text-gray-900 truncate">{convo.nurseName}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{formatRelativeTime(convo.lastMessage?.createdAt ?? null)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {convo.lastMessage?.direction === 'outbound' ? '→ ' : ''}{convo.lastMessage?.messageText ?? 'No messages'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-gray-400">{convo.whatsappNumber}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          {activeConvo ? (
            <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
              <NurseAvatar name={activeConvo.nurseName} size="sm" />
              <div>
                <div className="font-semibold text-gray-900 text-sm">{activeConvo.nurseName}</div>
                <div className="text-xs text-gray-500">{activeConvo.whatsappNumber} · {LANGUAGE_LABELS[activeConvo.preferredLanguage] ?? activeConvo.preferredLanguage}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">📱 WhatsApp</span>
              </div>
            </div>
          ) : (
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-400">Select a conversation</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!activeNurseId ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Select a conversation to view messages</div>
            ) : grouped.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No messages yet</div>
            ) : grouped.map(({ date, msgs }) => (
              <div key={date}>
                <div className="text-center my-3">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{date}</span>
                </div>
                <div className="space-y-2">
                  {msgs.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        msg.direction === 'outbound'
                          ? 'rounded-br-sm text-white'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                      }`} style={msg.direction === 'outbound' ? { background: 'linear-gradient(135deg, #1e2a4a, #2a3d6f)' } : {}}>
                        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.messageText}</p>
                        <div className={`text-[10px] mt-1 ${msg.direction === 'outbound' ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                          {formatRelativeTime(msg.createdAt)}
                          {msg.direction === 'outbound' && msg.handledByBot && <span className="ml-1">· Bot</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 flex items-end gap-2">
            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Type a message… (Enter to send)"
              rows={2}
              disabled={!activeNurseId}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1e2a4a] resize-none disabled:bg-gray-50"
            />
            <button
              onClick={sendMessage}
              disabled={!newMsg.trim() || !activeNurseId || sending}
              className="px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-40 hover:shadow-md hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #1e2a4a, #2a3d6f)' }}
            >
              {sending ? '…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
