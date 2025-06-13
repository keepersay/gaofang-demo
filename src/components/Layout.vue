<template>
  <el-container style="height: 100vh;">
    <!-- 侧边导航 -->
    <el-aside width="220px" style="background: #f5f7fa;display:flex;flex-direction:column;">
      <!-- 顶部logo和系统标题区 -->
      <div style="height:64px;display:flex;align-items:center;justify-content:center;background:#fff;border-bottom:1px solid #eee;">
        <img src="/logo.svg" alt="logo" style="height:32px;width:32px;margin-right:10px;" />
        <span style="font-weight:bold;font-size:18px;letter-spacing:2px;color:#222;">网元管理平台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        background-color="#f5f7fa"
        text-color="#333"
        active-text-color="#409EFF"
        @select="handleMenuSelect"
        :router="true"
        style="flex:1;"
      >
        <el-menu-item index="/overview">
          <template #title>
            <span>总览</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/cluster-group">
          <template #title>
            <span>逻辑资源组</span>
          </template>
        </el-menu-item>
        <el-sub-menu index="resource-management">
          <template #title>
            <span>资源管理</span>
          </template>
          <el-menu-item index="/resource-management/placeholder">占位子模块</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="element-cluster-management">
          <template #title>
            <span>网元与集群管理</span>
          </template>
          <el-menu-item index="/ads">ADS</el-menu-item>
          <el-menu-item index="/slb">SLB</el-menu-item>
          <el-menu-item index="/waf">WAF</el-menu-item>
          <el-menu-item index="/waf-cc">WAF-CC</el-menu-item>
          <el-menu-item index="/blackhole">黑洞</el-menu-item>
          <el-menu-item index="/traffic">流量分析</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="log-management">
          <template #title>
            <span>日志管理</span>
          </template>
          <el-menu-item index="/log/login">登录日志</el-menu-item>
          <el-menu-item index="/log/operation">操作日志</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/user">
          <template #title>
            <span>用户管理</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主体内容 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header style="background: #fff; display: flex; justify-content: flex-end; align-items: center; height: 60px;">
        <el-icon style="margin-right: 20px;"><Bell /></el-icon>
        <el-icon style="margin-right: 20px;"><QuestionFilled /></el-icon>
        <el-dropdown>
          <span class="el-dropdown-link" style="cursor: pointer;">
            keepersay <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人信息</el-dropdown-item>
              <el-dropdown-item>角色管理</el-dropdown-item>
              <el-dropdown-item divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <!-- 主内容区 -->
      <el-main style="background: #f0f2f5;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, QuestionFilled, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// mock 激活菜单
const activeMenu = computed(() => route.path)

function handleMenuSelect(index) {
  router.push(index)
}
</script> 