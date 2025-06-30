// DNS线路服务
const DnsLineService = {
  // 获取中国内地DNS线路（二级线路）
  getChinaLines() {
    return [
      { code: 'cn_region_dongbei', name: '中国地区_东北', level: 2, parentCode: 'internal', region: 'china' },
      { code: 'cn_region_huabei', name: '中国地区_华北', level: 2, parentCode: 'internal', region: 'china' },
      { code: 'cn_region_huadong', name: '中国地区_华东', level: 2, parentCode: 'internal', region: 'china' },
      { code: 'cn_region_huanan', name: '中国地区_华南', level: 2, parentCode: 'internal', region: 'china' },
      { code: 'cn_region_huazhong', name: '中国地区_华中', level: 2, parentCode: 'internal', region: 'china' },
      { code: 'cn_region_xibei', name: '中国地区_西北', level: 2, parentCode: 'internal', region: 'china' },
      { code: 'cn_region_xinan', name: '中国地区_西南', level: 2, parentCode: 'internal', region: 'china' }
    ];
  },

  // 获取中国境外DNS线路（三级线路）
  getOverseasLines() {
    return [
      // 亚洲
      { code: 'os_asia_jp', name: '亚洲_日本', level: 3, parentCode: 'os_asia', region: 'overseas' },
      { code: 'os_asia_kr', name: '亚洲_韩国', level: 3, parentCode: 'os_asia', region: 'overseas' },
      { code: 'os_asia_sg', name: '亚洲_新加坡', level: 3, parentCode: 'os_asia', region: 'overseas' },
      { code: 'os_asia_my', name: '亚洲_马来西亚', level: 3, parentCode: 'os_asia', region: 'overseas' },
      { code: 'os_asia_th', name: '亚洲_泰国', level: 3, parentCode: 'os_asia', region: 'overseas' },
      { code: 'os_asia_vn', name: '亚洲_越南', level: 3, parentCode: 'os_asia', region: 'overseas' },
      { code: 'os_asia_id', name: '亚洲_印度尼西亚', level: 3, parentCode: 'os_asia', region: 'overseas' },
      { code: 'os_asia_in', name: '亚洲_印度', level: 3, parentCode: 'os_asia', region: 'overseas' },
      
      // 欧洲
      { code: 'os_europe_de', name: '欧洲_德国', level: 3, parentCode: 'os_europe', region: 'overseas' },
      { code: 'os_europe_gb', name: '欧洲_英国', level: 3, parentCode: 'os_europe', region: 'overseas' },
      { code: 'os_europe_fr', name: '欧洲_法国', level: 3, parentCode: 'os_europe', region: 'overseas' },
      { code: 'os_europe_ru', name: '欧洲_俄罗斯', level: 3, parentCode: 'os_europe', region: 'overseas' },
      { code: 'os_europe_nl', name: '欧洲_荷兰', level: 3, parentCode: 'os_europe', region: 'overseas' },
      
      // 北美洲
      { code: 'os_namerica_us', name: '北美洲_美国', level: 3, parentCode: 'os_namerica', region: 'overseas' },
      { code: 'os_namerica_ca', name: '北美洲_加拿大', level: 3, parentCode: 'os_namerica', region: 'overseas' },
      { code: 'os_namerica_mx', name: '北美洲_墨西哥', level: 3, parentCode: 'os_namerica', region: 'overseas' },
      
      // 大洋洲
      { code: 'os_oceania_au', name: '大洋洲_澳大利亚', level: 3, parentCode: 'os_oceania', region: 'overseas' },
      { code: 'os_oceania_nz', name: '大洋洲_新西兰', level: 3, parentCode: 'os_oceania', region: 'overseas' },
      
      // 南美洲
      { code: 'os_samerica_br', name: '南美洲_巴西', level: 3, parentCode: 'os_samerica', region: 'overseas' },
      { code: 'os_samerica_ar', name: '南美洲_阿根廷', level: 3, parentCode: 'os_samerica', region: 'overseas' },
      
      // 非洲
      { code: 'os_africa_za', name: '非洲_南非', level: 3, parentCode: 'os_africa', region: 'overseas' },
      { code: 'os_africa_eg', name: '非洲_埃及', level: 3, parentCode: 'os_africa', region: 'overseas' }
    ];
  },
  
  // 获取所有DNS线路
  getAllLines() {
    return [...this.getChinaLines(), ...this.getOverseasLines()];
  },
  
  // 根据线路CODE获取线路名称
  getLineName(code) {
    const allLines = this.getAllLines();
    const line = allLines.find(line => line.code === code);
    return line ? line.name : code;
  },
  
  // 存储机房DNS线路绑定数据的本地缓存
  _dataCenterDnsLinesMap: {
    'DC202401010001': ['cn_region_huadong', 'cn_region_huanan'],
    'DC202401010002': ['cn_region_huazhong', 'cn_region_huabei'],
    'DC202401010003': ['cn_region_huanan', 'cn_region_xinan'],
    'DC202401010004': ['cn_region_huabei', 'cn_region_dongbei']
  },
  
  // 根据机房ID获取绑定的DNS线路
  async getDataCenterDnsLines(dataCenterId) {
    // 从本地缓存获取数据
    const dnsLineCodes = this._dataCenterDnsLinesMap[dataCenterId] || [];
    
    // 转换为对象数组返回
    return Promise.resolve(
      dnsLineCodes.map(dnsLineCode => ({ dataCenterId, dnsLineCode }))
    );
  },
  
  // 保存机房DNS线路绑定
  async saveDataCenterDnsLines(dataCenterId, dnsLineCodes) {
    console.log('保存机房DNS线路绑定:', dataCenterId, dnsLineCodes);
    
    // 保存到本地缓存
    this._dataCenterDnsLinesMap[dataCenterId] = [...dnsLineCodes];
    
    return Promise.resolve({ success: true });
  }
};

export default DnsLineService; 