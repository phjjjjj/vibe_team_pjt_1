<template>
  <div class="calendar">
    <header class="cal-header">
      <button @click="prevMonth">◀</button>
      <div class="month-label">{{ monthNames[currentMonth] }} {{ currentYear }}</div>
      <button @click="nextMonth">▶</button>
    </header>

    <div class="weekdays">
      <div v-for="d in weekdayNames" :key="d" class="weekday">{{ d }}</div>
    </div>

    <div class="days-grid">
      <div v-for="cell in grid" :key="cell.key" :class="['day-cell', { 'other-month': cell.other }]">
        <div class="day-top">
          <span class="day-number" @click="selectDate(cell.date)">{{ cell.day }}</span>
          <span class="dot" v-if="hasEvents(cell.date)"></span>
        </div>
        <ul class="mini-events" v-if="eventsFor(cell.date).length">
          <li v-for="ev in eventsFor(cell.date)" :key="ev.id">{{ ev.title }}</li>
        </ul>
      </div>
    </div>

    <div class="selected-area" v-if="selectedDate">
  <h4>{{ selectedDate }}</h4>
  <ul>
    <li v-for="ev in eventsFor(selectedDate)" :key="ev.id">
      <div class="event-item">
        <span>{{ ev.title }}</span>
        <small v-if="ev.source === 'festival'">(축제)</small>
      </div>

      <p v-if="ev.source === 'festival'" class="festival-detail">
        {{ ev.place }}
        <span v-if="ev.place && ev.description"> · </span>
        {{ ev.description }}
      </p>

      <button
        class="small"
        v-if="ev.source !== 'festival'"
        @click="removeEvent(selectedDate, ev.id)"
      >
        삭제
      </button>
    </li>
  </ul>

  <div class="add-area">
    <input v-model="newTitle" placeholder="이벤트 제목" />
    <button @click="addEvent">추가</button>
    <button @click="clearSelected">닫기</button>
  </div>
</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

async function loadFestivalData() {
  try {
    const res = await fetch(encodeURI('/data/서울/서울_축제공연행사.json'))
    const json = await res.json()

    const items = json.items || []
    items.forEach(item => {
      if (!item.eventstartdate) return

      const start = parseYYYYMMDD(item.eventstartdate)
      const end = item.eventenddate ? parseYYYYMMDD(item.eventenddate) : start
      if (!start || !end) return

      const dateKeys = eachDateInRange(start, end)
      const festivalEvent = {
        id: `festival-${item.contentid}`,
        title: item.title,
        place: item.eventplace || '',
        start: item.eventstartdate,
        end: item.eventenddate || item.eventstartdate,
        description: item.program || '',
        source: 'festival'
      }

      dateKeys.forEach(dateKey => {
        if (!festivalEvents.value[dateKey]) festivalEvents.value[dateKey] = []
        festivalEvents.value[dateKey].push(festivalEvent)
      })
    })
  } catch (e) {
    console.error('Festival load failed', e)
  }
}

onMounted(() => {
  loadFestivalData()
})

function yyyyMMdd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
const weekdayNames = ['일','월','화','수','목','금','토']

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())

const selectedDate = ref(null)
const newTitle = ref('')

const storageKey = 'calendarEvents'
function loadEvents() {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    console.error(e)
    return {}
  }
}
const events = ref(loadEvents())
const festivalEvents = ref({})

function saveEvents() {
  try { localStorage.setItem(storageKey, JSON.stringify(events.value)) } catch (e) { console.error(e) }
}

function startOfMonth(year, month) { return new Date(year, month, 1) }
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function firstWeekday(year, month) { return startOfMonth(year, month).getDay() }

const grid = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const first = firstWeekday(year, month)
  const total = daysInMonth(year, month)
  const cells = []

  const prevLast = new Date(year, month, 0).getDate()
  for (let i = first - 1; i >= 0; i--) {
    const day = prevLast - i
    const d = new Date(year, month - 1, day)
    cells.push({ key: `p-${day}-${i}`, day, date: yyyyMMdd(d), other: true })
  }

  for (let d = 1; d <= total; d++) {
    const date = yyyyMMdd(new Date(year, month, d))
    cells.push({ key: `c-${d}`, day: d, date, other: false })
  }

  while (cells.length % 7 !== 0) {
    const nextIndex = cells.length - (first + total) + 1
    const dDate = new Date(year, month + 1, nextIndex)
    cells.push({ key: `n-${nextIndex}`, day: dDate.getDate(), date: yyyyMMdd(dDate), other: true })
  }

  return cells
})

function hasEvents(dateStr) {
  return (
    (events.value[dateStr]?.length || 0) +
    (festivalEvents.value[dateStr]?.length || 0)
  ) > 0
}

function eventsFor(dateStr) {
  return [
    ...(festivalEvents.value[dateStr] || []),
    ...(events.value[dateStr] || [])
  ]
}

function prevMonth() {
  if (currentMonth.value === 0) { currentYear.value -= 1; currentMonth.value = 11 }
  else currentMonth.value -= 1
}
function nextMonth() {
  if (currentMonth.value === 11) { currentYear.value += 1; currentMonth.value = 0 }
  else currentMonth.value += 1
}

function selectDate(dateStr) {
  selectedDate.value = dateStr
  newTitle.value = ''
}

function clearSelected() {
  selectedDate.value = null
  newTitle.value = ''
}

function addEvent() {
  if (!selectedDate.value || !newTitle.value.trim()) {
    alert('날짜와 제목을 입력하세요.')
    return
  }
  const list = events.value[selectedDate.value] || []
  const id = Date.now().toString()
  list.push({ id, title: newTitle.value.trim() })
  events.value[selectedDate.value] = list
  saveEvents()
  newTitle.value = ''
}

function removeEvent(dateStr, id) {
  const list = (events.value[dateStr] || []).filter(e => e.id !== id)
  if (list.length) events.value[dateStr] = list
  else delete events.value[dateStr]
  saveEvents()
}

function parseYYYYMMDD(value) {
  if (!value) return null
  const year = value.slice(0, 4)
  const month = value.slice(4, 6)
  const day = value.slice(6, 8)
  return new Date(`${year}-${month}-${day}`)
}

function formatDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function eachDateInRange(startDate, endDate) {
  const dates = []
  let current = new Date(startDate)
  while (current <= endDate) {
    dates.push(formatDateKey(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

</script>

<style scoped>
.calendar { max-width:720px; margin: 0 auto; font-family: Arial, sans-serif; }
.cal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.month-label { font-weight:600 }
.weekdays { display:grid; grid-template-columns:repeat(7,1fr); text-align:center; color:#666; margin-bottom:6px; }
.weekday { padding:6px 0; }
.days-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:6px; }
.day-cell { background:#fff; border:1px solid #eee; min-height:70px; padding:6px; border-radius:6px; position:relative; }
.other-month { opacity:0.4 }
.day-top { display:flex; justify-content:space-between; align-items:center; }
.day-number { font-weight:600; cursor:pointer; }
.dot { width:8px; height:8px; background:#2b6cb0; border-radius:50%; display:inline-block; }
.mini-events { margin:6px 0 0 0; padding:0; list-style:none; font-size:12px; color:#333; max-height:54px; overflow:hidden }
.selected-area { margin-top:12px; background:#fafafa; padding:10px; border-radius:6px; border:1px solid #eee }
.add-area { display:flex; gap:8px; margin-top:8px }
.add-area input { flex:1; padding:6px; border-radius:4px; border:1px solid #ddd }
.small { font-size:12px; margin-left:8px; padding:4px 6px; }
</style>