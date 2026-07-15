<script setup>
import { ref } from 'vue'
import BoardPage from './board/BoardPage.vue'

const mbti = ref('')
const mood = ref('')
const dateStyle = ref('')
const placeType = ref('')
const result = ref('')
const loading = ref(false)

const moodOptions = ['기분 전환', '편안한', '활동적인', '감성적인']
const styleOptions = ['로맨틱', '캐주얼', '이색', '힐링']
const placeOptions = ['관광지', '축제', '문화시설', '카페']

const submitRecommendation = async () => {
  if (!mbti.value.trim() || !mood.value || !dateStyle.value || !placeType.value) {
    result.value = '모든 항목을 입력하고 선택해주세요.'
    return
  }

  loading.value = true
  result.value = ''

  const prompt = `
당신은 데이트 추천 전문가입니다.
두 사람 MBTI: ${mbti.value}
현재 기분: ${mood.value}
선호 데이트 스타일: ${dateStyle.value}
선호 장소 유형: ${placeType.value}
위 정보를 바탕으로 흔한 코스가 아닌 특별한 데이트 장소 2곳을 추천해 주세요.
각 장소마다 (1) 장소명 (2) 위치/간단 설명 (3) 추천 이유 (4) 어울리는 활동 (5) 주의할 점을 항목별로 짧게 적어주세요.
`

  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    if (!res.ok) {
      throw new Error(`Network error ${res.status}`)
    }

    const data = await res.json()

    // 여러 API 형태에 대응
    if (data.text) result.value = data.text
    else if (data.result) result.value = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2)
    else result.value = JSON.stringify(data, null, 2)
  } catch (err) {
    result.value = '추천 요청 중 오류가 발생했습니다.'
    // 개발중에는 에러를 콘솔에 출력하면 디버깅에 도움됩니다.
    // console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="home-page">
    <div class="hero">
      <h2>특별한 데이트 장소 추천</h2>

      <div class="recommend-form">
        <label class="field">
          <span class="label-title">두 사람의 MBTI</span>
          <input v-model="mbti" placeholder="예: ENFP / ISFJ" />
        </label>

        <div class="button-group">
          <p class="group-title">기분</p>
          <div class="buttons">
            <button
              v-for="item in moodOptions"
              :key="item"
              type="button"
              :class="{ active: mood === item }"
              @click="mood = item"
            >
              {{ item }}
            </button>
          </div>
        </div>

        <div class="button-group">
          <p class="group-title">선호하는 데이트 스타일</p>
          <div class="buttons">
            <button
              v-for="item in styleOptions"
              :key="item"
              type="button"
              :class="{ active: dateStyle === item }"
              @click="dateStyle = item"
            >
              {{ item }}
            </button>
          </div>
        </div>

        <div class="button-group">
          <p class="group-title">장소 유형</p>
          <div class="buttons">
            <button
              v-for="item in placeOptions"
              :key="item"
              type="button"
              :class="{ active: placeType === item }"
              @click="placeType = item"
            >
              {{ item }}
            </button>
          </div>
        </div>

        <div class="actions">
          <button class="submit" @click="submitRecommendation" :disabled="loading">
            {{ loading ? '추천 중...' : '추천 받기' }}
          </button>
        </div>
      </div>

      <div class="recommend-result" v-if="result">
        <h3>추천 결과</h3>
        <pre class="result-box">{{ result }}</pre>
      </div>
    </div>

    <div class="board-section">
      <h3>최근 추천 게시물</h3>
      <BoardPage />
    </div>
  </section>
</template>

<style scoped>
.home-page {
  display: grid;
  gap: 28px;
}

.hero {
  background: #fff;
  padding: 18px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #eee;
}

.recommend-form {
  display: grid;
  gap: 12px;
  margin-top: 8px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field input {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #dcdcdc;
  font-size: 14px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.buttons button {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

.buttons button.active {
  background: #2b6cb0;
  color: #fff;
  border-color: #2b6cb0;
}

.actions {
  margin-top: 8px;
}

.submit {
  padding: 10px 16px;
  border-radius: 8px;
  background: #2b6cb0;
  color: #fff;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.submit[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.recommend-result {
  margin-top: 12px;
}

.result-box {
  white-space: pre-wrap;
  background: #fafafa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eee;
  font-size: 14px;
  color: #222;
}

.board-section {
  background: #fff;
  padding: 14px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #eee;
}

@media (max-width: 640px) {
  .buttons button {
    padding: 8px 10px;
    font-size: 13px;
  }
}
</style>g