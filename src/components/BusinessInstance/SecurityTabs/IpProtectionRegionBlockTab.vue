<template>
  <div class="tab-content">
    <h3>区域封禁</h3>
    
    <!-- 已封禁地区统计 -->
    <div class="blocked-regions-stats">
      <div>已封禁地区：</div>
      <div>中国区 {{ blockedChinaCount }} 个地区</div>
      <div>国际区 {{ blockedInternationalCount }} 个地区</div>
    </div>
    
    <!-- 选择封禁地区 -->
    <div class="select-regions-section">
      <div>选择封禁地区：</div>
      
      <!-- 中国/国际切换Tab -->
      <el-tabs v-model="activeRegionTab" class="region-tabs">
        <el-tab-pane label="中国" name="china">
          <!-- 中国地区选择 -->
          <div class="region-selection">
            <div class="all-regions-checkbox">
              <el-checkbox v-model="selectAllChina" @change="handleSelectAllChina">全部中国地区</el-checkbox>
            </div>
            
            <!-- 中国省份列表 -->
            <div class="regions-grid">
              <el-checkbox 
                v-for="province in chinaProvinces" 
                :key="province.code"
                v-model="province.selected"
                @change="handleProvinceChange"
              >
                {{ province.name }}
              </el-checkbox>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="国际" name="international">
          <!-- 国际地区选择 -->
          <div class="region-selection">
            <div class="all-regions-checkbox">
              <el-checkbox v-model="selectAllInternational" @change="handleSelectAllInternational">全部国际地区</el-checkbox>
            </div>
            
            <!-- 大洲分组 -->
            <div class="continents-list">
              <div v-for="continent in continents" :key="continent.code" class="continent-section">
                <!-- 大洲标题与折叠控制 -->
                <div class="continent-header" @click="toggleContinent(continent.code)">
                  <el-icon :class="{ 'is-rotate': continent.expanded }">
                    <arrow-down />
                  </el-icon>
                  <span>{{ continent.name }}</span>
                </div>
                
                <!-- 大洲下的国家列表 -->
                <div v-show="continent.expanded" class="countries-grid">
                  <el-checkbox 
                    v-for="country in continent.countries" 
                    :key="country.code"
                    v-model="country.selected"
                    @change="() => handleCountryChange(continent)"
                  >
                    {{ country.name }}
                  </el-checkbox>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({
      chinaRegions: [],
      internationalRegions: []
    })
  }
})

const emit = defineEmits(['update:config'])

// 本地状态
const activeRegionTab = ref('china')
const selectAllChina = ref(false)
const selectAllInternational = ref(false)

// 中国省份数据
const chinaProvinces = reactive([
  { code: 'beijing', name: '北京', selected: false },
  { code: 'tianjin', name: '天津', selected: false },
  { code: 'hebei', name: '河北', selected: false },
  { code: 'shanxi', name: '山西', selected: false },
  { code: 'neimenggu', name: '内蒙古', selected: false },
  { code: 'liaoning', name: '辽宁', selected: false },
  { code: 'jilin', name: '吉林', selected: false },
  { code: 'heilongjiang', name: '黑龙江', selected: false },
  { code: 'shanghai', name: '上海', selected: false },
  { code: 'jiangsu', name: '江苏', selected: false },
  { code: 'zhejiang', name: '浙江', selected: false },
  { code: 'anhui', name: '安徽', selected: false },
  { code: 'fujian', name: '福建', selected: false },
  { code: 'jiangxi', name: '江西', selected: false },
  { code: 'shandong', name: '山东', selected: false },
  { code: 'henan', name: '河南', selected: false },
  { code: 'hubei', name: '湖北', selected: false },
  { code: 'hunan', name: '湖南', selected: false },
  { code: 'guangdong', name: '广东', selected: false },
  { code: 'guangxi', name: '广西', selected: false },
  { code: 'hainan', name: '海南', selected: false },
  { code: 'chongqing', name: '重庆', selected: false },
  { code: 'sichuan', name: '四川', selected: false },
  { code: 'guizhou', name: '贵州', selected: false },
  { code: 'yunnan', name: '云南', selected: false },
  { code: 'xizang', name: '西藏', selected: false },
  { code: 'shaanxi', name: '陕西', selected: false },
  { code: 'gansu', name: '甘肃', selected: false },
  { code: 'qinghai', name: '青海', selected: false },
  { code: 'ningxia', name: '宁夏', selected: false },
  { code: 'xinjiang', name: '新疆', selected: false },
  { code: 'xianggang', name: '香港', selected: false },
  { code: 'aomen', name: '澳门', selected: false },
  { code: 'taiwan', name: '台湾', selected: false },
])

// 国际大洲及国家数据
const continents = reactive([
  {
    code: 'asia-pacific',
    name: '亚太地区(国内除外)',
    expanded: true,
    countries: [
      { code: 'jp', name: '日本', selected: false },
      { code: 'kr', name: '韩国', selected: false },
      { code: 'sg', name: '新加坡', selected: false },
      { code: 'my', name: '马来西亚', selected: false },
      { code: 'th', name: '泰国', selected: false },
      { code: 'vn', name: '越南', selected: false },
      { code: 'id', name: '印度尼西亚', selected: false },
      { code: 'ph', name: '菲律宾', selected: false },
      { code: 'au', name: '澳大利亚', selected: false },
      { code: 'nz', name: '新西兰', selected: false },
      { code: 'in', name: '印度', selected: false },
    ]
  },
  {
    code: 'europe',
    name: '欧洲',
    expanded: false,
    countries: [
      { code: 'gb', name: '英国', selected: false },
      { code: 'fr', name: '法国', selected: false },
      { code: 'de', name: '德国', selected: false },
      { code: 'it', name: '意大利', selected: false },
      { code: 'es', name: '西班牙', selected: false },
      { code: 'nl', name: '荷兰', selected: false },
      { code: 'be', name: '比利时', selected: false },
      { code: 'se', name: '瑞典', selected: false },
      { code: 'ch', name: '瑞士', selected: false },
      { code: 'ru', name: '俄罗斯', selected: false },
    ]
  },
  {
    code: 'north-america',
    name: '北美洲',
    expanded: false,
    countries: [
      { code: 'us', name: '美国', selected: false },
      { code: 'ca', name: '加拿大', selected: false },
      { code: 'mx', name: '墨西哥', selected: false },
    ]
  },
  {
    code: 'south-america',
    name: '南美洲',
    expanded: false,
    countries: [
      { code: 'br', name: '巴西', selected: false },
      { code: 'ar', name: '阿根廷', selected: false },
      { code: 'cl', name: '智利', selected: false },
      { code: 'co', name: '哥伦比亚', selected: false },
      { code: 'pe', name: '秘鲁', selected: false },
    ]
  },
  {
    code: 'africa',
    name: '非洲',
    expanded: false,
    countries: [
      { code: 'za', name: '南非', selected: false },
      { code: 'eg', name: '埃及', selected: false },
      { code: 'ng', name: '尼日利亚', selected: false },
      { code: 'ke', name: '肯尼亚', selected: false },
      { code: 'ma', name: '摩洛哥', selected: false },
    ]
  },
  {
    code: 'middle-east',
    name: '中东',
    expanded: false,
    countries: [
      { code: 'ae', name: '阿联酋', selected: false },
      { code: 'sa', name: '沙特阿拉伯', selected: false },
      { code: 'il', name: '以色列', selected: false },
      { code: 'tr', name: '土耳其', selected: false },
      { code: 'qa', name: '卡塔尔', selected: false },
    ]
  }
])

// 计算属性
const blockedChinaCount = computed(() => 
  chinaProvinces.filter(p => p.selected).length
)

const blockedInternationalCount = computed(() => {
  let count = 0
  continents.forEach(continent => {
    count += continent.countries.filter(c => c.selected).length
  })
  return count
})

// 方法
const handleSelectAllChina = (val) => {
  chinaProvinces.forEach(province => {
    province.selected = val
  })
  updateConfig()
}

const handleSelectAllInternational = (val) => {
  continents.forEach(continent => {
    continent.countries.forEach(country => {
      country.selected = val
    })
  })
  updateConfig()
}

const handleProvinceChange = () => {
  const allSelected = chinaProvinces.every(p => p.selected)
  selectAllChina.value = allSelected
  updateConfig()
}

const handleCountryChange = (continent) => {
  // 检查当前大洲是否全选
  const allSelected = continent.countries.every(c => c.selected)
  const someSelected = continent.countries.some(c => c.selected)
  
  // 检查所有国际地区是否全选
  const allInternationalSelected = continents.every(c => 
    c.countries.every(country => country.selected)
  )
  
  selectAllInternational.value = allInternationalSelected
  
  updateConfig()
}

// 折叠/展开大洲
const toggleContinent = (code) => {
  const continent = continents.find(c => c.code === code)
  if (continent) {
    continent.expanded = !continent.expanded
  }
}

// 更新配置并向父组件发送事件
const updateConfig = () => {
  const selectedChina = chinaProvinces
    .filter(p => p.selected)
    .map(p => p.code)
  
  const selectedInternational = []
  continents.forEach(continent => {
    continent.countries.forEach(country => {
      if (country.selected) {
        selectedInternational.push(country.code)
      }
    })
  })
  
  emit('update:config', {
    chinaRegions: selectedChina,
    internationalRegions: selectedInternational
  })
}

// 初始化数据
const initFromProps = () => {
  if (props.config) {
    // 设置中国地区选中状态
    const chinaRegions = props.config.chinaRegions || []
    chinaProvinces.forEach(province => {
      province.selected = chinaRegions.includes(province.code)
    })
    
    // 设置国际地区选中状态
    const internationalRegions = props.config.internationalRegions || []
    continents.forEach(continent => {
      continent.countries.forEach(country => {
        country.selected = internationalRegions.includes(country.code)
      })
    })
    
    // 更新全选状态
    const allChinaSelected = chinaProvinces.every(p => p.selected)
    selectAllChina.value = allChinaSelected
    
    const allInternationalSelected = continents.every(c => 
      c.countries.every(country => country.selected)
    )
    selectAllInternational.value = allInternationalSelected
  }
}

// 监听props变化
watch(() => props.config, () => {
  initFromProps()
}, { deep: true })

// 初始化
initFromProps()
</script>

<style scoped>
.tab-content {
  padding: 0;
}

.blocked-regions-stats {
  margin: 15px 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.select-regions-section {
  margin-top: 20px;
}

.region-tabs {
  margin-top: 15px;
}

.all-regions-checkbox {
  margin: 15px 0;
}

.regions-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.continents-list {
  margin-top: 15px;
}

.continent-section {
  margin-bottom: 15px;
}

.continent-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.continent-header .is-rotate {
  transform: rotate(180deg);
  transition: transform 0.3s;
}

.continent-header .el-icon {
  margin-right: 8px;
  transition: transform 0.3s;
}

.countries-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-top: 10px;
  padding: 10px 0 10px 20px;
  border-left: 2px solid #ebeef5;
  margin-left: 10px;
}

@media (max-width: 1200px) {
  .regions-grid,
  .countries-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .regions-grid,
  .countries-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .regions-grid,
  .countries-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 