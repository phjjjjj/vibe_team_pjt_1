<template>
  <div class="post-edit-page">
    <h2>게시물 수정</h2>

    <form v-if="post" class="composer" @submit.prevent="submitEdit">
      <label>
        제목
        <input v-model="title" type="text" placeholder="제목을 입력하세요" />
      </label>

      <label>
        내용
        <textarea v-model="content" rows="8" placeholder="내용을 입력하세요"></textarea>
      </label>

      <div class="actions">
        <button type="submit">수정 저장</button>
        <button type="button" @click="goBack">취소</button>
      </div>
    </form>

    <div v-else>
      <p>존재하지 않는 게시물입니다.</p>
      <button @click="goBack">목록으로</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBoardStore } from '../store'

const router = useRouter()
const route = useRoute()
const store = useBoardStore()

const postId = String(route.params.id)
const post = ref(null)
const title = ref('')
const content = ref('')

onMounted(() => {
  store.loadPosts()
  post.value = store.posts.find(p => String(p.id) === postId)
  if (post.value) {
    title.value = post.value.title
    content.value = post.value.content
  }
})

function goBack() {
  router.push('/board')
}

function submitEdit() {
  if (!post.value) return

  if (!title.value.trim()) {
    alert('제목을 입력하세요.')
    return
  }
  if (!content.value.trim()) {
    alert('내용을 입력하세요.')
    return
  }

  store.updatePost({
    id: post.value.id,
    title: title.value.trim(),
    content: content.value.trim(),
    password: post.value.password
  })

  alert('수정되었습니다.')
  router.push('/board')
}
</script>

<style scoped>
.post-edit-page {
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