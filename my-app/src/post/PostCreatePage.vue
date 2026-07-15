<template>
  <div class="post-create-page">
    <h2>글 작성</h2>

    <form class="composer" @submit.prevent="submitPost">
      <label>
        제목
        <input v-model="form.title" type="text" placeholder="제목을 입력하세요" />
      </label>

      <label>
        내용
        <textarea v-model="form.content" rows="8" placeholder="내용을 입력하세요"></textarea>
      </label>

      <label>
        비밀번호 (수정/삭제 시 필요)
        <input v-model="form.password" type="password" placeholder="비밀번호를 입력하세요" />
      </label>

      <div class="actions">
        <button type="submit">작성하기</button>
        <button type="button" @click="cancel">취소</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '../store'

// store와 router 사용 준비
const store = useBoardStore()
const router = useRouter()

// 입력값 상태
const form = ref({
  title: '',
  content: '',
  password: ''
})

// 제출 함수: 유효성 검사 -> store.addPost -> 목록으로 이동
function submitPost() {
  // 간단한 유효성 검사
  if (!form.value.title.trim()) {
    alert('제목을 입력하세요.')
    return
  }
  if (!form.value.content.trim()) {
    alert('내용을 입력하세요.')
    return
  }
  if (!form.value.password.trim()) {
    alert('비밀번호를 입력하세요.')
    return
  }

  // store.addPost 호출 (store에서 id, createdAt 처리됨)
  store.addPost({
    title: form.value.title.trim(),
    content: form.value.content.trim(),
    author: '익명',
    password: form.value.password.trim()
  })

  // 작성 후 목록으로 이동
  router.push('/board')
}

// 취소 버튼: 목록으로 이동
function cancel() {
  router.push('/board')
}
</script>

<style scoped>
.post-create-page {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.composer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #333;
}

input[type="text"],
input[type="password"],
textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 10px 14px;
  border: none;
  background: #2b6cb0;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

button[type="button"] {
  background: #888;
}
</style>