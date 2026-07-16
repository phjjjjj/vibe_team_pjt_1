<script setup>
import { ref } from 'vue'

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

const findCategory = (text) => {
  if (/축제|공연|이벤트/.test(text)) return '축제'
  if (/관광지|볼거리|명소/.test(text)) return '관광지'
  if (/레포츠|운동|액티비티/.test(text)) return '레포츠'
  if (/문화|박물관|전시|공연장/.test(text)) return '문화시설'
  if (/쇼핑|시장|백화점|몰/.test(text)) return '쇼핑'
  if (/숙박|호텔|게스트하우스|숙소/.test(text)) return '숙박'
  if (/코스|일정|루트/.test(text)) return '여행코스'
  return '관광지'
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
    const category = findCategory(content)
    const rawData = await loadSeoulData(category)
    const dataArray = normalizeToArray(rawData)
    const sampleData = dataArray.length ? dataArray.slice(0, 6) : [rawData]

    const systemPrompt = `
당신은 서울 지역 관광 정보 챗봇입니다.
아래 JSON 데이터를 참고하여 사용자의 질문에 서울 정보만으로 답변하세요.
질문: ${content}
데이터(요약):
${JSON.stringify(sampleData, null, 2)}
(위 데이터를 참고해, 짧고 명확하게 답변하세요.)
`

    const outgoingMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.value.map((msg) => ({ role: msg.role, content: msg.content })),
    ]

    const modelName = import.meta.env.VITE_OPENAI_MODEL || 'gpt-5-mini'

    const payload = {
      model: modelName,
      messages: outgoingMessages,
      max_completion_tokens: 800,
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
    const assistantText = data.choices?.[0]?.message?.content
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
          placeholder="예: 서울에서 이번 주말에 갈 만한 축제 추천해줘"
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
  background: var(--accent);
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

.chat-panel {
  width: min(92vw, 340px);
  max-height: 68vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  background: var(--accent-bg);
}

.chat-header h3 {
  font-size: 15px;
  margin: 0;
}

.close-btn {
  border: none;
  background: none;
  color: var(--accent-dark);
  cursor: pointer;
  font-size: 13px;
}

.chat-history {
  display: grid;
  gap: 10px;
  padding: 10px;
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
  border-radius: 10px;
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
  padding: 10px;
  border-top: 1px solid #eee;
}

.chat-input textarea {
  flex: 1;
  min-height: 62px;
  width: auto;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid #d6d6d6;
  padding: 10px;
  resize: vertical;
  font-size: 13px;
}

.chat-input button {
  width: 40px;
  min-width: 40px;
  height: auto;
  padding: 10px 6px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  line-height: 1.2;
  align-self: stretch;
}

.chat-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-input button:hover {
  background: var(--accent-hover);
}

.error-text {
  color: #c53030;
  margin-top: 6px;
  padding: 0 10px 10px;
  font-size: 12px;
}
</style>