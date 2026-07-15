<template>
  <div class="post-form">
    <h3>새 글 작성</h3>
    
    <!-- 제목 입력 -->
    <input 
      v-model="form.title"
      type="text" 
      placeholder="제목을 입력하세요"
      class="input-field"
    />
    
    <!-- 내용 입력 -->
    <textarea 
      v-model="form.content"
      placeholder="내용을 입력하세요"
      class="input-field"
      rows="5"
    ></textarea>
    
    <!-- 비밀번호 입력 -->
    <input 
      v-model="form.password"
      type="password" 
      placeholder="비밀번호 (수정/삭제할 때 필요)"
      class="input-field"
    />
    
    <!-- 작성 버튼 -->
    <button @click="submitPost" class="submit-btn">
      글 작성
    </button>
  </div>
</template>

<script>
import { usePostStore } from '../store'
import { ref } from 'vue'

export default {
  name: 'PostForm',
  setup() {
    const store = usePostStore()
    
    // 입력 데이터 저장
    const form = ref({
      title: '',
      content: '',
      password: ''
    })
    
    // 글 작성 함수
    const submitPost = () => {
      // 빈칸 확인
      if (!form.value.title || !form.value.content || !form.value.password) {
        alert('모든 항목을 입력해주세요!')
        return
      }
      
      // 새 게시물 객체 생성
      const newPost = {
        id: store.nextPostId,          // 자동 증가 id
        title: form.value.title,
        content: form.value.content,
        author: '익명',                // 항상 익명
        date: new Date().toLocaleDateString(),  // 오늘 날짜
        time: new Date().toLocaleTimeString(),  // 현재 시간
        password: form.value.password,
        views: 0,                      // 새 글은 조회수 0
        comments: []                   // 댓글 없음
      }
      
      // Store에 저장
      store.addPost(newPost)
      
      // 입력창 비우기
      form.value = {
        title: '',
        content: '',
        password: ''
      }
      
      alert('글이 작성되었습니다!')
    }
    
    return {
      form,
      submitPost
    }
  }
}
</script>

<style scoped>
.post-form {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.post-form h3 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.input-field {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: Arial, sans-serif;
}

.input-field:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

.submit-btn {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #2980b9;
}
</style>