<script setup lang="ts">
import LoginButton from './LoginButton.vue'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md w-[90%]">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800">Phifer Web Solutions</h1>
        <p class="text-gray-500 text-sm">Build Tools</p>
      </div>
      <h2 class="text-xl font-semibold text-gray-700 mb-2">
        Welcome Back
      </h2>
      <p class="text-gray-500 mb-8">
        Sign in to access the build tools
      </p>
      <LoginButton />
      <p class="mt-6 text-xs text-gray-400">
        Internal use only. Authorized personnel only.
      </p>
    </div>
  </div>
</template>
