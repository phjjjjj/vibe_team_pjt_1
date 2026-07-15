<template>
  <header class="header">
    <!-- 헤더 타이틀 -->
    <h1>익명 게시판</h1>
    
    <!-- 헤더 설명 -->
    <p class="subtitle">자유롭게 의견을 나눠보세요!</p>
  </header>
</template>

<script>
// Vue 컴포넌트 자바스크립트 부분
export default {
  name: 'Header'  // 컴포넌트 이름
}
</script>

<style scoped>
/* 이 컴포넌트만 적용되는 CSS */
.header {
  background-color: #2c3e50;  /* 배경색 */
  color: white;               /* 글자색 */
  padding: 20px;              /* 안쪽 여백 */
  text-align: center;         /* 가운데 정렬 */
  border-bottom: 3px solid #3498db;  /* 아래 선 */
}

.header h1 {
  margin: 0;           /* 바깥쪽 여백 제거 */
  font-size: 28px;     /* 글자 크기 */
  font-weight: bold;   /* 굵은 글씨 */
}

.header .subtitle {
  margin: 10px 0 0 0;  /* 위에만 여백 */
  font-size: 14px;     /* 작은 글씨 */
  color: #ecf0f1;      /* 밝은 회색 */
}
</style>