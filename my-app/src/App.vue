<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>


<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <h1 class="title">홈페이지명 추천받아요</h1>
        <p class="subtitle">간단한 익명 게시판 예시 프로젝트</p>
      </div>

      <nav class="nav">
        <RouterLink :to="{ name: 'Home' }">홈</RouterLink>
        <RouterLink :to="{ name: 'Board' }">게시판</RouterLink>
        <RouterLink :to="{ name: 'PostCreate' }">글 작성</RouterLink>
        <RouterLink :to="{ name: 'Chatbot' }">챗봇</RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <footer class="footer">
      <p>© 2026 익명 게시판 프로젝트</p>
    </footer>
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
  gap: 16px;
  margin-bottom: 20px;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  margin: 0;
  font-size: 1.6rem;
}

.subtitle {
  margin: 0;
  color: #555;
  font-size: 0.95rem;
}

.nav {
  display: flex;
  gap: 12px;
}

.nav a {
  text-decoration: none;
  color: #2b6cb0;
  font-weight: 600;
}

.nav a:hover {
  text-decoration: underline;
}

.content {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #eee;
  min-height: 60vh;
}

.footer {
  margin-top: 20px;
  padding: 12px 0;
  text-align: center;
  color: #777;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .nav {
    flex-wrap: wrap;
  }

  .content {
    padding: 14px;
  }
}
</style>