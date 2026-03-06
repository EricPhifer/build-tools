<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  heading?: string
  body?: string
}>(), {
  heading: 'About Us',
  body: 'We are a team of passionate developers and designers committed to creating exceptional digital experiences. With years of industry experience, we understand what it takes to build products that not only look beautiful but perform flawlessly.\n\nOur approach combines modern technology with proven design principles to deliver websites that engage visitors and drive results for our clients.'
})

function inlineMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>')
}

const renderedBody = computed(() => {
  if (!props.body) return ''
  const lines = props.body.split('\n')
  const parts: string[] = []
  let inList = false

  for (const line of lines) {
    const t = line.trim()

    if (t.startsWith('### ')) {
      if (inList) { parts.push('</ul>'); inList = false }
      parts.push(`<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-2">${inlineMarkdown(t.slice(4))}</h3>`)
    } else if (t.startsWith('## ')) {
      if (inList) { parts.push('</ul>'); inList = false }
      parts.push(`<h2 class="text-xl font-bold text-gray-900 mt-8 mb-3">${inlineMarkdown(t.slice(3))}</h2>`)
    } else if (t.startsWith('# ')) {
      if (inList) { parts.push('</ul>'); inList = false }
      parts.push(`<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">${inlineMarkdown(t.slice(2))}</h1>`)
    } else if (/^[-*]\s+/.test(t)) {
      if (!inList) { parts.push('<ul class="list-disc pl-5 my-3 space-y-1">'); inList = true }
      parts.push(`<li class="text-gray-600 leading-relaxed">${inlineMarkdown(t.replace(/^[-*]\s+/, ''))}</li>`)
    } else if (t === '') {
      if (inList) { parts.push('</ul>'); inList = false }
    } else {
      if (inList) { parts.push('</ul>'); inList = false }
      parts.push(`<p class="text-gray-600 leading-relaxed mb-4">${inlineMarkdown(t)}</p>`)
    }
  }

  if (inList) parts.push('</ul>')
  return parts.join('\n')
})
</script>

<template>
  <section class="py-12 px-6 bg-white">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ heading }}</h2>
      <div class="prose prose-gray max-w-none" v-html="renderedBody" />
    </div>
  </section>
</template>
