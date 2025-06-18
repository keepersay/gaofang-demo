<div class="bg-white rounded-lg shadow-md p-4">
  <div class="flex items-center mb-8">
    <el-input
      v-model="inputValue"
      placeholder="按逻辑集群组名称或ID搜索..."
      clearable
      style="width: 300px;"
      @keyup.enter="onSearch"
    >
      <template #append>
        <el-button @click="onSearch">
          <el-icon><Search /></el-icon>
        </el-button>
      </template>
    </el-input>
    <el-button type="primary" @click="$emit('create')" class="ml-4">新建逻辑集群组</el-button>
  </div>

  <el-card class="table-card mt-8">
    // ... existing code ...
  </el-card>
</div> 