<template>
  <div class="business-log-page">
    <router-view v-if="$route.path !== '/business-log'" />
    <el-empty v-else description="请从左侧菜单选择日志类型" />
  </div>
</template>

<script setup>
// 父级路由组件，用于显示子路由
</script>

<style scoped>
.business-log-page {
  padding: 20px;
  background: #f5f6fa;
  min-height: calc(100vh - 120px);
}
</style> 