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
          <el-icon><PieChart /></el-icon>
            <span>总览</span>
        </el-menu-item>
        <el-sub-menu index="net-element" v-if="true">
          <template #title>
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="2" fill="#fff"/><rect x="7" y="8" width="10" height="8" rx="2" fill="currentColor" fill-opacity=".15"/></svg>
            </el-icon>
            <span>网元管理</span>
          </template>
          <el-menu-item index="/ads">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><path d="M12 3l8 4v5c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V7l8-4z" stroke="currentColor" stroke-width="2" fill="#fff"/><path d="M12 3l8 4v5c0 5.25-3.5 9.74-8 11V3z" fill="currentColor" fill-opacity=".15"/></svg>
            </el-icon>
            <span>ADS</span>
          </el-menu-item>
          <el-menu-item index="/slb">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor"/><circle cx="4" cy="4" r="2" fill="#fff" stroke="currentColor" stroke-width="1.5"/><circle cx="20" cy="4" r="2" fill="#fff" stroke="currentColor" stroke-width="1.5"/><circle cx="4" cy="20" r="2" fill="#fff" stroke="currentColor" stroke-width="1.5"/><circle cx="20" cy="20" r="2" fill="#fff" stroke="currentColor" stroke-width="1.5"/><path d="M12 12L4 4M12 12L20 4M12 12L4 20M12 12L20 20" stroke="currentColor" stroke-width="1.5"/></svg>
            </el-icon>
            <span>SLB</span>
          </el-menu-item>
          <el-menu-item index="/waf">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><path d="M12 3l8 4v5c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V7l8-4z" stroke="currentColor" stroke-width="2" fill="#fff"/><circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M8 13c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" stroke-width="1.2"/></svg>
            </el-icon>
            <span>WAF</span>
          </el-menu-item>
          <el-menu-item index="/waf-cc">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><path d="M12 3l8 4v5c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V7l8-4z" stroke="currentColor" stroke-width="2" fill="#fff"/><path d="M8 15c1.5-2 3.5-2 5 0s3.5 2 5 0" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
            </el-icon>
            <span>WAF-CC</span>
          </el-menu-item>
          <el-menu-item index="/blackhole">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity=".15"/><circle cx="12" cy="12" r="6" fill="#fff"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>
            </el-icon>
            <span>黑洞</span>
          </el-menu-item>
          <el-menu-item index="/firewall">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><path d="M12 3l8 4v5c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V7l8-4z" stroke="currentColor" stroke-width="2" fill="#fff"/><rect x="8" y="9" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 12h8M12 9v8" stroke="currentColor" stroke-width="1.5"/></svg>
            </el-icon>
            <span>防火墙</span>
          </el-menu-item>
          <el-menu-item index="/dns">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="#fff"/><path d="M2 12h20M12 2a10 10 0 0 1 0 20M4.93 4.93a10 10 0 0 1 14.14 14.14" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
            </el-icon>
            <span>DNS</span>
          </el-menu-item>
          <el-menu-item index="/traffic">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><polyline points="4,20 10,10 14,14 20,4" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="4" cy="20" r="2" fill="currentColor"/><circle cx="10" cy="10" r="2" fill="currentColor"/><circle cx="14" cy="14" r="2" fill="currentColor"/><circle cx="20" cy="4" r="2" fill="currentColor"/></svg>
            </el-icon>
            <span>流量分析</span>
        </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/cluster-group-management">
          <template #title>
            <el-icon>
              <!-- 资源组/多集群风格 -->
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><rect x="3" y="7" width="18" height="10" rx="3" stroke="currentColor" stroke-width="2" fill="#fff"/><rect x="7" y="11" width="10" height="2" rx="1" fill="currentColor" fill-opacity=".15"/></svg>
            </el-icon>
            <span>资源管理</span>
          </template>
          <el-menu-item index="/region-management">
            <el-icon><Location /></el-icon>
            <span>地域管理</span>
          </el-menu-item>
          <el-menu-item index="/datacenter-management">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="#fff"/><rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" fill-opacity=".15"/><path d="M7 10h10M7 14h10M12 6v12" stroke="currentColor" stroke-width="1.2"/></svg>
            </el-icon>
            <span>机房管理</span>
          </el-menu-item>
          <el-menu-item index="/ip-pool-management">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none">
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="#fff"/>
                <path d="M3 10h18M3 14h18" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="7" cy="12" r="1" fill="currentColor"/>
                <circle cx="12" cy="12" r="1" fill="currentColor"/>
                <circle cx="17" cy="12" r="1" fill="currentColor"/>
                <circle cx="7" cy="8" r="1" fill="currentColor"/>
                <circle cx="12" cy="8" r="1" fill="currentColor"/>
                <circle cx="17" cy="8" r="1" fill="currentColor"/>
                <circle cx="7" cy="16" r="1" fill="currentColor"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                <circle cx="17" cy="16" r="1" fill="currentColor"/>
              </svg>
            </el-icon>
            <span>网池管理</span>
          </el-menu-item>
          <el-menu-item index="/cluster-group">
            <el-icon>
              <!-- 集群风格，参考云数据库/集群 -->
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><ellipse cx="12" cy="7" rx="8" ry="3" stroke="currentColor" stroke-width="2" fill="#fff"/><ellipse cx="12" cy="12" rx="8" ry="3" stroke="currentColor" stroke-width="2" fill="#fff"/><ellipse cx="12" cy="17" rx="8" ry="3" stroke="currentColor" stroke-width="2" fill="#fff"/></svg>
            </el-icon>
            <span>逻辑集群</span>
          </el-menu-item>
          <el-menu-item index="/cluster-group-management">
            <el-icon>
              <!-- 组/多集群风格，参考云资源组 -->
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><rect x="3" y="7" width="18" height="10" rx="3" stroke="currentColor" stroke-width="2" fill="#fff"/><rect x="7" y="11" width="10" height="2" rx="1" fill="currentColor" fill-opacity=".15"/></svg>
            </el-icon>
            <span>逻辑集群组</span>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="business-management">
          <template #title>
            <el-icon>
              <!-- 商业/业务风格图标 -->
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><rect x="3" y="7" width="18" height="10" rx="3" stroke="currentColor" stroke-width="2" fill="#fff"/><path d="M7 7v10M17 7v10" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="10" width="6" height="4" rx="1" fill="currentColor" fill-opacity=".15"/></svg>
            </el-icon>
            <span>业务管理</span>
          </template>
          <el-menu-item index="/product-package">
            <el-icon><Box /></el-icon>
            <span>商品套餐</span>
          </el-menu-item>
          <el-menu-item index="/customer">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="#fff"/><path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" stroke="currentColor" stroke-width="2" fill="#fff"/></svg>
            </el-icon>
            <span>客户管理</span>
          </el-menu-item>
          <el-menu-item index="/business-instance">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" stroke-width="2" fill="#fff"/><rect x="8" y="10" width="8" height="4" rx="1" fill="currentColor" fill-opacity=".15"/></svg>
            </el-icon>
            <span>业务实例</span>
          </el-menu-item>
          <el-menu-item index="/order">
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" stroke-width="2" fill="#fff"/><path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="1.5"/></svg>
            </el-icon>
            <span>订单</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="business-log">
          <template #title>
            <el-icon>
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="#fff"/><path d="M8 8h8M8 12h8M8 16h6" stroke="currentColor" stroke-width="1.5"/></svg>
            </el-icon>
            <span>业务日志</span>
          </template>
          <el-menu-item index="/business-log/request">请求日志</el-menu-item>
          <el-menu-item index="/business-log/attack">攻击日志</el-menu-item>
          <el-menu-item index="/business-log/ip-allocation">IP分配历史</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="log-management">
          <template #title>
            <el-icon>
              <!-- 日志/文档风格，参考云日志服务 -->
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="2" fill="#fff"/><path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" stroke-width="1.5"/></svg>
            </el-icon>
            <span>日志管理</span>
          </template>
          <el-menu-item index="/log/login">登录日志</el-menu-item>
          <el-menu-item index="/log/operation">操作日志</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="system-management">
          <template #title>
            <el-icon>
              <!-- 齿轮风格，参考云系统管理 -->
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="#fff"/><path d="M12 7v2M12 15v2M7 12H5M19 12h-2M8.5 8.5l-1.5-1.5M15.5 15.5l1.5 1.5M8.5 15.5l-1.5 1.5M15.5 8.5l1.5-1.5" stroke="currentColor" stroke-width="1.5"/></svg>
            </el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/global-config">
            <el-icon>
              <!-- 地球/设置风格，参考云全局配置 -->
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="#fff"/><ellipse cx="12" cy="12" rx="7" ry="10" stroke="currentColor" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="1.5"/></svg>
            </el-icon>
            <span>全局配置</span>
          </el-menu-item>
          <el-menu-item index="/user">
            <el-icon>
              <!-- 用户风格，参考云账号/用户 -->
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="#fff"/><path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" stroke="currentColor" stroke-width="2" fill="#fff"/></svg>
            </el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/role">
            <el-icon>
              <!-- 盾牌风格，参考权限/角色管理 -->
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none"><path d="M12 2l7 4v5c0 5-3.5 9-7 11-3.5-2-7-6-7-11V6l7-4z" stroke="currentColor" stroke-width="2" fill="#fff"/><path d="M12 2l7 4v5c0 5-3.5 9-7 11V2z" fill="currentColor" fill-opacity=".15"/></svg>
            </el-icon>
            <span>角色管理</span>
        </el-menu-item>
        </el-sub-menu>
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
import { Bell, QuestionFilled, ArrowDown, PieChart, Location, Setting, Box } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// mock 激活菜单
const activeMenu = computed(() => route.path)

function handleMenuSelect(index) {
  router.push(index)
}
</script> 