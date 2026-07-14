<template>
  <Header />
  
  <main class="container">
    <!-- 글 작성 폼 추가 -->
    <PostForm />
    
    <h2>게시판</h2>
    
    <!-- 게시물 목록 표시 -->
    <div v-for="post in posts" :key="post.id" class="post-item">
      <h3>{{ post.title }}</h3>
      <p>{{ post.content }}</p>
      <small>작성자: {{ post.author }} | 조회: {{ post.views }}</small>
    </div>
  </main>
  
  <Footer />
</template>

<script>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import PostForm from './components/PostForm.vue'  // ← 추가
import { usePostStore } from './store'

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    PostForm  // ← 추가
  },
  computed: {
    posts() {
      return usePostStore().posts
    }
  },
  mounted() {
    usePostStore().loadPosts()
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #ecf0f1;
}

.container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
}

.post-item {
  background-color: white;
  padding: 15px;
  margin: 15px 0;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.post-item h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.post-item p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
}

.post-item small {
  color: #999;
}
</style>