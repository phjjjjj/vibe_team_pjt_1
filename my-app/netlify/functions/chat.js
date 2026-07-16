// netlify/functions/chat.js
// 간단한 안전 로깅 추가 + 입력 검증
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

    const requestId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`
    let body
    try {
      body = JSON.parse(event.body || '{}')
    } catch (e) {
      log('error', { requestId, msg: 'Invalid JSON', err: String(e) })
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
    }

    const model = body.model || process.env.OPENAI_MODEL || 'gpt-5-mini'
    const messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      log('warn', { requestId, msg: 'Invalid messages', model })
      return { statusCode: 400, body: JSON.stringify({ error: 'messages must be a non-empty array' }) }
    }

    // 로그: 요청 수신 (민감 내용 제외, 메시지 수 등만 기록)
    log('info', {
      requestId,
      event: 'request_received',
      model,
      messagesCount: messages.length,
    })

    // 준비: payload (민감한 전체 메시지 내용은 로그하지 않음)
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
      log('error', { requestId, msg: 'Missing OPENAI_API_KEY in environment' })
      return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) }
    }

    // OpenAI 호출 (로깅: 요청 보낸 시각과 모델, 토큰 파라미터 존재 여부)
    log('info', {
      requestId,
      event: 'call_openai_start',
      model,
      hasTemperature: payload.hasOwnProperty('temperature'),
      tokenParam: payload.max_tokens ? 'max_tokens' : payload.max_completion_tokens ? 'max_completion_tokens' : 'none',
    })

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

    log('info', { requestId, event: 'call_openai_end', status })

    // 주의: production에서는 text(전체 응답)를 무분별하게 클라이언트로 전달하지 마세요.
    if (!res.ok) {
      log('error', { requestId, event: 'openai_error', status, bodySnippet: text.slice(0, 500) })
      return {
        statusCode: status,
        headers: { 'Content-Type': 'application/json' },
        body: text, // 개발중엔 그대로 전달, 프로덕션에선 메시지 가공 권장
      }
    }

    // 성공: 로그 (간단 요약)
    log('info', { requestId, event: 'openai_success' })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: text,
    }
  } catch (err) {
    // 서버 측 상세 로그(스택 포함)
    console.error(err)
    log('error', { msg: 'Unhandled server error', err: String(err) })
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}