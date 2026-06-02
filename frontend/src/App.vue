<template>
  <div class="min-h-screen bg-surface-900">
    <!-- Navbar -->
    <nav class="border-b border-surface-700 px-8 py-4 flex items-center gap-8">
      <span class="text-accent-cyan font-bold text-lg tracking-wide">Train of the Future</span>
      <RouterLink to="/" class="text-gray-400 hover:text-white transition-colors text-sm">Dashboard</RouterLink>
      <RouterLink to="/analytics" class="text-gray-400 hover:text-white transition-colors text-sm">Analytics</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>
