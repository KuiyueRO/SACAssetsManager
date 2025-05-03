/**
 * 数字输入控件
 * 
 * 创建一个用于数字输入的Vue组件，包含增加和减少按钮。
 * 使用JavaScript定义Vue组件，可以与Vue框架集成。
 * 
 * @module shared/components/controls/numberInput
 */

/**
 * 数字输入控件Vue组件
 */
export const SacNumberInput = {
  name: 'SacNumberInput',
  props: {
    // v-model绑定值
    value: {
      type: Number,
      required: true
    },
    // 最小值
    min: {
      type: Number,
      default: 0
    },
    // 最大值
    max: {
      type: Number,
      default: Infinity
    },
    // 步长
    step: {
      type: Number,
      default: 1
    },
    // 单位
    unit: {
      type: String,
      default: ''
    },
    // 精度（小数位数）
    precision: {
      type: Number,
      default: 0
    },
    // 禁用状态
    disabled: {
      type: Boolean,
      default: false
    },
    // 控件大小
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
  },
  
  computed: {
    // 计算显示值
    displayValue() {
      return `${this.value.toFixed(this.precision)}${this.unit}`;
    },
    
    // 控件类名
    inputClasses() {
      return [
        'sac-number-input',
        `sac-number-input--${this.size}`,
        {
          'sac-number-input--disabled': this.disabled
        }
      ];
    }
  },
  
  methods: {
    // 增加值
    increase() {
      if (this.disabled) return;
      
      const newValue = Math.min(this.value + this.step, this.max);
      if (newValue !== this.value) {
        this.$emit('input', newValue);
        this.$emit('change', newValue, this.value);
      }
    },
    
    // 减少值
    decrease() {
      if (this.disabled) return;
      
      const newValue = Math.max(this.value - this.step, this.min);
      if (newValue !== this.value) {
        this.$emit('input', newValue);
        this.$emit('change', newValue, this.value);
      }
    },
    
    // 处理键盘输入
    handleKeydown(event) {
      if (this.disabled) return;
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.increase();
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.decrease();
          break;
      }
    }
  },
  
  // 使用渲染函数
  render(h) {
    return h('div', {
      class: this.inputClasses,
      on: {
        keydown: this.handleKeydown
      }
    }, [
      // 减少按钮
      h('button', {
        class: 'sac-number-input__decrease',
        attrs: {
          type: 'button',
          disabled: this.disabled || this.value <= this.min
        },
        on: {
          click: this.decrease
        }
      }, '-'),
      
      // 值显示区域
      h('span', {
        class: 'sac-number-input__value',
        attrs: {
          tabindex: this.disabled ? -1 : 0
        }
      }, this.displayValue),
      
      // 增加按钮
      h('button', {
        class: 'sac-number-input__increase',
        attrs: {
          type: 'button',
          disabled: this.disabled || this.value >= this.max
        },
        on: {
          click: this.increase
        }
      }, '+')
    ]);
  }
};

/**
 * 可编辑数字输入控件Vue组件
 * 扩展了SacNumberInput，允许直接编辑数值
 */
export const SacEditableNumberInput = {
  name: 'SacEditableNumberInput',
  mixins: [{
    props: SacNumberInput.props,
    computed: SacNumberInput.computed,
    methods: SacNumberInput.methods
  }],
  
  data() {
    return {
      // 是否处于编辑状态
      isEditing: false,
      // 临时编辑值
      editValue: ''
    };
  },
  
  methods: {
    // 开始编辑
    startEdit() {
      if (this.disabled) return;
      
      this.isEditing = true;
      this.editValue = this.value.toFixed(this.precision);
      this.$nextTick(() => {
        const input = this.$el.querySelector('.sac-number-input__input');
        if (input) {
          input.focus();
          input.select();
        }
      });
    },
    
    // 结束编辑
    finishEdit() {
      this.isEditing = false;
      
      // 尝试解析输入值
      let newValue = parseFloat(this.editValue);
      
      // 验证输入
      if (isNaN(newValue)) {
        newValue = this.value;
      } else {
        // 确保在允许范围内
        newValue = Math.min(Math.max(newValue, this.min), this.max);
      }
      
      if (newValue !== this.value) {
        this.$emit('input', newValue);
        this.$emit('change', newValue, this.value);
      }
    },
    
    // 处理输入变化
    handleInput(event) {
      this.editValue = event.target.value;
    },
    
    // 处理键盘事件
    handleInputKeydown(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.finishEdit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.isEditing = false;
      }
    }
  },
  
  // 使用渲染函数
  render(h) {
    return h('div', {
      class: this.inputClasses
    }, [
      // 减少按钮
      h('button', {
        class: 'sac-number-input__decrease',
        attrs: {
          type: 'button',
          disabled: this.disabled || this.value <= this.min
        },
        on: {
          click: this.decrease
        }
      }, '-'),
      
      // 值显示区域/输入框
      this.isEditing
        ? h('input', {
            class: 'sac-number-input__input',
            attrs: {
              type: 'text',
              value: this.editValue
            },
            on: {
              input: this.handleInput,
              blur: this.finishEdit,
              keydown: this.handleInputKeydown
            }
          })
        : h('span', {
            class: 'sac-number-input__value',
            attrs: {
              tabindex: this.disabled ? -1 : 0
            },
            on: {
              click: this.startEdit
            }
          }, this.displayValue),
      
      // 增加按钮
      h('button', {
        class: 'sac-number-input__increase',
        attrs: {
          type: 'button',
          disabled: this.disabled || this.value >= this.max
        },
        on: {
          click: this.increase
        }
      }, '+')
    ]);
  }
};

// 数字输入控件的CSS样式，可以通过Vue插件安装时注入
export const numberInputStyle = `
.sac-number-input {
  display: inline-flex; /* Use flex to layout buttons and value */
  align-items: center;
  border: 0;
  border-radius: var(--b3-border-radius, 4px);
  box-shadow: inset 0 0 0 .6px var(--b3-theme-on-surface, #ccc);
  padding: 0; /* Padding handled by internal elements */
  line-height: 20px; /* Match .b3-text-field */
  height: 28px; /* Match .b3-text-field */
  box-sizing: border-box;
  color: var(--b3-theme-on-background, #333);
  transition: box-shadow var(--b3-transition, 120ms 0ms cubic-bezier(0, 0, .2, 1));
  background-color: var(--b3-theme-background, #fff);
  vertical-align: middle; /* Align with other inline elements */
}

.sac-number-input:hover {
  box-shadow: inset 0 0 0 .6px var(--b3-theme-on-background, #666);
}

/* Use focus-within as focus might be on internal button or input */
.sac-number-input:focus-within {
  box-shadow: inset 0 0 0 1px var(--b3-theme-primary, #4285f4), 0 0 0 3px var(--b3-theme-primary-lightest, rgba(66,133,244,0.08));
}

.sac-number-input--disabled {
  opacity: .38;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: inset 0 0 0 .6px var(--b3-theme-on-surface, #ccc); /* Keep base shadow on disabled */
}

/* Button Styles */
.sac-number-input__decrease,
.sac-number-input__increase {
  border: 0;
  background-color: transparent;
  color: var(--b3-theme-on-surface, #666);
  cursor: pointer;
  padding: 0;
  margin: 0;
  height: 100%; /* Fill container height */
  width: 24px; /* Fixed width for buttons */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color var(--b3-transition, .15s ease-in-out);
  font-size: 16px; /* Make +/- bigger */
  line-height: 1;
}

.sac-number-input__decrease {
  border-top-left-radius: var(--b3-border-radius, 4px);
  border-bottom-left-radius: var(--b3-border-radius, 4px);
  /* TODO: Replace '-' with SVG icon (e.g., chevron-down or minus) */
}

.sac-number-input__increase {
  border-top-right-radius: var(--b3-border-radius, 4px);
  border-bottom-right-radius: var(--b3-border-radius, 4px);
  /* TODO: Replace '+' with SVG icon (e.g., chevron-up or plus) */
}

.sac-number-input__decrease:hover,
.sac-number-input__increase:hover {
  background-color: var(--b3-list-icon-hover, rgba(0,0,0,0.08));
  color: var(--b3-theme-on-background, #333);
}

.sac-number-input__decrease:active,
.sac-number-input__increase:active {
  background-color: var(--b3-list-hover, rgba(0,0,0,0.1)); /* Slightly darker active */
}

.sac-number-input__decrease:disabled,
.sac-number-input__increase:disabled {
  opacity: .38;
  cursor: not-allowed;
  background-color: transparent !important; /* Ensure no background on disabled */
}

/* Value Display Styles */
.sac-number-input__value {
  flex-grow: 1; /* Take remaining space */
  text-align: center;
  padding: 0 4px;
  font-size: var(--b3-font-size-base, 14px);
  min-width: 30px; /* Ensure some minimum width */
  cursor: default; /* Default cursor for non-editable */
  user-select: none;
}

/* Input Styles for Editable version */
.sac-number-input__input {
  flex-grow: 1;
  border: 0;
  background: transparent;
  padding: 0 4px;
  text-align: center;
  font-size: var(--b3-font-size-base, 14px);
  color: inherit;
  width: 100%; /* Take full width within flex item */
  min-width: 30px;
  height: 100%; /* Match container height */
  line-height: inherit; /* Inherit line-height */
}
.sac-number-input__input:focus {
  outline: none;
}

/* Sizes */
.sac-number-input--small {
  height: 24px; /* Smaller height */
  line-height: 16px;
}
.sac-number-input--small .sac-number-input__value,
.sac-number-input--small .sac-number-input__input {
  font-size: 12px;
}
.sac-number-input--small .sac-number-input__decrease,
.sac-number-input--small .sac-number-input__increase {
  width: 20px; /* Smaller buttons */
  font-size: 14px;
}

.sac-number-input--large {
  height: 32px; /* Larger height */
  line-height: 24px;
}
.sac-number-input--large .sac-number-input__value,
.sac-number-input--large .sac-number-input__input {
  font-size: 16px;
}
.sac-number-input--large .sac-number-input__decrease,
.sac-number-input--large .sac-number-input__increase {
  width: 28px; /* Larger buttons */
  font-size: 18px;
}
`;

// 中文别名
export const 数字输入 = SacNumberInput;
export const 可编辑数字输入 = SacEditableNumberInput; 