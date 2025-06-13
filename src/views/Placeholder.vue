<template>
  <div style="padding: 20px;">
    <h1>{{ title }}</h1>
    <p>这是一个占位页面。等待功能开发。</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const title = computed(() => {
  // 从路由元信息或路径中提取标题
  if (route.meta && route.meta.title) {
    return route.meta.title;
  } else {
    // 根据路径自动生成标题，例如 /ads -> ADS
    const pathParts = route.path.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
  }
});
</script>

<style scoped>
/* 可以在这里添加一些基本的样式 */
h1 {
  margin-bottom: 20px;
  color: #333;
}
p {
  color: #666;
}
</style> 