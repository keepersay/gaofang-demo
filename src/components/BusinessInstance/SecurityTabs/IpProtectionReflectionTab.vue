<template>
  <div class="reflection-protection-container">
    <div class="description-text">
      仅针对UDP协议流量生效，一键过滤常见UDP反射攻击，配置详情请通过【设置】进行查看和调整。通过【设置】自定义添加或删除其他反射端口。
    </div>

    <!-- 一键过滤策略 -->
    <div class="section-title">一键过滤策略</div>
    <el-table :data="reflectionAttacks" style="width: 100%">
      <el-table-column width="50">
        <template #default="scope">
          <el-checkbox v-model="scope.row.enabled" @change="handleAttackTypeChange" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="攻击类型" />
      <el-table-column prop="protocol" label="协议" width="120" />
      <el-table-column prop="port" label="反射源端口" width="120" />
    </el-table>

    <!-- 自定义过滤策略 -->
    <div class="section-title">自定义过滤策略</div>
    <el-table :data="customRules" style="width: 100%">
      <el-table-column width="50">
        <template #default="scope">
          <el-checkbox v-model="scope.row.enabled" @change="handleCustomRuleChange" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="攻击类型" />
      <el-table-column prop="protocol" label="协议" width="120" />
      <el-table-column label="反射源端口列表" width="300">
        <template #default="scope">
          <el-input 
            v-model="scope.row.ports" 
            type="textarea"
            :rows="2"
            placeholder="请输入端口，用英文逗号分隔" 
            :disabled="!scope.row.enabled"
            @change="handlePortsChange" 
          />
        </template>
      </el-table-column>
    </el-table>
    <div class="custom-rule-tip">
      自定义策略不支持端口与"一键过滤"相同的反射源端口，最多支持20个端口，请用英文逗号（,）分隔
    </div>
  </div>
</template>

<script>
export default {
  name: 'IpProtectionReflectionTab',
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        enabled: false,
        reflectionAttacks: [],
        customRules: []
      })
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      reflectionAttacks: [
        { name: 'CharGEN反射攻击', protocol: 'UDP', port: '19', enabled: false },
        { name: 'TFTP反射攻击', protocol: 'UDP', port: '69', enabled: false },
        { name: 'Portmap反射攻击', protocol: 'UDP', port: '111', enabled: false },
        { name: 'NTP反射攻击', protocol: 'UDP', port: '123', enabled: false },
        { name: 'NetBIOS反射攻击', protocol: 'UDP', port: '137', enabled: false },
        { name: 'SNMPv2反射攻击', protocol: 'UDP', port: '161', enabled: false },
        { name: 'CLDAP反射攻击', protocol: 'UDP', port: '389', enabled: false },
        { name: 'OpenVPN反射攻击', protocol: 'UDP', port: '1194', enabled: false },
        { name: 'SSDP反射攻击', protocol: 'UDP', port: '1900', enabled: false },
        { name: 'RDP反射攻击', protocol: 'UDP', port: '3389', enabled: false },
        { name: 'WSDiscovery反射攻击', protocol: 'UDP', port: '3702', enabled: false },
        { name: 'Memcached反射攻击', protocol: 'UDP', port: '11211', enabled: false }
      ],
      customRules: [
        { name: '其他UDP反射攻击', protocol: 'UDP', ports: '', enabled: false }
      ]
    }
  },
  watch: {
    modelValue: {
      handler(newVal) {
        if (newVal && newVal.reflectionAttacks) {
          this.reflectionAttacks.forEach((attack, index) => {
            const savedAttack = newVal.reflectionAttacks.find(a => a.port === attack.port);
            if (savedAttack) {
              this.reflectionAttacks[index].enabled = savedAttack.enabled;
            }
          });
        }
        
        if (newVal && newVal.customRules && newVal.customRules.length > 0) {
          this.customRules[0].enabled = newVal.customRules[0].enabled;
          this.customRules[0].ports = newVal.customRules[0].ports;
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleAttackTypeChange() {
      this.emitUpdate();
    },
    handleCustomRuleChange() {
      this.emitUpdate();
    },
    handlePortsChange() {
      // 验证端口格式
      const portsStr = this.customRules[0].ports;
      if (portsStr) {
        const ports = portsStr.split(',');
        if (ports.length > 20) {
          this.$message.warning('最多支持20个端口');
          this.customRules[0].ports = ports.slice(0, 20).join(',');
        }
        
        // 验证是否与预设端口冲突
        const presetPorts = this.reflectionAttacks.map(attack => attack.port);
        const conflictPorts = ports.filter(port => presetPorts.includes(port));
        if (conflictPorts.length > 0) {
          this.$message.warning(`以下端口与一键过滤策略冲突: ${conflictPorts.join(', ')}`);
        }
      }
      
      this.emitUpdate();
    },
    emitUpdate() {
      const enabledAttacks = this.reflectionAttacks
        .filter(attack => attack.enabled)
        .map(({ name, protocol, port, enabled }) => ({ name, protocol, port, enabled }));
      
      const enabledCustomRules = this.customRules
        .filter(rule => rule.enabled && rule.ports)
        .map(({ name, protocol, ports, enabled }) => ({ name, protocol, ports, enabled }));
      
      this.$emit('update:modelValue', {
        enabled: enabledAttacks.length > 0 || enabledCustomRules.length > 0,
        reflectionAttacks: enabledAttacks,
        customRules: enabledCustomRules
      });
    }
  }
}
</script>

<style scoped>
.reflection-protection-container {
  padding: 16px;
}

.description-text {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.section-title {
  font-weight: bold;
  margin: 20px 0 10px 0;
  font-size: 14px;
}

.custom-rule-tip {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
}
</style> 