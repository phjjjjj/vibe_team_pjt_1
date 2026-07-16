<script setup>
import { ref, onMounted } from 'vue'

const messages = ref([
  {
    id: 1,
    role: 'assistant',
    content:
      '안녕하세요! 서울 관광 정보 챗봇입니다. 서울 내 관광지, 축제, 문화시설, 쇼핑, 숙박, 여행 코스 정보를 질문해 주세요.',
  },
])

const newMessage = ref('')
const loading = ref(false)
const error = ref('')
const isOpen = ref(false)

const categoryFiles = {
  관광지: '서울_관광지.json',
  레포츠: '서울_레포츠.json',
  문화시설: '서울_문화시설.json',
  쇼핑: '서울_쇼핑.json',
  숙박: '서울_숙박.json',
  여행코스: '서울_여행코스.json',
  축제: '서울_축제공연행사.json',
}

const findCategories = (text) => {
  const categories = new Set()

  if (/축제|공연|이벤트/.test(text)) categories.add('축제')
  if (/코스|일정|루트/.test(text)) categories.add('여행코스')
  if (/관광지|볼거리|명소/.test(text)) categories.add('관광지')
  if (/레포츠|운동|액티비티/.test(text)) categories.add('레포츠')
  if (/문화|박물관|전시|공연장/.test(text)) categories.add('문화시설')
  if (/쇼핑|시장|백화점|몰/.test(text)) categories.add('쇼핑')
  if (/숙박|호텔|게스트하우스|숙소/.test(text)) categories.add('숙박')

  if (categories.size === 0) categories.add('관광지')
  return [...categories]
}

const loadSeoulData = async (category) => {
  const fileName = categoryFiles[category]
  const res = await fetch(`/data/서울/${fileName}`)
  if (!res.ok) throw new Error(`서울 데이터(${fileName})를 불러올 수 없습니다. 상태: ${res.status}`)
  return await res.json()
}

const normalizeToArray = (raw) => {
  if (Array.isArray(raw)) return raw
  if (raw == null) return []
  if (Array.isArray(raw.items)) return raw.items
  if (Array.isArray(raw.data)) return raw.data
  for (const v of Object.values(raw)) {
    if (Array.isArray(v)) return v
  }
  return []
}

const loadRelevantData = async (text) => {
  const categories = findCategories(text)
  const loaded = await Promise.all(categories.map((category) => loadSeoulData(category)))
  return loaded.flatMap(normalizeToArray)
}

const extractDate = (text) => {
  const match = text.match(/(\d{1,2})\s*(?:월|\/|\.)\s*(\d{1,2})/)
  if (!match) return null
  const month = match[1].padStart(2, '0')
  const day = match[2].padStart(2, '0')
  return `${month}${day}`
}

const filterByDate = (items, monthDay) => {
  if (!monthDay) return items
  return items.filter((item) => {
    const start = item.eventstartdate?.toString()
    const end = item.eventenddate?.toString()
    if (!start || !end) return true
    const startMd = start.slice(4)
    const endMd = end.slice(4)
    return startMd <= monthDay && monthDay <= endMd
  })
}

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = async () => {
  const content = newMessage.value.trim()
  if (!content) return

  error.value = ''
  messages.value.push({ id: Date.now(), role: 'user', content })
  newMessage.value = ''
  loading.value = true

  try {
    const relevantData = await loadRelevantData(content)
    const dateTarget = extractDate(content)
    const filteredData = filterByDate(relevantData, dateTarget)
    const sampleData = filteredData.length ? filteredData.slice(0, 8) : relevantData.slice(0, 8)

    const systemPrompt = `
당신은 서울 지역 관광 정보 챗봇입니다.
사용자의 요청에 맞춰 축제 추천과 여행 일정을 함께 제안하세요.
질문: ${content}

아래 JSON 데이터를 참고하여 답변하세요:
${JSON.stringify(sampleData, null, 2)}

- 요청한 날짜에 맞는 축제가 없으면,
  "제공된 데이터에는 해당 날짜에 열리는 축제가 없습니다"라고 답하세요.
- 그런 경우에도 가능한 서울 여행 일정, 코스, 인근 명소, 또는 같은 기간에 방문할 만한 대체 추천을 함께 제시하세요.
- 반드시 서울 지역 정보만 사용하세요.
`

    const outgoingMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.value.map((msg) => ({ role: msg.role, content: msg.content })),
    ]

    const modelName = import.meta.env.VITE_OPENAI_MODEL || 'gpt-5-mini'
    const payload = {
      model: modelName,
      messages: outgoingMessages,
      max_tokens: 1000,
    }

    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Function 호출 실패: ${res.status} ${text}`)
    }

    const data = await res.json()
    console.log('OpenAI response:', data)

    if (!data || !Array.isArray(data.choices) || data.choices.length === 0) {
    throw new Error(`OpenAI 응답에 choices가 없습니다: ${JSON.stringify(data)}`)
}

    const assistantText = 
      data.choices?.[0]?.message?.content ??
      data.choices?.[0]?.text ??
      ''
    if (!assistantText?.trim()) {
      throw new Error('OpenAI가 빈 응답을 반환했습니다.')
    }

    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: typeof assistantText === 'string' ? assistantText.trim() : JSON.stringify(assistantText, null, 2),
    })
  } catch (err) {
    console.error('Chatbot error:', err)
    const body = String(err?.message || err)
    if (body.includes('Unauthorized') || body.includes('401')) {
      error.value = '서버에서 API 키가 설정되지 않았습니다. (OPENAI_API_KEY 확인)'
    } else if (body.includes('does not have access') || body.includes('model_not_found')) {
      error.value = '모델 접근 권한 문제: 서버 측 KEY/모델 설정을 확인하세요.'
    } else {
      error.value = body
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  window.addEventListener('open-chatbot', () => {
    isOpen.value = true
  })
})
</script>

<template>
  <div class="floating-chat">
    <button class="chat-fab" @click="toggleChat">
      {{ isOpen ? '×' : '💬' }}
    </button>

    <section v-if="isOpen" class="chat-panel">
      <div class="chat-header">
        <h3>서울 관광 챗봇</h3>
        <button class="close-btn" @click="toggleChat">닫기</button>
      </div>

      <div class="chat-history">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['chat-message', msg.role]"
        >
          <div class="message-label">
            {{ msg.role === 'user' ? '나' : '챗봇' }}
          </div>
          <div class="message-content">{{ msg.content }}</div>
        </div>
      </div>

      <div class="chat-input">
        <textarea
          v-model="newMessage"
          placeholder="예: 7월 20일에 갈 만한 축제 추천해줘"
          rows="3"
          :disabled="loading"
        />
        <button @click="sendMessage" :disabled="loading || !newMessage.trim()">
          {{ loading ? '전송 중...' : '전송' }}
        </button>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>
    </section>
  </div>
</template>

<style scoped>
.floating-chat {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;
}

.chat-fab {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: #f6c348;
  color: #000;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

.chat-panel {
  width: min(92vw, 360px);
  max-height: 72vh;
  background: white;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #eee;
  background: #fff7d6;
}

.chat-header h3 {
  font-size: 15px;
  margin: 0;
}

.close-btn {
  border: none;
  background: none;
  color: #333;
  cursor: pointer;
  font-size: 13px;
}

.chat-history {
  display: grid;
  gap: 10px;
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}

.chat-message {
  display: inline-grid;
  justify-self: start;
  width: fit-content;
  max-width: 82%;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  word-break: break-word;
}

.chat-message.user {
  background: #edf2ff;
  justify-self: end;
}

.chat-message.assistant {
  background: #f7fafc;
  justify-self: start;
}

.message-label {
  font-size: 0.75rem;
  color: #666;
}

.message-content {
  white-space: pre-wrap;
  line-height: 1.4;
  font-size: 13px;
}

.chat-input {
  display: flex;
  gap: 10px;
  align-items: stretch;
  padding: 12px;
  border-top: 1px solid #eee;
}

.chat-input textarea {
  flex: 1;
  min-height: 64px;
  border-radius: 12px;
  border: 1px solid #d6d6d6;
  padding: 10px;
  resize: vertical;
  font-size: 13px;
}

.chat-input button {
  width: 56px;
  min-width: 56px;
  border: none;
  border-radius: 12px;
  background: #f6c348;
  color: #000;
  cursor: pointer;
  font-size: 13px;
}

.chat-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-input button:hover:not(:disabled) {
  background: #e6b734;
}

.error-text {
  color: #c53030;
  margin: 10px 12px 12px;
  font-size: 12px;
}
</style>