/**
 * 雪花ID生成器
 * 提供统一的ID生成方法，使用LCG前缀 + 雪花算法风格
 */
class IdGenerator {
  /**
   * 生成雪花算法ID
   * @param {string} prefix 前缀，默认为LCG
   * @returns {string} 生成的ID
   */
  static generateId(prefix = 'LCG') {
    const timestamp = Date.now() % 1e12; // 获取当前时间戳，避免过长
    const machineId = Math.floor(Math.random() * 1024); // 模拟机器ID（0-1023）
    const sequence = Math.floor(Math.random() * 4096); // 模拟序列号（0-4095）
    
    return `${prefix}${timestamp}${machineId.toString().padStart(3, '0')}${sequence.toString().padStart(4, '0')}`;
  }
  
  /**
   * 生成特定模块的ID
   * @param {string} moduleCode 模块代码
   * @returns {string} 生成的ID
   */
  static generateModuleId(moduleCode) {
    return this.generateId(`${moduleCode}`);
  }
  
  /**
   * 生成客户ID
   * @returns {string} 生成的客户ID
   */
  static generateCustomerId() {
    return this.generateId('LCG');
  }
  
  /**
   * 生成集群组ID
   * @returns {string} 生成的集群组ID
   */
  static generateClusterGroupId() {
    return this.generateId('LCG');
  }
  
  /**
   * 生成用户ID
   * @returns {string} 生成的用户ID
   */
  static generateUserId() {
    return this.generateId('LCG');
  }
  
  /**
   * 生成日志ID
   * @returns {string} 生成的日志ID
   */
  static generateLogId() {
    return this.generateId('LCG');
  }
}

export default IdGenerator; 