<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '../store'

const props = defineProps({
  hideTitle: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const boardStore = useBoardStore()

const posts = computed(() => boardStore.posts)

const deletingPostId = ref(null)
const deletePassword = ref('')
const editingPostId = ref(null)
const editPassword = ref('')

function goWrite() {
  router.push('/board/write')
}

function startEdit(id) {
  editingPostId.value = String(id)
  editPassword.value = ''
}

function cancelEdit() {
  editingPostId.value = null
  editPassword.value = ''
}

function confirmEdit() {
  const id = editingPostId.value
  const post = boardStore.posts.find(p => String(p.id) === String(id))

  if (!post) {
    alert('게시물을 찾을 수 없습니다.')
    cancelEdit()
    return
  }

  const password = editPassword.value.trim()
  if (!password) {
    alert('비밀번호를 입력하세요.')
    return
  }

  if (password !== post.password) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  cancelEdit()
  router.push({ name: 'PostEdit', params: { id } })
}

function startDelete(id) {
  deletingPostId.value = String(id)
  deletePassword.value = ''
}

function cancelDelete() {
  deletingPostId.value = null
  deletePassword.value = ''
}

function confirmDelete() {
  const id = deletingPostId.value
  const post = boardStore.posts.find(p => String(p.id) === String(id))

  if (!post) {
    alert('게시물을 찾을 수 없습니다.')
    cancelDelete()
    return
  }

  const password = deletePassword.value.trim()
  if (!password) {
    alert('비밀번호를 입력하세요.')
    return
  }

  if (password !== post.password) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  boardStore.deletePost(id)
  alert('삭제되었습니다.')
  cancelDelete()
}
</script>

<template>
  <div>
    <h2 v-if="!props.hideTitle">게시판 목록</h2>
    <button @click="goWrite" style="margin-bottom:12px;">글 작성</button>

    <ul v-if="posts.length">
      <li
        v-for="post in posts"
        :key="post.id"
        style="margin-bottom:12px; border-bottom:1px solid #ddd; padding-bottom:8px;"
      >
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
        <small>{{ new Date(post.createdAt).toLocaleString() }}</small>
        <div>
          <button @click="startEdit(post.id)">수정</button>
          <button @click="startDelete(post.id)" style="margin-left:6px;">삭제</button>
        </div>

        <div v-if="String(editingPostId) === String(post.id)" style="margin-top:10px; padding:8px; background:#f9f9f9;">
          <input
            v-model="editPassword"
            type="password"
            placeholder="수정 비밀번호를 입력하세요"
            style="margin-right:8px;"
          />
          <button @click="confirmEdit">확인</button>
          <button @click="cancelEdit" style="margin-left:6px;">취소</button>
        </div>

        <div v-if="String(deletingPostId) === String(post.id)" style="margin-top:10px; padding:8px; background:#f9f9f9;">
          <input
            v-model="deletePassword"
            type="password"
            placeholder="삭제 비밀번호를 입력하세요"
            style="margin-right:8px;"
          />
          <button @click="confirmDelete">확인</button>
          <button @click="cancelDelete" style="margin-left:6px;">취소</button>
        </div>
      </li>
    </ul>

    <p v-else>아직 작성된 글이 없습니다.</p>
  </div>
</template>