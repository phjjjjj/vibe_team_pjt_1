export async function handler(event) {
  const log = (level, obj) => {
    const entry = { ts: new Date().toISOString(), level, ...obj }
    console.log(JSON.stringify(entry))
  }

  try {
    if (event.httpMethod !== 'POST') {
      log('warn', { msg: 'Method Not Allowed', method: event.httpMethod })
      return { statusCode: 405, body: 'Method Not Allowed' }
    }

    let body
    try {
      body = JSON.parse(event.body || '{}')
    } catch (e) {
      log('error', { msg: 'Invalid JSON', err: String(e) })
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
    }

    const model = body.model || process.env.OPENAI_MODEL || 'gpt-5-mini'
    const messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      log('warn', { msg: 'Invalid messages', model })
      return { statusCode: 400, body: JSON.stringify({ error: 'messages must be a non-empty array' }) }
    }

    const temperature = typeof body.temperature === 'number' ? body.temperature : undefined
    const maxTokens = body.max_tokens ?? body.maxTokens
    const maxCompletionTokens = body.max_completion_tokens ?? maxTokens

    const payload = { model, messages }
    if (typeof temperature === 'number') payload.temperature = temperature
    if (typeof maxCompletionTokens === 'number') {
      payload.max_completion_tokens = maxCompletionTokens
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_KEY) {
      log('error', { msg: 'Missing OPENAI_API_KEY in environment' })
      return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) }
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const status = res.status
    const text = await res.text()

    if (!res.ok) {
      log('error', { msg: 'openai_error', status, bodySnippet: text.slice(0, 500) })
      return {
        statusCode: status,
        headers: { 'Content-Type': 'application/json' },
        body: text,
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: text,
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}