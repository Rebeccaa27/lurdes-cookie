import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Bot, BellDot, CheckCheck, Send, Phone, X, Clock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useConversas, useMensagens } from '../lib/hooks'
import { useToast } from '../components/Toast'

const ABAS = [
  { id: 'todas',      label: 'Conversas',  icon: MessageSquare },
  { id: 'nao_lidas',  label: 'Não lidas',  icon: BellDot       },
  { id: 'automacao',  label: 'Automação',  icon: Bot           },
  { id: 'finalizadas',label: 'Finalizadas',icon: CheckCheck    },
]

const STATUS_BADGE = {
  aberta:     { label: 'Aberta',     cls: 'badge-blue'   },
  automacao:  { label: 'Automação',  cls: 'badge-purple' },
  finalizada: { label: 'Finalizada', cls: 'badge-green'  },
}

function formatHora(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
function formatData(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

const AVATAR_COLORS = [
  ['#FDE8D8','#C05621'],['#D1FAE5','#065F46'],['#EDE9FE','#5B21B6'],
  ['#FEE2E2','#991B1B'],['#E0F2FE','#0369A1'],['#FEF9C3','#854D0E'],
]
function avatarColor(nome = '') {
  let h = 0
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) & 0xfffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function ultimaMensagem(conversa) {
  const msgs = conversa.mensagens || []
  if (!msgs.length) return { texto: 'Sem mensagens', hora: '' }
  const last = msgs.reduce((a, b) => a.criado_em > b.criado_em ? a : b)
  return { texto: last.texto, hora: last.criado_em }
}

export default function Chat() {
  const [aba, setAba]               = useState('todas')
  const [conversaId, setConversaId] = useState(null)
  const [novaMsg, setNovaMsg]       = useState('')
  const [enviando, setEnviando]     = useState(false)
  const [mobileDetalhe, setMobileDetalhe] = useState(false)
  const bottomRef = useRef(null)
  const toast = useToast()

  const { conversas, loading } = useConversas(aba)
  const { mensagens }          = useMensagens(conversaId)
  const conversaAtiva          = conversas.find(c => c.id === conversaId) || null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  // Marca como lida ao abrir
  useEffect(() => {
    if (!conversaId) return
    supabase.from('conversas').update({ nao_lida: false }).eq('id', conversaId).then(() => {})
  }, [conversaId])

  function abrirConversa(id) {
    setConversaId(id)
    setMobileDetalhe(true)
  }

  async function enviarMensagem() {
    if (!novaMsg.trim() || !conversaId) return
    setEnviando(true)
    const texto = novaMsg.trim()
    setNovaMsg('')

    await supabase.from('mensagens').insert({
      conversa_id: conversaId,
      texto,
      origem: 'manual',
      lida:   true,
    })

    await supabase.from('conversas')
      .update({ atualizado_em: new Date().toISOString(), status: 'aberta' })
      .eq('id', conversaId)

    setEnviando(false)
    toast('Mensagem registrada')
  }

  async function finalizarConversa() {
    if (!conversaId) return
    if (!confirm('Finalizar esta conversa?')) return
    await supabase.from('conversas').update({ status: 'finalizada' }).eq('id', conversaId)
    toast('Conversa finalizada')
    setConversaId(null)
    setMobileDetalhe(false)
  }

  const naoLidasCount = conversas.filter(c => c.nao_lida).length

  return (
    <div className="chat-layout">

      {/* ── Lista lateral ─────────────────────────────── */}
      <div className={`chat-list ${mobileDetalhe ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>

        {/* Header lista */}
        <div className="px-4 pt-5 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--text-hi)' }}>Chat</h1>

          {/* Sub-abas */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {ABAS.map(a => {
              const Icon = a.icon
              const isAtiva = aba === a.id
              return (
                <button
                  key={a.id}
                  onClick={() => { setAba(a.id); setConversaId(null) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition"
                  style={{
                    background: isAtiva ? 'var(--brand)' : 'transparent',
                    color: isAtiva ? '#fff' : 'var(--text-lo)',
                  }}
                >
                  <Icon size={13} strokeWidth={2.2} />
                  {a.label}
                  {a.id === 'nao_lidas' && naoLidasCount > 0 && (
                    <span className="ml-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {naoLidasCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Lista conversas */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : conversas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <MessageSquare size={28} style={{ color: 'var(--text-lo)' }} strokeWidth={1.5} />
              <p className="text-sm" style={{ color: 'var(--text-lo)' }}>Nenhuma conversa aqui</p>
            </div>
          ) : (
            conversas.map(c => {
              const [bg, fg] = avatarColor(c.cliente_nome)
              const { texto, hora } = ultimaMensagem(c)
              const ativa = c.id === conversaId
              const badge = STATUS_BADGE[c.status] || STATUS_BADGE.aberta
              return (
                <button
                  key={c.id}
                  onClick={() => abrirConversa(c.id)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left transition"
                  style={{
                    background: ativa ? 'rgba(160,82,45,.08)' : 'transparent',
                    borderLeft: ativa ? '3px solid var(--brand)' : '3px solid transparent',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
                    style={{ background: bg, color: fg }}>
                    {c.cliente_nome?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-hi)' }}>
                        {c.nao_lida && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 mb-0.5" />}
                        {c.cliente_nome}
                      </p>
                      <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-lo)' }}>
                        {hora ? formatData(hora) : ''}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-lo)' }}>{texto}</p>
                    <span className={`badge ${badge.cls} mt-1`} style={{ fontSize: '10px' }}>{badge.label}</span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Janela de mensagens ──────────────────────── */}
      <div className={`chat-window ${!mobileDetalhe && !conversaId ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>

        {!conversaAtiva ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <MessageSquare size={40} strokeWidth={1.2} style={{ color: 'var(--text-lo)' }} />
            <p style={{ color: 'var(--text-lo)' }}>Selecione uma conversa</p>
          </div>
        ) : (
          <>
            {/* Header conversa */}
            <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
              style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <button className="lg:hidden btn btn-ghost btn-sm" onClick={() => setMobileDetalhe(false)}>
                <X size={16} />
              </button>
              {(() => {
                const [bg, fg] = avatarColor(conversaAtiva.cliente_nome)
                return (
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: bg, color: fg }}>
                    {conversaAtiva.cliente_nome?.[0]?.toUpperCase()}
                  </div>
                )
              })()}
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-hi)' }}>{conversaAtiva.cliente_nome}</p>
                {conversaAtiva.telefone && (
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-lo)' }}>
                    <Phone size={11} /> {conversaAtiva.telefone}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${STATUS_BADGE[conversaAtiva.status]?.cls || 'badge-blue'}`}>
                  {STATUS_BADGE[conversaAtiva.status]?.label || 'Aberta'}
                </span>
                {conversaAtiva.status !== 'finalizada' && (
                  <button onClick={finalizarConversa} className="btn btn-secondary btn-sm">
                    <CheckCheck size={14} /> Finalizar
                  </button>
                )}
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {mensagens.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-2">
                  <Clock size={28} strokeWidth={1.5} style={{ color: 'var(--text-lo)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-lo)' }}>Nenhuma mensagem ainda</p>
                </div>
              ) : (
                mensagens.map(m => (
                  <AnimatePresence key={m.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`chat-bubble-${
                        m.origem === 'cliente' ? 'cliente' :
                        m.origem === 'manual'  ? 'manual'  : 'bot'
                      }`}
                    >
                      {m.origem === 'bot' && (
                        <p className="text-[10px] font-semibold mb-1 flex items-center gap-1" style={{ color: 'var(--text-lo)' }}>
                          <Bot size={10} /> Automação
                        </p>
                      )}
                      <p>{m.texto}</p>
                      <p className="text-[10px] mt-1 text-right opacity-60">{formatHora(m.criado_em)}</p>
                    </motion.div>
                  </AnimatePresence>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input envio — só se não finalizada */}
            {conversaAtiva.status !== 'finalizada' && (
              <div className="px-4 py-3 flex gap-2 flex-shrink-0"
                style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                <input
                  className="field flex-1"
                  placeholder="Digite uma mensagem..."
                  value={novaMsg}
                  onChange={e => setNovaMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensagem()}
                />
                <button
                  onClick={enviarMensagem}
                  disabled={!novaMsg.trim() || enviando}
                  className="btn btn-primary btn-sm"
                >
                  {enviando
                    ? <span className="spinner" style={{ width: 14, height: 14 }} />
                    : <Send size={15} />
                  }
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
