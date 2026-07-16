<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import BoardPage from './board/BoardPage.vue'
import CalendarPage from './components/CalendarPage.vue'

const mbti = ref('')
const mood = ref('')
const dateStyle = ref('')
const placeType = ref('')
const result = ref('')
const loading = ref(false)

const city = ref('')
const weatherInfo = ref(null)
const weatherLoading = ref(false)
const weatherError = ref('')

const moodOptions = ['기분 전환', '편안한', '활동적인', '감성적인']
const styleOptions = ['로맨틱', '캐주얼', '이색', '힐링']
const placeOptions = ['관광지', '축제', '문화시설', '카페']

const fetchWeather = async () => {
  if (!city.value.trim()) {
    weatherError.value = '도시를 입력해주세요.'
    weatherInfo.value = null
    return
  }

  weatherLoading.value = true
  weatherError.value = ''
  weatherInfo.value = null

  try {
    const apiKey = 'dbe0835b38d9cdaf7efb1d6e4793606d'
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city.value
    )}&appid=${apiKey}&units=metric&lang=kr`

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error('날씨 정보를 가져오지 못했습니다.')
    }

    const data = await res.json()

    weatherInfo.value = {
      name: data.name,
      description: data.weather[0].description,
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity
    }
  } catch (error) {
    weatherError.value = error.message || '날씨 조회 실패'
  } finally {
    weatherLoading.value = false
  }
}

const weatherText = computed(() => {
  return weatherInfo.value
    ? `현재 ${weatherInfo.value.name}의 날씨는 ${weatherInfo.value.description}이며, 기온은 ${weatherInfo.value.temp}°C, 체감 기온은 ${weatherInfo.value.feelsLike}°C, 습도는 ${weatherInfo.value.humidity}% 입니다.`
    : '현재 날씨 정보는 없습니다.'
})

const getSelectedCategory = () => {
  if (placeType.value === '카페') return '관광지'
  return placeType.value || '관광지'
}

const getSelectedDataFile = () => {
  const map = {
    관광지: '서울_관광지.json',
    축제: '서울_축제공연행사.json',
    문화시설: '서울_문화시설.json'
  }
  return map[getSelectedCategory()] || '서울_관광지.json'
}

const loadSeoulData = async () => {
  try {
    const fileName = getSelectedDataFile()
    const res = await fetch(`/data/서울/${fileName}`)
    if (!res.ok) {
      console.error(`Failed to load ${fileName}`)
      return []
    }
    const data = await res.json()
    
    if (Array.isArray(data)) return data
    if (data.items && Array.isArray(data.items)) return data.items
    if (data.data && Array.isArray(data.data)) return data.data
    
    for (const value of Object.values(data)) {
      if (Array.isArray(value)) return value
    }
    return []
  } catch (error) {
    console.error('Error loading Seoul data:', error)
    return []
  }
}

const buildRecommendationPrompt = async () => {
  const category = getSelectedCategory()
  const dataArray = await loadSeoulData()
  const sampleData = dataArray.slice(0, 15)
  
  return `당신은 서울 관광 정보 추천 전문가입니다.

사용자의 데이트 선호도:
- MBTI: ${mbti.value || '미입력'}
- 기분: ${mood.value || '미선택'}
- 데이트 스타일: ${dateStyle.value || '미선택'}
- 장소 유형: ${placeType.value || '미선택'}
- 날씨: ${weatherText.value}

아래 서울 ${category} 데이터를 참고하여, 위 조건에 맞는 최고의 데이트 장소 3곳을 추천해주세요.

각 장소마다:
1. 장소명
2. 위치/주소
3. 간단한 설명
4. 왜 추천했는지
5. 어울리는 활동
6. 주의할 점

데이터:
${JSON.stringify(sampleData, null, 2)}`
}

const openChatbotWithRecommendation = async () => {
  const prompt = await buildRecommendationPrompt()
  window.dispatchEvent(
    new CustomEvent('open-chatbot-with-recommendation', {
      detail: {
        initialMessage: prompt,
        category: getSelectedCategory(),
        region: '서울'
      }
    })
  )
}

const selectMood = (item) => {
  mood.value = item
  openChatbotWithRecommendation()
}

const selectStyle = (item) => {
  dateStyle.value = item
  openChatbotWithRecommendation()
}

const selectPlaceType = (item) => {
  placeType.value = item
  openChatbotWithRecommendation()
}

const handleRecommendationResponse = (event) => {
  const content = event.detail?.content
  if (content) result.value = content
}

onMounted(() => {
  window.addEventListener('recommendation-response', handleRecommendationResponse)
})

onBeforeUnmount(() => {
  window.removeEventListener('recommendation-response', handleRecommendationResponse)
})

const submitRecommendation = async () => {
  if (!mbti.value.trim() || !mood.value || !dateStyle.value || !placeType.value) {
    result.value = '모든 항목을 입력하고 선택해주세요.'
    return
  }

  loading.value = true
  result.value = ''
  await openChatbotWithRecommendation()
  loading.value = false
}
</script>

<template>
  <section class="home-page">
    <div class="hero">
      <h2>데이트 장소 추천❤️</h2>

      <div class="recommend-form">
        <label class="field">
          <span class="label-title">두 사람의 MBTI😀</span>
          <input v-model="mbti" placeholder="예: ENFP / ISFJ" />
        </label>

        <div class="button-group">
          <p class="group-title">기분🎶</p>
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
          <p class="group-title">선호하는 데이트 스타일✨</p>
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
          <p class="group-title">장소 유형🚩</p>
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

        <label class="field">
          <span class="label-title">도시</span>
          <input v-model="city" placeholder="예: Seoul, Busan" />
        </label>

        <div class="actions">
          <button type="button" @click="fetchWeather" :disabled="weatherLoading">
            {{ weatherLoading ? '날씨 조회 중...' : '날씨 조회' }}
          </button>
        </div>

        <div v-if="weatherError" class="error">{{ weatherError }}</div>

        <div v-if="weatherInfo" class="weather-box">
          <p>현재 위치: {{ weatherInfo.name }}</p>
          <p>날씨: {{ weatherInfo.description }}</p>
          <p>기온: {{ weatherInfo.temp }}°C</p>
          <p>체감: {{ weatherInfo.feelsLike }}°C</p>
          <p>습도: {{ weatherInfo.humidity }}%</p>
        </div>

        <div class="actions">
          <button class="submit" @click="submitRecommendation" :disabled="loading">
            {{ loading ? '추천 중...' : '추천 받기' }}
          </button>
        </div>
      </div>

      <div class="recommend-result" v-if="result">
        <h3>추천 결과⭐</h3>
        <pre class="result-box">{{ result }}</pre>
      </div>
    </div>

    <div class="board-section">
      <h2>최근 추천 게시물📖</h2>
      <BoardPage :hideTitle="true" />
    </div>

    <div class="calendar-section">
      <h2>캘린더🗓️</h2>
      <CalendarPage />
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
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.weather-box {
  background: #f7faff;
  border: 1px solid #dce9ff;
  padding: 12px;
  border-radius: 8px;
  margin-top: 10px;
}

.error {
  color: #d64545;
  margin-top: 8px;
}

.board-section,
.calendar-section {
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
</style>