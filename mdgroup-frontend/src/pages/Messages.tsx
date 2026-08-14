import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'

import { messagesApi } from '../api/endpoints'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Message = Record<string, any>

interface ParticipantThread {
  participantId: string
  participantName: string
  messages: Message[]
  unreadCount: number
  lastMessage: string
  lastMessageAt: string
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-6 h-6" />
    </div>
  )
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function fmtTime(d: string): string {
  return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function truncate(str: string, max: number): string {
  return str && str.length > max ? str.slice(0, max) + '…' : str ?? ''
}

function getParticipantName(msg: Message): string {
  const p = msg.participant
  if (!p) return msg.participantId ?? 'Unknown'
  return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || msg.participantId
}

function getSenderLabel(msg: Message): string {
  if (msg.direction === 'OUTBOUND' || msg.messageType === 'OUTBOUND') {
    const u = msg.sender ?? msg.createdBy
    if (u) return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Navigator'
    return 'Navigator'
  }
  return getParticipantName(msg)
}

function groupByParticipant(messages: Message[]): ParticipantThread[] {
  const map = new Map<string, Message[]>()
  for (const msg of messages) {
    const pid = msg.participantId ?? msg.participant?.id ?? 'unknown'
    map.set(pid, [...(map.get(pid) ?? []), msg])
  }

  const threads: ParticipantThread[] = []
  map.forEach((msgs, participantId) => {
    const sorted = [...msgs].sort(
      (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
    )
    const last = sorted[sorted.length - 1]
    threads.push({
      participantId,
      participantName: getParticipantName(last),
      messages: sorted,
      unreadCount: msgs.filter((m) => m.isRead === false).length,
      lastMessage: truncate(last?.body ?? last?.content ?? '', 30),
      lastMessageAt: last?.createdAt ?? '',
    })
  })

  return threads.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  )
}

export default function Messages() {
  const queryClient                    = useQueryClient()
  const [selectedPid, setSelectedPid] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn:  () => messagesApi.list({ limit: 200 }),
  })

  const markReadMutation = useMutation({
    mutationFn: (ids: string[]) => messagesApi.markRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })

  const allMessages: Message[] = data?.data ?? []
  const threads: ParticipantThread[] = groupByParticipant(allMessages)
  const selectedThread = threads.find((t) => t.participantId === selectedPid)

  function handleMarkAllRead() {
    if (!selectedThread) return
    const unreadIds = selectedThread.messages
      .filter((m) => m.isRead === false && m.id)
      .map((m) => m.id as string)
    if (unreadIds.length > 0) markReadMutation.mutate(unreadIds)
  }

  return (
    <div className="p-6 space-y-5 flex flex-col" style={{ background: 'var(--color-background)', minHeight: '100%' }}>

      {/* Page header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-[24px] font-bold text-gray-900">Messages</h2>
          <p className="text-[17px] text-gray-500 mt-0.5">Patient communication center</p>
        </div>
        <div className="flex items-center gap-2 text-[17px] font-medium text-gray-500 px-3 py-1.5 rounded-lg bg-white" style={{ border: '1px solid var(--color-border)' }}>
          <MessageSquare size={13} className="text-gray-400" />
          {threads.length} {threads.length === 1 ? 'conversation' : 'conversations'}
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 180px)' }}>
          {/* Left: participant list */}
          <div
            className="w-80 shrink-0 bg-white rounded-xl overflow-hidden flex flex-col"
            style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)', background: '#F9FAFB' }}>
              <span className="text-[17px] font-semibold text-gray-400 uppercase tracking-wider">Participants</span>
            </div>

            {threads.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-[17px]">
                No messages yet
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {threads.map((thread) => (
                  <li
                    key={thread.participantId}
                    onClick={() => setSelectedPid(thread.participantId)}
                    className={`px-4 py-3 cursor-pointer transition-colors flex items-start gap-3 ${
                      selectedPid === thread.participantId
                        ? 'bg-blue-50 border-l-2 border-l-blue-600'
                        : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[17px] font-semibold text-white shrink-0"
                      style={{ background: 'var(--color-primary-mid)' }}
                    >
                      {thread.participantName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[17px] font-medium text-gray-800 truncate">{thread.participantName}</span>
                        {thread.unreadCount > 0 && (
                          <span
                            className="ml-2 shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[17px] font-bold"
                            style={{ background: 'var(--color-primary)' }}
                          >
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[16px] text-gray-400 truncate mt-0.5">{thread.lastMessage}</p>
                      {thread.lastMessageAt && (
                        <p className="text-[17px] text-gray-400 mt-0.5">{fmt(thread.lastMessageAt)}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: message thread */}
          <div
            className="flex-1 bg-white rounded-xl flex flex-col overflow-hidden"
            style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            {!selectedThread ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-[17px]">
                Select a participant to view messages
              </div>
            ) : (
              <>
                <div className="px-5 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid var(--color-border)', background: '#F9FAFB' }}>
                  <div>
                    <span className="font-semibold text-gray-800 text-[16px]">{selectedThread.participantName}</span>
                    <span className="ml-2 text-[16px] text-gray-400">
                      {selectedThread.messages.length} message{selectedThread.messages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {selectedThread.unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      disabled={markReadMutation.isPending}
                      className="text-[16px] font-medium disabled:opacity-50 transition-colors cursor-pointer hover:opacity-70"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Mark all read ({selectedThread.unreadCount})
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {selectedThread.messages.map((msg, i) => {
                    const isOutbound = msg.direction === 'OUTBOUND' || msg.messageType === 'OUTBOUND'
                    const body: string = msg.body ?? msg.content ?? ''
                    const sender: string = getSenderLabel(msg)
                    const timestamp: string = msg.createdAt ?? ''
                    const isUnread: boolean = msg.isRead === false

                    return (
                      <div
                        key={msg.id ?? i}
                        className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-sm xl:max-w-md rounded-2xl px-4 py-2.5 ${
                            isOutbound
                              ? 'text-white rounded-br-sm'
                              : 'bg-gray-50 text-gray-800 rounded-bl-sm'
                          } ${isUnread && !isOutbound ? 'ring-2 ring-blue-200' : ''}`}
                          style={isOutbound ? { background: 'var(--color-primary)' } : { border: '1px solid var(--color-border)' }}
                        >
                          <p className="text-[17px] leading-relaxed">{body}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1 ${isOutbound ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[17px] font-medium text-gray-500">{sender}</span>
                          {timestamp && (
                            <>
                              <span className="text-gray-300 text-[17px]">·</span>
                              <span className="text-[17px] text-gray-400">{fmt(timestamp)} {fmtTime(timestamp)}</span>
                            </>
                          )}
                          {isUnread && !isOutbound && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
