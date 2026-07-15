<template>
  <footer class="footer">
    <!-- 푸터 내용 -->
    <p>&copy; 2024 익명 게시판. All rights reserved.</p>
    
    <!-- 링크들 -->
    <div class="footer-links">
      <a href="#privacy">개인정보</a>
      <a href="#terms">이용약관</a>
      <a href="#contact">문의</a>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'  // 컴포넌트 이름
}
</script>

<style scoped>
/* 이 컴포넌트만 적용되는 CSS */
.footer {
  background-color: #34495e;  /* 배경색 (헤더보다 약간 밝음) */
  color: white;               /* 글자색 */
  padding: 20px;              /* 안쪽 여백 */
  text-align: center;         /* 가운데 정렬 */
  margin-top: 50px;           /* 위에 여백 */
  border-top: 3px solid #3498db;  /* 위에 선 */
}

.footer p {
  margin: 0;           /* 여백 없음 */
  font-size: 12px;     /* 작은 글씨 */
  color: #bdc3c7;      /* 회색 */
}

.footer-links {
  margin-top: 15px;    /* 위에 여백 */
}

.footer-links a {
  color: #3498db;      /* 파란색 */
  text-decoration: none;  /* 밑줄 제거 */
  margin: 0 10px;      /* 좌우 여백 */
  font-size: 12px;     /* 작은 글씨 */
}

.footer-links a:hover {
  text-decoration: underline;  /* 마우스 올리면 밑줄 */
  color: #2980b9;  /* 더 짙은 파란색 */
}
</style>