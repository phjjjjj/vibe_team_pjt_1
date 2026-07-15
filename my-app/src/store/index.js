// src/store/index.js
import { defineStore } from 'pinia'

/*
  설명:
  - 이 store는 게시물 목록(posts)을 관리합니다.
  - 게시물은 localStorage의 "posts" 키에 JSON 문자열로 저장됩니다.
  - loadPosts()로 로컬에서 불러오고, savePosts()로 저장합니다.
*/

function loadPostsFromStorage() {
  // 브라우저 환경인지 확인
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem('posts')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('posts load error', e)
    return []
  }
}

function savePostsToStorage(posts) {
  try {
    localStorage.setItem('posts', JSON.stringify(posts))
  } catch (e) {
    console.error('posts save error', e)
  }
}

export const useBoardStore = defineStore('board', {
  state: () => ({
    // 초기값: localStorage에서 불러오거나 빈 배열
    posts: loadPostsFromStorage(),

    // 다음 id를 간단히 관리하기 위한 값 (숫자형)
    // 기존 posts가 있으면 가장 큰 id + 1로 설정
    nextId: (() => {
      const arr = loadPostsFromStorage()
      if (!arr.length) return 1
      // 저장된 id가 문자열일 수 있으니 숫자로 변환 후 최대값 + 1
      const max = arr.reduce((m, p) => {
        const n = Number(p.id) || 0
        return n > m ? n : m
      }, 0)
      return max + 1
    })()
  }),

  actions: {
    // 저장 헬퍼
    savePosts() {
      savePostsToStorage(this.posts)
    },

    // 모든 게시물 다시 불러오기 (초기화용)
    loadPosts() {
      this.posts = loadPostsFromStorage()
      // nextId 재계산
      if (this.posts.length) {
        const max = this.posts.reduce((m, p) => {
          const n = Number(p.id) || 0
          return n > m ? n : m
        }, 0)
        this.nextId = max + 1
      } else {
        this.nextId = 1
      }
    },

    // 게시물 추가: 인자로 { title, content, author, password } 받음
    addPost(payload) {
      const newPost = {
        id: String(this.nextId),           // id는 문자열로 저장
        title: payload.title || '',
        content: payload.content || '',
        author: payload.author || '익명',
        password: payload.password || '',
        createdAt: new Date().toISOString(),
        views: 0,
        comments: []
      }
      // 최신 글을 앞에 추가
      this.posts = [newPost, ...this.posts]
      this.nextId += 1
      this.savePosts()
      return newPost
    },

    // 게시물 삭제 (id, 비밀번호 확인 여부는 호출자에게 맡김)
    deletePost(id) {
      this.posts = this.posts.filter(p => p.id !== String(id))
      this.savePosts()
    },

    // 게시물 수정 - updated 객체는 id 포함
    updatePost(updated) {
      const idx = this.posts.findIndex(p => p.id === String(updated.id))
      if (idx === -1) return false
      // 기존 객체를 보존하면서 업데이트할 필드만 덮어쓰기
      this.posts[idx] = { ...this.posts[idx], ...updated, id: String(updated.id) }
      this.savePosts()
      return true
    },

    // 특정 게시물 조회
    getPostById(id) {
      return this.posts.find(p => p.id === String(id)) || null
    },

    // 조회수 증가 (한 번 호출하면 +1)
    incrementViews(id) {
      const post = this.posts.find(p => p.id === String(id))
      if (!post) return false
      post.views = (Number(post.views) || 0) + 1
      this.savePosts()
      return true
    }
  }
})