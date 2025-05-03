/**
 * 复选框组件
 * 
 * 提供复选框和复选框组功能，使用JavaScript定义Vue组件
 * 
 * @module shared/components/form/checkbox
 */

/**
 * 复选框组件
 */
export const SacCheckbox = {
  name: 'SacCheckbox',
  props: {
    // 复选框值
    value: {
      type: [Boolean, String, Number],
      default: false
    },
    // 选中状态的值，用于group模式
    label: {
      type: [String, Number, Boolean],
      default: undefined
    },
    // 是否为方形复选框
    square: {
      type: Boolean,
      default: false
    },
    // 原生name属性
    name: {
      type: String,
      default: ''
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 复选框大小
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['small', 'default', 'large'].includes(value)
    },
    // 是否为中间状态
    indeterminate: {
      type: Boolean,
      default: false
    },
    // 是否显示边框
    border: {
      type: Boolean,
      default: false
    },
    // 选中颜色
    activeColor: {
      type: String,
      default: ''
    },
    // true对应的值，用于自定义值的复选框
    trueValue: {
      type: [String, Number, Boolean],
      default: true
    },
    // false对应的值，用于自定义值的复选框
    falseValue: {
      type: [String, Number, Boolean],
      default: false
    }
  },

  computed: {
    // 是否处于复选框组中
    isGroup() {
      let parent = this.$parent;
      while (parent) {
        if (parent.$options.name === 'SacCheckboxGroup') {
          return true;
        }
        parent = parent.$parent;
      }
      return false;
    },
    
    // 获取复选框组
    checkboxGroup() {
      let parent = this.$parent;
      while (parent) {
        if (parent.$options.name === 'SacCheckboxGroup') {
          return parent;
        }
        parent = parent.$parent;
      }
      return null;
    },
    
    // 实际的选中状态
    isChecked() {
      if (this.isGroup) {
        return this.checkboxGroup.value.includes(this.label);
      } else {
        return this.value === this.trueValue;
      }
    },
    
    // 禁用状态
    isDisabled() {
      if (this.isGroup) {
        return this.disabled || this.checkboxGroup.disabled;
      } else {
        return this.disabled;
      }
    },
    
    // 复选框尺寸
    checkboxSize() {
      if (this.isGroup) {
        return this.checkboxGroup.size || this.size;
      } else {
        return this.size;
      }
    },
    
    // 复选框类名
    checkboxClass() {
      return [
        'sac-checkbox',
        {
          'sac-checkbox--checked': this.isChecked,
          'sac-checkbox--disabled': this.isDisabled,
          'sac-checkbox--indeterminate': this.indeterminate,
          'sac-checkbox--border': this.border,
          'sac-checkbox--square': this.square,
          [`sac-checkbox--${this.checkboxSize}`]: this.checkboxSize !== 'default'
        }
      ];
    },
    
    // 复选框样式
    checkboxStyle() {
      const style = {};
      if (this.activeColor && (this.isChecked || this.indeterminate)) {
        style['--checkbox-active-color'] = this.activeColor;
      }
      return style;
    }
  },

  methods: {
    // 处理复选框变化
    handleChange(event) {
      if (this.isDisabled) return;
      
      const checked = event.target.checked;
      const value = checked ? this.trueValue : this.falseValue;
      
      if (this.isGroup) {
        this.checkboxGroup.handleChange(this.label, checked);
      } else {
        this.$emit('input', value);
        this.$emit('change', value);
      }
    },
    
    // 复选框点击事件
    handleClick() {
      if (!this.isDisabled) {
        this.$refs.checkbox.click();
      }
    }
  },

  // 使用渲染函数
  render(h) {
    // 准备复选框输入元素
    const input = h('input', {
      ref: 'checkbox',
      attrs: {
        type: 'checkbox',
        name: this.name,
        disabled: this.isDisabled,
        'true-value': this.trueValue,
        'false-value': this.falseValue
      },
      class: 'sac-checkbox__input',
      domProps: {
        checked: this.isChecked
      },
      on: {
        change: this.handleChange
      }
    });
    
    // 复选框标记
    const marker = h('span', {
      class: [
        'sac-checkbox__marker',
        {
          'sac-checkbox__marker--indeterminate': this.indeterminate
        }
      ]
    });
    
    // 复选框标签
    const label = this.$slots.default ? h('span', {
      class: 'sac-checkbox__label'
    }, this.$slots.default) : null;
    
    // 返回复选框组件
    return h('label', {
      class: this.checkboxClass,
      style: this.checkboxStyle,
      on: {
        click: this.handleClick
      }
    }, [
      h('span', { class: 'sac-checkbox__wrapper' }, [input, marker]),
      label
    ]);
  }
};

/**
 * 复选框组组件
 */
export const SacCheckboxGroup = {
  name: 'SacCheckboxGroup',
  props: {
    // 复选框组值
    value: {
      type: Array,
      default: () => []
    },
    // 最小选中数量
    min: {
      type: Number,
      default: 0
    },
    // 最大选中数量
    max: {
      type: Number,
      default: Infinity
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 复选框组大小
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['small', 'default', 'large'].includes(value)
    },
    // 是否为方形复选框
    square: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    // 复选框组类名
    groupClass() {
      return [
        'sac-checkbox-group',
        {
          'sac-checkbox-group--disabled': this.disabled
        }
      ];
    }
  },

  methods: {
    // 处理复选框变化
    handleChange(value, checked) {
      const valueList = [...this.value];
      
      if (checked) {
        // 检查是否已达到最大选择数量
        if (valueList.length >= this.max) {
          return;
        }
        
        // 添加值
        if (!valueList.includes(value)) {
          valueList.push(value);
        }
      } else {
        // 检查是否低于最小选择数量
        if (valueList.length <= this.min) {
          return;
        }
        
        // 移除值
        const index = valueList.indexOf(value);
        if (index !== -1) {
          valueList.splice(index, 1);
        }
      }
      
      this.$emit('input', valueList);
      this.$emit('change', valueList);
    },
    
    // 获取所有复选框
    getCheckboxes() {
      const checkboxes = [];
      const findCheckboxes = (children) => {
        if (!children) return;
        
        children.forEach(child => {
          if (child.$options && child.$options.name === 'SacCheckbox') {
            checkboxes.push(child);
          } else if (child.$children) {
            findCheckboxes(child.$children);
          }
        });
      };
      
      findCheckboxes(this.$children);
      return checkboxes;
    },
    
    // 全选
    checkAll() {
      const checkboxes = this.getCheckboxes();
      const values = checkboxes
        .filter(checkbox => !checkbox.isDisabled)
        .map(checkbox => checkbox.label);
      
      if (values.length <= this.max) {
        this.$emit('input', values);
        this.$emit('change', values);
      }
    },
    
    // 全不选
    uncheckAll() {
      if (this.min <= 0) {
        this.$emit('input', []);
        this.$emit('change', []);
      }
    },
    
    // 反选
    toggleAll() {
      const checkboxes = this.getCheckboxes();
      const values = checkboxes
        .filter(checkbox => !checkbox.isDisabled && !this.value.includes(checkbox.label))
        .map(checkbox => checkbox.label);
      
      if (values.length <= this.max) {
        this.$emit('input', values);
        this.$emit('change', values);
      }
    }
  },

  // 使用渲染函数
  render(h) {
    return h('div', {
      class: this.groupClass
    }, this.$slots.default);
  }
};

// 复选框相关的CSS样式
export const checkboxStyle = `
.sac-checkbox {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  position: relative;
  font-size: var(--b3-font-size);
  color: var(--b3-theme-on-surface);
  margin-right: 16px; /* 稍微调整间距 */
  cursor: pointer;
  -webkit-tap-highlight-color: transparent; /* 移动端点击效果 */
}

.sac-checkbox__wrapper {
  position: relative;
  cursor: pointer;
  display: inline-block;
  white-space: nowrap;
  user-select: none;
}

.sac-checkbox__input {
  position: absolute;
  opacity: 0;
  margin: 0;
  height: 0;
  width: 0;
  z-index: -1;
}

/* 复选框标记 (方框) */
.sac-checkbox__marker {
  position: relative;
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 1px solid var(--b3-border-color);
  border-radius: var(--b3-border-radius-s);
  background-color: var(--b3-theme-background); /* 背景 */
  transition: var(--b3-transition);
  box-sizing: border-box;
  vertical-align: middle;
  flex-shrink: 0; /* 防止被压缩 */
}

/* 方形复选框 */
.sac-checkbox--square .sac-checkbox__marker {
  border-radius: 0;
}

/* 标记内的勾号/横线 */
.sac-checkbox__marker::after {
  content: "";
  position: absolute;
  opacity: 0;
  transition: var(--b3-transition);
  box-sizing: content-box; /* 保持原计算方式 */
  border-style: solid;
  border-color: var(--b3-theme-on-primary); /* 勾/横线颜色 */
}

/* 勾号样式 (模拟 √) */
.sac-checkbox:not(.sac-checkbox--indeterminate) .sac-checkbox__marker::after {
  transform: rotate(45deg) scale(0);
  border-width: 0 2px 2px 0;
  width: 4px;
  height: 8px;
  left: 5px;
  top: 1px;
}

/* 半选横线样式 */
.sac-checkbox--indeterminate .sac-checkbox__marker::after {
  transform: scale(0);
  border: none;
  border-radius: 1px;
  width: 8px;
  height: 2px;
  left: 3px;
  top: 6px;
  background-color: var(--b3-theme-on-primary); /* 横线颜色 */
  opacity: 0;
}

/* 选中/半选状态下标记的样式 */
.sac-checkbox--checked .sac-checkbox__marker,
.sac-checkbox--indeterminate .sac-checkbox__marker {
  background-color: var(--checkbox-active-color, var(--b3-theme-primary));
  border-color: var(--checkbox-active-color, var(--b3-theme-primary));
}

/* 选中状态下勾号显示 */
.sac-checkbox--checked:not(.sac-checkbox--indeterminate) .sac-checkbox__marker::after {
  opacity: 1;
  transform: rotate(45deg) scale(1);
}

/* 半选状态下横线显示 */
.sac-checkbox--indeterminate .sac-checkbox__marker::after {
  opacity: 1;
  transform: scale(1);
}

/* 标签文本 */
.sac-checkbox__label {
  padding-left: 8px;
  line-height: 16px; /* 与标记高度对齐 */
  user-select: none;
  transition: var(--b3-transition);
}

/* 禁用状态 */
.sac-checkbox--disabled {
  cursor: not-allowed;
  color: var(--b3-theme-on-surface-light);
}

.sac-checkbox--disabled .sac-checkbox__marker {
  background-color: var(--b3-theme-surface-lighter);
  border-color: var(--b3-border-color);
}

/* 禁用且选中/半选状态下标记的样式 */
.sac-checkbox--disabled.sac-checkbox--checked .sac-checkbox__marker,
.sac-checkbox--disabled.sac-checkbox--indeterminate .sac-checkbox__marker {
  background-color: var(--b3-theme-surface-light); /* 使用更浅的背景 */
  border-color: var(--b3-border-color);
}

/* 禁用且选中/半选状态下勾号/横线的颜色 */
.sac-checkbox--disabled.sac-checkbox--checked .sac-checkbox__marker::after,
.sac-checkbox--disabled.sac-checkbox--indeterminate .sac-checkbox__marker::after {
  border-color: var(--b3-theme-on-surface-light); /* 勾号用边框色 */
  background-color: var(--b3-theme-on-surface-light); /* 横线用背景色 */
}


/* 带边框样式 */
.sac-checkbox--border {
  padding: 5px 10px; /* 调整内边距 */
  border: 1px solid var(--b3-border-color);
  border-radius: var(--b3-border-radius-s);
  transition: var(--b3-transition);
  margin-right: 10px;
}

.sac-checkbox--border:hover {
  border-color: var(--b3-theme-primary-light); /* 悬停时边框变色 */
}

.sac-checkbox--border.sac-checkbox--checked {
  border-color: var(--checkbox-active-color, var(--b3-theme-primary));
  background-color: var(--b3-theme-primary-lightest); /* 选中时加浅色背景 */
}

.sac-checkbox--border.sac-checkbox--disabled {
  border-color: var(--b3-border-color);
  background-color: var(--b3-theme-surface-lighter);
}

.sac-checkbox--border.sac-checkbox--disabled.sac-checkbox--checked {
    border-color: var(--b3-border-color);
    background-color: var(--b3-theme-surface-light); /* 禁用选中背景 */
}

/* 大小变体 */
.sac-checkbox--small {
  font-size: calc(var(--b3-font-size) * 0.9);
}
.sac-checkbox--small .sac-checkbox__marker {
  width: 14px;
  height: 14px;
}
.sac-checkbox--small:not(.sac-checkbox--indeterminate) .sac-checkbox__marker::after {
  width: 3px;
  height: 6px;
  left: 4px;
  top: 2px;
  border-width: 0 1.5px 1.5px 0;
}
.sac-checkbox--small.sac-checkbox--indeterminate .sac-checkbox__marker::after {
  width: 6px;
  height: 1.5px;
  left: 3px;
  top: 5.25px;
}
.sac-checkbox--small .sac-checkbox__label {
  padding-left: 6px;
  line-height: 14px;
}

.sac-checkbox--large {
  font-size: calc(var(--b3-font-size) * 1.1);
}
.sac-checkbox--large .sac-checkbox__marker {
  width: 18px;
  height: 18px;
}
.sac-checkbox--large:not(.sac-checkbox--indeterminate) .sac-checkbox__marker::after {
  width: 5px;
  height: 10px;
  left: 5px;
  top: 1px;
  border-width: 0 2.5px 2.5px 0;
}
.sac-checkbox--large.sac-checkbox--indeterminate .sac-checkbox__marker::after {
  width: 10px;
  height: 2.5px;
  left: 3px;
  top: 6.75px;
}
.sac-checkbox--large .sac-checkbox__label {
  padding-left: 10px;
  line-height: 18px;
}

/* 复选框组 */
.sac-checkbox-group {
  display: inline-block; /* 或 flex, grid 等，根据需要 */
  font-size: var(--b3-font-size);
}
`;

// 中文别名
export const 复选框 = SacCheckbox;
export const 复选框组 = SacCheckboxGroup; 