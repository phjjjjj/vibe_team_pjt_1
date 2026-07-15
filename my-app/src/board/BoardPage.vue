<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '../store'

const router = useRouter()
const boardStore = useBoardStore()

const posts = computed(() => boardStore.posts)

function goWrite() {
  router.push('/board/write')
}

function removePost(id) {
  const post = boardStore.posts.find(p => p.id === id)
  if (!post) {
    alert('게시물을 찾을 수 없습니다.')
    return
  }

  const input = prompt('삭제를 위해 비밀번호를 입력하세요.')
  if (!input) return

  if (input !== post.password) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  boardStore.deletePost(id)
  alert('삭제되었습니다.')
}
</script>

<template>
  <div>
    <h2>게시판 목록</h2>
    <button @click="goWrite" style="margin-bottom:12px;">글 작성</button>

    <ul v-if="posts.length">
      <li v-for="post in posts" :key="post.id" style="margin-bottom:12px; border-bottom:1px solid #ddd; padding-bottom:8px;">
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
        <small>{{ new Date(post.createdAt).toLocaleString() }}</small>
        <div>
          <button @click="removePost(post.id)">삭제</button>
        </div>
      </li>
    </ul>

    <p v-else>아직 작성된 글이 없습니다.</p>
  </div>
</template>