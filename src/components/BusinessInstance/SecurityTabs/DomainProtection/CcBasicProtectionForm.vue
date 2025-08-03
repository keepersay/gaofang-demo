<template>
  <div class="cc-basic-protection-form">
    <div class="form-header">
      <span class="form-title">基础CC防护</span>
      <el-switch v-model="localValue.enabled" active-text="启用" inactive-text="禁用" />
    </div>
    <el-form :model="localValue" label-width="100px" :disabled="!localValue.enabled">
      <el-form-item label="统计对象">
        <el-checkbox-group v-model="localValue.statObjects">
          <el-checkbox label="IP">IP</el-checkbox>
          <el-checkbox label="Cookie">Cookie</el-checkbox>
        </el-checkbox-group>
        <div class="form-tip">可多选，按IP或Cookie统计访问频率</div>
      </el-form-item>
      <el-form-item label="防御方式">
        <el-radio-group v-model="localValue.defenseMode">
          <el-radio label="JavaScript">JavaScript</el-radio>
        </el-radio-group>
        <div class="form-tip">当前仅支持JavaScript防御</div>
      </el-form-item>
      <el-form-item label="处理动作">
        <el-radio-group v-model="localValue.action">
          <el-radio label="block">请求阻断</el-radio>
          <el-radio label="limit">请求限频</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="访问频率">
        <el-input-number v-model="localValue.frequency" :min="100" :max="100000" />
        <span class="input-suffix">次</span>
        <div class="form-tip">最小值：100，最大值：100000</div>
      </el-form-item>
      <el-form-item label="检测周期">
        <el-input-number v-model="localValue.period" :min="1" :max="3600" />
        <span class="input-suffix">秒</span>
        <div class="form-tip">1-3600以内的整数</div>
      </el-form-item>
      <el-form-item label="封禁时间">
        <el-input-number v-model="localValue.banTime" :min="1" :max="86400" />
        <span class="input-suffix">秒</span>
        <div class="form-tip">1-86400以内的整数，且必须大于检测周期</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, watch, toRefs } from 'vue'
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['update:modelValue'])
const localValue = reactive({ ...props.modelValue })
watch(() => props.modelValue, (val) => {
  Object.assign(localValue, val)
})
watch(localValue, (val) => {
  emit('update:modelValue', { ...val })
}, { deep: true })
</script>

<style scoped>
.cc-basic-protection-form {
  background: #fff;
  padding: 16px 24px 8px 24px;
  border-radius: 6px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.form-title {
  font-size: 16px;
  font-weight: bold;
}
.input-suffix {
  margin-left: 8px;
  color: #606266;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style> 