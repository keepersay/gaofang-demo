<template>
  <div class="business-management-page">
    <router-view v-if="$route.path !== '/business'" />
    <el-empty v-else description="请从左侧菜单选择业务管理模块" />
  </div>
</template>

<script setup>
// 父级路由组件，用于显示子路由
</script>

<style scoped>
.business-management-page {
  padding: 20px;
  background: #f5f6fa;
  min-height: calc(100vh - 120px);
}
</style> 