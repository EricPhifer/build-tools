<script setup lang="ts">
withDefaults(defineProps<{
  heading?: string
  subheading?: string
  services?: Array<{ title: string; description: string; icon: string }>
}>(), {
  heading: 'Our Services',
  subheading: 'Everything you need to grow your business, delivered with expertise and care.',
  services: () => [
    { title: 'Consulting', description: 'Expert guidance tailored to your goals. We assess your needs and develop a clear roadmap.', icon: '💼' },
    { title: 'Strategy & Planning', description: 'Data-driven strategies that align your team and accelerate results from day one.', icon: '🎯' },
    { title: 'Implementation', description: 'Hands-on execution of your projects with proven processes and experienced professionals.', icon: '⚙️' },
    { title: 'Training & Support', description: 'Ongoing coaching and support to ensure your team succeeds long after launch.', icon: '🤝' },
    { title: 'Analytics & Reporting', description: 'Clear insights into performance with dashboards that turn data into decisions.', icon: '📊' },
    { title: 'Ongoing Maintenance', description: 'Peace of mind with proactive monitoring, updates, and expert support on demand.', icon: '🛡️' },
  ]
})
</script>

<template>
  <section class="py-16 px-6 bg-gray-50 @container">
    <div class="max-w-5xl mx-auto">
      <!-- Heading -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ heading }}</h2>
        <p class="text-gray-500 text-base max-w-2xl mx-auto">{{ subheading }}</p>
      </div>

      <!-- Services grid -->
      <div class="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-6">
        <div
          v-for="service in services"
          :key="service.title"
          class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="text-3xl mb-4">{{ service.icon }}</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ service.title }}</h3>
          <p class="text-gray-500 text-sm leading-relaxed">{{ service.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
