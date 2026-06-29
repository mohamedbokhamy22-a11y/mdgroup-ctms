import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { messagesApi } from '../api/endpoints'
import PageHeader from '../components/ui/PageHeader'

// ── types ──────────────────────────────────────────────────────────────────

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

// ── helpers ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full border-2 border-blue-600 border-t-transparent w-8 h-8" />
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
    const existing = map.get(pid) ?? []
    map.set(pid, [...existing, msg])
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

// ── component ──────────────────────────────────────────────────────────────

export default function Messages() {
  const queryClient                               = useQueryClient()
  const [selectedPid, setSelectedPid]            = useState<string | null>(null)

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

  const selectedThread: ParticipantThread | undefined = threads.find(
    (t) => t.participantId === selectedPid
  )

  function handleMarkAllRead() {
    if (!selectedThread) return
    const unreadIds: string[] = selectedThread.messages
      .filter((m) => m.isRead === false && m.id)
      .map((m) => m.id as string)
    if (unreadIds.length > 0) {
      markReadMutation.mutate(unreadIds)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PageHeader
        title="Messages"
        subtitle="Patient communication center"
        action={
          <span className="text-sm text-slate-500">
            {threads.length} conversation{threads.length !== 1 ? 's' : ''}
          </span>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="px-8 pb-10 flex gap-4 flex-1 min-h-0">
          {/* ── left panel: participant list ── */}
          <div className="w-1/3 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Participants
              </span>
            </div>

            {threads.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                No messages yet
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {threads.map((thread) => (
                  <li
                    key={thread.participantId}
                    onClick={() => setSelectedPid(thread.participantId)}
                    className={`px-4 py-3 cursor-pointer transition-colors flex items-start gap-3 ${
                      selectedPid === thread.participantId
                        ? 'bg-blue-50 border-l-2 border-l-blue-500'
                        : 'hover:bg-slate-50 border-l-2 border-l-transparent'
                    }`}
                  >
                    {/* avatar */}
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
                      {thread.participantName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-800 truncate">
                          {thread.participantName}
                        </span>
                        {thread.unreadCount > 0 && (
                          <span className="ml-2 shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{thread.lastMessage}</p>
                      {thread.lastMessageAt && (
                        <p className="text-xs text-slate-400 mt-0.5">{fmt(thread.lastMessageAt)}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── right panel: message thread ── */}
          <div className="w-2/3 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
            {!selectedThread ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Select a participant to view messages
              </div>
            ) : (
              <>
                {/* thread header */}
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div>
                    <span className="font-semibold text-slate-800">{selectedThread.participantName}</span>
                    <span className="ml-2 text-xs text-slate-400">
                      {selectedThread.messages.length} message{selectedThread.messages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {selectedThread.unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      disabled={markReadMutation.isPending}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 transition-colors"
                    >
                      Mark all as read ({selectedThread.unreadCount})
                    </button>
                  )}
                </div>

                {/* messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {selectedThread.messages.map((msg, i) => {
                    const isOutbound =
                      msg.direction === 'OUTBOUND' || msg.messageType === 'OUTBOUND'
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
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                          } ${isUnread && !isOutbound ? 'ring-2 ring-blue-200' : ''}`}
                        >
                          <p className="text-sm leading-relaxed">{body}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1 ${isOutbound ? 'flex-row-reverse' : ''}`}>
                          <span className={`text-xs font-medium ${isOutbound ? 'text-slate-500' : 'text-slate-500'}`}>
                            {sender}
                          </span>
                          {timestamp && (
                            <>
                              <span className="text-slate-300 text-xs">·</span>
                              <span className="text-xs text-slate-400">
                                {fmt(timestamp)} {fmtTime(timestamp)}
                              </span>
                            </>
                          )}
                          {isUnread && !isOutbound && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" title="Unread" />
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
