import { defineStore } from 'pinia'

export const useBoardStore = defineStore('board', {
  state: () => ({
    posts: JSON.parse(localStorage.getItem('posts') || '[]')
  }),

  actions: {
    addPost(post) {
      const newPost = {
        ...post,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }

      this.posts = [newPost, ...this.posts]
      localStorage.setItem('posts', JSON.stringify(this.posts))
    },

    deletePost(id) {
      this.posts = this.posts.filter(post => post.id !== id)
      localStorage.setItem('posts', JSON.stringify(this.posts))
    }
  }
})