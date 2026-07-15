<template>
  <div class="post-create-page">
    <!-- 기존 폼 내용 -->
    ...
    <!-- 임시로 캘린더 삽입 -->
    <hr />
    <h3>캘린더 (테스트)</h3>
    <Calendar />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '../store'
import Calendar from '../components/Calendar.vue'
</script>

<style scoped>
h2 { margin-bottom:12px; }
</style> 

<hr />
<h3>캘린더 (테스트)</h3>
<Calendar />