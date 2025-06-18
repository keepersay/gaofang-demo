import { createRouter, createWebHistory } from 'vue-router'
import Overview from '../views/Overview.vue'
import ClusterGroup from '../views/ClusterGroup.vue'
import ResourceManagement from '../views/ResourceManagement.vue'
import UserManagement from '../views/UserManagement.vue'
import CustomerManagement from '../views/CustomerManagement.vue'
import ProductPackage from '../views/ConfigManagement/ProductPackage.vue'
import Placeholder from '../views/Placeholder.vue'
import LoginLog from '../views/LogManagement/LoginLog.vue'
import OperationLog from '../views/LogManagement/OperationLog.vue'

const routes = [
  {
    path: '/',
    redirect: '/overview'
  },
  {
    path: '/overview',
    name: 'Overview',
    component: Overview
  },
  {
    path: '/cluster-group',
    name: 'LogicalResourceGroup',
    component: ClusterGroup
  },
  {
    path: '/resource-management',
    name: 'ResourceManagement',
    component: ResourceManagement,
    children: [
      {
        path: 'placeholder',
        name: 'ResourceManagementPlaceholder',
        component: Placeholder
      }
    ]
  },
  {
    path: '/ads',
    name: 'ADS',
    component: Placeholder
  },
  {
    path: '/slb',
    name: 'SLB',
    component: Placeholder
  },
  {
    path: '/waf',
    name: 'WAF',
    component: Placeholder
  },
  {
    path: '/waf-cc',
    name: 'WAFCC',
    component: Placeholder
  },
  {
    path: '/blackhole',
    name: 'Blackhole',
    component: Placeholder
  },
  {
    path: '/traffic',
    name: 'TrafficAnalysis',
    component: Placeholder
  },
  {
    path: '/config/product',
    name: 'ProductPackage',
    component: ProductPackage
  },
  {
    path: '/log/login',
    name: 'LoginLogs',
    component: LoginLog
  },
  {
    path: '/log/operation',
    name: 'OperationLogs',
    component: OperationLog
  },
  {
    path: '/customer',
    name: 'CustomerManagement',
    component: CustomerManagement
  },
  {
    path: '/user',
    name: 'UserManagement',
    component: UserManagement
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 