import { supabase } from './supabaseClient'

// URL do webhook n8n — configure aqui quando tiver
const N8N_COBRANCA_URL  = import.meta.env.VITE_N8N_COBRANCA_URL  || ''
const N8N_PAGAMENTO_URL = import.meta.env.VITE_N8N_PAGAMENTO_URL || ''

/**
 * Dispara cobrança via n8n para um cliente devedor.
 * Cria (ou reutiliza) a conversa no Supabase e
 * registra a mensagem enviada.
 */
export async function dispararCobranca({ clienteKey, clienteNome, telefone, valorDevido }) {
  // 1. Busca ou cria conversa
  let { data: conversa } = await supabase
    .from('conversas')
    .select('id')
    .eq('cliente_key', clienteKey)
    .eq('status', 'automacao')
    .maybeSingle()

  if (!conversa) {
    const { data: nova } = await supabase
      .from('conversas')
      .insert({
        cliente_key:  clienteKey,
        cliente_nome: clienteNome,
        telefone:     telefone || '',
        status:       'automacao',
        nao_lida:     false,
      })
      .select('id')
      .single()
    conversa = nova
  }

  const texto = `Olá ${clienteNome}! 🍪 Passando para lembrar que você tem um valor de R$ ${Number(valorDevido).toFixed(2)} em aberto comigo. Quando puder, me fala! 😊`

  // 2. Salva mensagem no banco
  await supabase.from('mensagens').insert({
    conversa_id: conversa.id,
    texto,
    origem:  'bot',
    lida:    true,
  })

  // 3. Chama webhook n8n (se configurado)
  if (N8N_COBRANCA_URL) {
    await fetch(N8N_COBRANCA_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteNome, telefone, texto, valorDevido }),
    }).catch(() => {}) // silencia erro de rede — não bloqueia UI
  }

  return conversa.id
}

/**
 * Disparado automaticamente quando cliente é marcado como pago.
 * Finaliza a conversa e manda mensagem de agradecimento.
 */
export async function finalizarComAgradecimento({ clienteKey, clienteNome, telefone }) {
  const texto = `Obrigada pelo pagamento, ${clienteNome}! 🥰🍪 Foi um prazer! Qualquer coisa é só me chamar.`

  // 1. Salva mensagem de agradecimento
  const { data: conversa } = await supabase
    .from('conversas')
    .select('id')
    .eq('cliente_key', clienteKey)
    .neq('status', 'finalizada')
    .maybeSingle()

  if (conversa) {
    await supabase.from('mensagens').insert({
      conversa_id: conversa.id,
      texto,
      origem: 'bot',
      lida:   true,
    })

    // 2. Finaliza a conversa
    await supabase
      .from('conversas')
      .update({ status: 'finalizada', nao_lida: false })
      .eq('id', conversa.id)
  }

  // 3. Chama webhook n8n de agradecimento
  if (N8N_PAGAMENTO_URL) {
    await fetch(N8N_PAGAMENTO_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteNome, telefone, texto }),
    }).catch(() => {})
  }
}
