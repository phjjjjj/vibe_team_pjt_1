<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>


<template>
  <div class="app-shell">
    <header class="topbar">
      <h1 class="title">익명 게시판</h1>
      <nav class="nav">
        <RouterLink to="/board">게시판</RouterLink>
        <RouterLink to="/board/write">글 작성</RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>


<style scoped>
.app-shell {
  max-width: 900px;
  margin: 32px auto;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans KR', 'Helvetica Neue', Arial;
  padding: 0 16px;
}
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title { margin: 0; font-size: 1.4rem; }
.nav { display: flex; gap: 12px; }
.nav a { text-decoration: none; color: #2b6cb0; }
.content { background: #fff; padding: 12px; border-radius: 6px; box-shadow: 0 0 0 1px #eee; }
</style>