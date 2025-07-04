import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Overview from '../views/Overview.vue'
import ClusterGroup from '../views/ClusterGroup.vue'
import LogicClusterGroupManagement from '../views/LogicClusterGroupManagement.vue'
import UserManagement from '../views/UserManagement.vue'
import CustomerManagement from '../views/CustomerManagement.vue'
import ProductPackage from '../views/ConfigManagement/ProductPackage.vue'
import Placeholder from '../views/Placeholder.vue'
import WafManagement from '../views/WafManagement.vue'
import SlbManagement from '../views/SlbManagement.vue'
import LoginLog from '../views/LogManagement/LoginLog.vue'
import OperationLog from '../views/LogManagement/OperationLog.vue'
import BusinessLog from '../views/BusinessLog.vue'
import RequestLog from '../views/BusinessLog/RequestLog.vue'
import AttackLog from '../views/BusinessLog/AttackLog.vue'
import OrderManagement from '../views/OrderManagement.vue'
import BusinessManagement from '../views/BusinessManagement.vue'
import BusinessProtection from '../views/BusinessProtection.vue'
import IpProtection from '../views/BusinessProtection/IpProtection.vue'
import DomainProtection from '../views/BusinessProtection/DomainProtection.vue'
import ResourceManagement from '../views/ResourceManagement/index.vue'

declare global {
  interface ImportMeta {
    env: {
      BASE_URL: string
    }
  }
}

const routes: Array<RouteRecordRaw> = [
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
    path: '/user-management',
    name: 'UserManagement',
    component: UserManagement
  },
  {
    path: '/user',
    name: 'User',
    component: UserManagement
  },
  {
    path: '/role-management',
    name: 'RoleManagement',
    component: () => import('../views/RoleManagement.vue')
  },
  {
    path: '/role',
    name: 'Role',
    component: () => import('../views/RoleManagement.vue')
  },
  {
    path: '/region-management',
    name: 'RegionManagement',
    component: () => import('../views/RegionManagement.vue')
  },
  {
    path: '/datacenter-management',
    name: 'DataCenterManagement',
    component: () => import('../views/DataCenterManagement.vue')
  },
  {
    path: '/ip-pool-management',
    name: 'IpPoolManagement',
    component: () => import('../views/IpPoolManagement.vue')
  },
  {
    path: '/cluster-group',
    name: 'ClusterGroup',
    component: ClusterGroup
  },
  {
    path: '/cluster-group-management',
    name: 'ClusterGroupManagement',
    component: LogicClusterGroupManagement
  },
  {
    path: '/waf-management',
    name: 'WafManagement',
    component: WafManagement
  },
  {
    path: '/slb-management',
    name: 'SlbManagement',
    component: SlbManagement
  },
  {
    path: '/operation-log',
    name: 'OperationLog',
    component: OperationLog
  },
      {
    path: '/login-log',
    name: 'LoginLog',
    component: LoginLog
  },
  {
    path: '/log',
    children: [
      {
        path: 'login',
        name: 'LogLogin',
        component: LoginLog
      },
      {
        path: 'operation',
        name: 'LogOperation',
        component: OperationLog
      }
    ]
  },
  {
    path: '/business',
    name: 'BusinessManagement',
    component: BusinessManagement,
    meta: { title: '业务管理' },
    redirect: '/business/instance',
    children: [
      {
        path: 'package',
        name: 'BusinessPackage',
        component: ProductPackage,
        meta: { title: '商品套餐' }
      },
      {
        path: 'customer',
        name: 'BusinessCustomer',
        component: CustomerManagement,
        meta: { title: '客户管理' }
      },
      {
        path: 'instance',
        name: 'BusinessInstance',
        component: () => import('../views/BusinessInstance.vue'),
        meta: { title: '业务实例' }
      },
      {
        path: 'order',
        name: 'BusinessOrder',
        component: OrderManagement,
        meta: { title: '订单管理' }
      },
      {
        path: 'protection',
        name: 'BusinessProtection',
        component: BusinessProtection,
        meta: { title: '防护对象' },
        redirect: '/business/protection/ip',
        children: [
          {
            path: 'ip',
            name: 'IpProtection',
            component: IpProtection,
            meta: { title: 'IP防护对象' }
          },
          {
            path: 'domain',
            name: 'DomainProtection',
            component: DomainProtection,
            meta: { title: '域名防护对象' }
          }
        ]
      }
    ]
  },
  {
    path: '/product-package',
    name: 'ProductPackage',
    component: ProductPackage
  },
  {
    path: '/customer-management',
    name: 'CustomerManagement',
    component: CustomerManagement
  },
  {
    path: '/customer',
    name: 'Customer',
    component: CustomerManagement
  },
  {
    path: '/placeholder',
    name: 'Placeholder',
        component: Placeholder
  },
  {
    path: '/ads',
    name: 'ADS',
    component: Placeholder
  },
  {
    path: '/waf',
    name: 'WAF',
    component: WafManagement
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
    path: '/dns',
    name: 'DNS',
    component: () => import('@/views/Placeholder.vue'),
    meta: { title: 'DNS' }
  },
  {
    path: '/order',
    name: 'Order',
    component: OrderManagement
  },
  {
    path: '/firewall',
    name: 'Firewall',
    component: Placeholder,
    meta: { title: '防火墙管理' }
  },
  {
    path: '/business-log',
    name: 'BusinessLog',
    component: BusinessLog,
    meta: { title: '业务日志' },
    children: [
      {
        path: 'request',
        name: 'RequestLog',
        component: RequestLog,
        meta: { title: '请求日志' }
      },
      {
        path: 'attack',
        name: 'AttackLog',
        component: AttackLog,
        meta: { title: '攻击日志' }
      },
      {
        path: 'ip-allocation',
        name: 'IpAllocationLog',
        component: () => import('../views/BusinessLog/IpAllocationLog.vue'),
        meta: { title: 'IP分配历史' }
      }
    ]
  },
  {
    path: '/global-config',
    name: 'GlobalConfig',
    component: Placeholder,
    meta: { title: '全局配置' }
  },
  {
    path: '/resource',
    name: 'ResourceManagement',
    component: ResourceManagement,
    meta: { title: '资源管理' },
    redirect: '/resource/region',
    children: [
      {
        path: 'region',
        name: 'ResourceRegion',
        component: () => import('../views/RegionManagement.vue'),
        meta: { title: '地域' }
      },
      {
        path: 'datacenter',
        name: 'ResourceDatacenter',
        component: () => import('../views/DataCenterManagement.vue'),
        meta: { title: '机房' }
      },
      {
        path: 'ippool',
        name: 'ResourceIpPool',
        component: () => import('../views/IpPoolManagement.vue'),
        meta: { title: '网池' }
      },
      {
        path: 'logiccluster',
        name: 'ResourceLogicCluster',
        component: ClusterGroup,
        meta: { title: '逻辑集群' }
      },
      {
        path: 'logicclustergroup',
        name: 'ResourceLogicClusterGroup',
        component: LogicClusterGroupManagement,
        meta: { title: '逻辑集群组' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router 