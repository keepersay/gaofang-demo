// IP区间格式校验和重叠判断工具
// 不再使用ip-cidr库，因为它在浏览器环境中可能有问题
// import IPCIDR from 'ip-cidr';

/**
 * 校验IP区间格式
 * @param {string} range - 区间字符串
 * @param {'IPV4'|'IPV6'} protocol - 协议族
 * @returns {boolean}
 */
function isValidRange(range, protocol) {
  // 添加空值检查
  if (!range || range.trim() === '') {
    return false;
  }
  
  // 去除首尾空格
  range = range.trim();
  
  console.log('Validating range:', range, 'protocol:', protocol);
  
  if (protocol === 'IPV4') {
    if (range.includes('/')) {
      try { 
        return isValidCidr(range);
      } catch (err) { 
        console.error('CIDR validation error:', err);
        return false; 
      }
    }
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(s => s.trim());
      const startValid = isValidIPv4(start);
      const endValid = isValidIPv4(end);
      console.log('Range validation result:', startValid && endValid, 'start:', startValid, 'end:', endValid);
      return startValid && endValid;
    }
    const result = isValidIPv4(range);
    console.log('Single IP validation result:', result);
    return result;
  } else {
    if (range.includes('/')) {
      try { 
        return isValidCidrV6(range);
      } catch (err) { 
        console.error('IPv6 CIDR validation error:', err);
        return false; 
      }
    }
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(s => s.trim());
      const startValid = isValidIPv6(start);
      const endValid = isValidIPv6(end);
      console.log('IPv6 Range validation result:', startValid && endValid);
      return startValid && endValid;
    }
    const result = isValidIPv6(range);
    console.log('Single IPv6 validation result:', result);
    return result;
  }
}

/**
 * 判断两个区间是否有重叠（仅支持IPv4，支持单IP、区间、CIDR任意组合）
 * @param {string} range1
 * @param {string} range2
 * @param {'IPV4'|'IPV6'} protocol
 * @returns {boolean}
 */
function isRangeOverlap(range1, range2, protocol) {
  if (protocol !== 'IPV4') return false; // 仅实现IPv4
  
  try {
    const toInt = ip => ip.split('.').reduce((acc, v) => (acc << 8) + Number(v), 0);
    
    // 解析区间为起止int
    function parseRange(r) {
      if (!r || r.trim() === '') {
        throw new Error('Empty range');
      }
      
      r = r.trim();
      
      if (r.includes('/')) {
        // 解析CIDR为IP范围
        const [ip, prefix] = r.split('/');
        if (!isValidIPv4(ip) || !isValidPrefix(prefix)) {
          throw new Error('Invalid CIDR');
        }
        
        const prefixNum = parseInt(prefix, 10);
        const ipInt = toInt(ip);
        const mask = ~((1 << (32 - prefixNum)) - 1);
        const startIp = ipInt & mask;
        const endIp = startIp | ~mask;
        
        return [startIp, endIp];
      }
      
      if (r.includes('-')) {
        const [start, end] = r.split('-').map(s => s.trim());
        if (!isValidIPv4(start) || !isValidIPv4(end)) {
          throw new Error('Invalid IP range');
        }
        return [toInt(start), toInt(end)];
      }
      
      // 单IP
      if (!isValidIPv4(r)) {
        throw new Error('Invalid IP');
      }
      const ipInt = toInt(r);
      return [ipInt, ipInt];
    }
    
    const [s1, e1] = parseRange(range1);
    const [s2, e2] = parseRange(range2);
    
    console.log('Overlap check:', range1, range2, [s1, e1], [s2, e2]);
    
    return Math.max(s1, s2) <= Math.min(e1, e2);
  } catch (err) {
    console.error('Error in isRangeOverlap:', err);
    return false; // 出错时假设不重叠
  }
}

// 验证IPv4地址
function isValidIPv4(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

// 验证IPv6地址
function isValidIPv6(ip) {
  // 简化的IPv6验证，实际应用中可能需要更复杂的验证
  return /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$/.test(ip);
}

// 验证CIDR前缀
function isValidPrefix(prefix) {
  const num = parseInt(prefix, 10);
  return !isNaN(num) && num >= 0 && num <= 32;
}

// 验证IPv6 CIDR前缀
function isValidPrefixV6(prefix) {
  const num = parseInt(prefix, 10);
  return !isNaN(num) && num >= 0 && num <= 128;
}

// 验证CIDR格式 (IPv4)
function isValidCidr(cidr) {
  if (!cidr.includes('/')) return false;
  
  const [ip, prefix] = cidr.split('/');
  const isValidIp = isValidIPv4(ip);
  const isValidPre = isValidPrefix(prefix);
  
  console.log('CIDR validation result:', isValidIp && isValidPre, 'IP:', isValidIp, 'Prefix:', isValidPre);
  
  return isValidIp && isValidPre;
}

// 验证CIDR格式 (IPv6)
function isValidCidrV6(cidr) {
  if (!cidr.includes('/')) return false;
  
  const [ip, prefix] = cidr.split('/');
  const isValidIp = isValidIPv6(ip);
  const isValidPre = isValidPrefixV6(prefix);
  
  console.log('IPv6 CIDR validation result:', isValidIp && isValidPre);
  
  return isValidIp && isValidPre;
}

export { isValidRange, isRangeOverlap }; 