/**
 * 计算两个数的和
 * 
 * 简单的加法函数，接受两个数字并返回它们的和
 * 
 * @nodeCategory 数学/基础
 * @nodeType function
 * @nodeName 加法计算器
 * @nodeIcon fas fa-calculator
 * @example add(2, 3) // 返回 5
 * 
 * @param {number} a - 第一个数
 * @param {number} b - 第二个数
 * @returns {number} 两数之和
 */
export const add = ({ a, b }) => {
  return a + b;
};

/**
 * 计算两个数的差
 * 
 * 简单的减法函数，从第一个数中减去第二个数
 * 
 * @nodeCategory 数学/基础
 * @nodeType function
 * @nodeName 减法计算器
 * @nodeIcon fas fa-minus
 * @example subtract(5, 2) // 返回 3
 * 
 * @param {number} a - 被减数
 * @param {number} b - 减数
 * @returns {number} 两数之差
 */
export const subtract = ({ a, b }) => {
  return a - b;
};

/**
 * 计算一个数的平方
 * 
 * 返回输入数字的平方值
 * 
 * @nodeCategory 数学/高级
 * @nodeType function
 * @nodeName 平方计算
 * @nodeIcon fas fa-superscript
 * @example square(3) // 返回 9
 * 
 * @param {number} num - 要计算平方的数
 * @returns {number} 平方结果
 */
export const square = ({ num }) => {
  return num * num;
};

/**
 * 计算圆的面积
 * 
 * 根据圆的半径计算其面积
 * 
 * @nodeCategory 数学/几何
 * @nodeType function
 * @nodeName 圆面积计算
 * @nodeIcon fas fa-circle
 * @example circleArea(5) // 返回 约78.54
 * 
 * @param {number} radius - 圆的半径
 * @returns {number} 圆的面积
 */
export const circleArea = ({ radius }) => {
  return Math.PI * radius * radius;
}; 