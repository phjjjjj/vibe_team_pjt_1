<script setup>
import { ref } from 'vue'
import { useBoardStore } from './store'

const store = useBoardStore()

const title = ref('')
const content = ref('')

function submitPost() {
  if (!title.value.trim() || !content.value.trim()) return

  store.addPost({
    title: title.value,
    content: content.value
  })

  title.value = ''
  content.value = ''
}
</script>

<template>
  <div style="max-width: 700px; margin: 40px auto; font-family: sans-serif;">
    <h1>익명 게시판</h1>

    <form @submit.prevent="submitPost" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
      <input v-model="title" placeholder="제목" />
      <textarea v-model="content" placeholder="내용" rows="4" />
      <button type="submit">작성</button>
    </form>

    <ul style="list-style: none; padding: 0;">
      <li
        v-for="post in store.posts"
        :key="post.id"
        style="border: 1px solid #ddd; padding: 12px; margin-bottom: 10px;"
      >
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
      </li>
    </ul>
  </div>
</template>