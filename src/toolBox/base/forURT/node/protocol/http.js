// import axios from 'axios'; // 移除 axios 依赖

/**
 * 创建 HTTP 协议
 * @param {Object} options
 * @returns {Object} HTTP 协议接口
 */
function createHTTPProtocol(options = {}) {
  /**
   * 处理消息
   * @param {Object} message
   * @param {Object} sender
   */
  async function handleMessage(message, sender) {
    // 实现 HTTP 消息处理逻辑
  }

  /**
   * 发送消息
   * @param {string} target
   * @param {Object} message
   */
  async function send(target, message) {
    // const response = await axios.post(target, message);
    // return response.data;
    try {
      const response = await fetch(target, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // 假设发送的是 JSON
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        // 尝试读取错误信息，如果可能的话
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch (e) { /* ignore */ }
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }

      // 假设响应也是 JSON
      return await response.json();
    } catch (error) {
      console.error(`Error sending message to ${target}:`, error);
      // 根据需要决定是继续抛出错误还是返回特定值
      throw error;
    }
  }

  return {
    handleMessage,
    send
  };
}

export { createHTTPProtocol };
