<script setup>
import { ref } from 'vue'

const messages = ref([
  { id: 1, role: 'assistant', content: '안녕하세요! 지역 관광 정보 챗봇입니다. 질문을 입력해 주세요.' },
])
const newMessage = ref('')
const loading = ref(false)
const error = ref('')

const sendMessage = async () => {
  const content = newMessage.value.trim()
  if (!content) return

  error.value = ''
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content,
  })
  newMessage.value = ''
  loading.value = true

  try {
    const chatMessages = [
      {
        role: 'system',
        content:
          '당신은 한국 지역 관광 정보 챗봇입니다. 사용자의 질문에 대해 친절하고 간결하게 답변해 주세요.',
      },
      ...messages.value.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: chatMessages,
        temperature: 0.8,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`${res.status} ${body}`)
    }

    const data = await res.json()
    const assistantText = data.choices?.[0]?.message?.content || '응답을 받지 못했습니다.'

    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: assistantText.trim(),
    })
  } catch (err) {
    error.value = '챗봇 응답 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="chatbot-page">
    <h2>지역 관광 챗봇</h2>

    <div class="chat-window">
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
          placeholder="예: 서울에서 추천할 만한 축제 알려줘"
          rows="3"
          :disabled="loading"
        />
        <button @click="sendMessage" :disabled="loading || !newMessage.trim()">
          {{ loading ? '전송 중...' : '전송' }}
        </button>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>
    </div>
  </section>
</template>

<style scoped>
.chatbot-page {
  display: grid;
  gap: 18px;
}

.chat-window {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 0 0 1px #e5e5e5;
}

.chat-history {
  display: grid;
  gap: 12px;
  max-height: 54vh;
  overflow-y: auto;
  padding-right: 4px;
}

.chat-message {
  display: grid;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
}

.chat-message.user {
  background: #edf2ff;
  justify-self: flex-end;
  align-self: flex-end;
}

.chat-message.assistant {
  background: #f7fafc;
}

.message-label {
  font-size: 0.82rem;
  color: #666;
}

.message-content {
  white-space: pre-wrap;
  line-height: 1.5;
}

.chat-input {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.chat-input textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #d6d6d6;
  padding: 12px;
  resize: vertical;
  font-size: 14px;
}

.chat-input button {
  width: 100px;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: #2b6cb0;
  color: #fff;
  cursor: pointer;
}

.chat-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: #c53030;
}
</style>