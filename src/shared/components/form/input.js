/**
 * 基础输入框组件
 * 
 * 提供文本输入控件，使用JavaScript定义Vue组件。
 * 
 * @module shared/components/form/input
 */

/**
 * 输入框组件
 */
export const SacInput = {
  name: 'SacInput',
  props: {
    // 输入框类型
    type: {
      type: String,
      default: 'text',
      validator: (value) => [
        'text', 'textarea', 'password', 
        'number', 'email', 'url', 'tel', 'search'
      ].includes(value)
    },
    // 绑定值
    value: {
      type: [String, Number],
      default: ''
    },
    // 占位文本
    placeholder: {
      type: String,
      default: ''
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否只读
    readonly: {
      type: Boolean,
      default: false
    },
    // 是否显示清除按钮
    clearable: {
      type: Boolean,
      default: false
    },
    // 输入框大小
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['small', 'default', 'large'].includes(value)
    },
    // 最大输入长度
    maxlength: {
      type: Number,
      default: undefined
    },
    // 最小输入长度
    minlength: {
      type: Number,
      default: undefined
    },
    // 是否显示字数统计
    showWordLimit: {
      type: Boolean,
      default: false
    },
    // 是否自动获取焦点
    autofocus: {
      type: Boolean,
      default: false
    },
    // 前缀图标
    prefixIcon: {
      type: String,
      default: ''
    },
    // 后缀图标
    suffixIcon: {
      type: String,
      default: ''
    },
    // textarea 高度
    rows: {
      type: Number,
      default: 2
    },
    // 是否自动调整高度 (仅 textarea)
    autosize: {
      type: [Boolean, Object],
      default: false
    },
    // 自动完成
    autocomplete: {
      type: String,
      default: 'off'
    },
    // 输入格式验证（正则）
    pattern: {
      type: [RegExp, String],
      default: undefined
    },
    // 自定义验证函数
    validator: {
      type: Function,
      default: undefined
    },
    // 错误提示消息
    errorMessage: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      // 内部输入值
      innerValue: this.value,
      // 是否获取焦点
      focused: false,
      // 是否显示密码
      passwordVisible: false,
      // 验证状态
      validateState: '',
      // 自动调整高度的行数
      textareaCalcStyle: {},
      // 是否悬浮状态（用于处理清除按钮显示逻辑）
      hovering: false
    };
  },
  
  computed: {
    // 是否显示清除按钮
    showClear() {
      return this.clearable && !this.disabled && !this.readonly && 
        this.innerValue !== '' && (this.focused || this.hovering);
    },
    
    // 是否是文本域
    isTextarea() {
      return this.type === 'textarea';
    },
    
    // 是否是密码输入框
    isPassword() {
      return this.type === 'password';
    },
    
    // 是否显示字数限制
    shouldShowLimit() {
      return this.showWordLimit && 
        this.maxlength && 
        (this.type === 'text' || this.type === 'textarea');
    },
    
    // 输入框类
    inputClass() {
      return [
        'sac-input',
        this.size !== 'default' ? `sac-input--${this.size}` : '',
        {
          'sac-input--disabled': this.disabled,
          'sac-input--readonly': this.readonly,
          'sac-input--focus': this.focused,
          'sac-input--error': this.validateState === 'error',
          'sac-input--success': this.validateState === 'success'
        }
      ];
    },
    
    // 实际输入框类型
    inputType() {
      // 如果是密码类型且密码可见，则显示为文本
      if (this.isPassword && this.passwordVisible) {
        return 'text';
      }
      return this.type;
    },
    
    // 输入框限制相关计算
    textLength() {
      return this.innerValue ? String(this.innerValue).length : 0;
    }
  },
  
  watch: {
    // 监听外部值变化
    value(val) {
      this.innerValue = val;
    },
    
    // 监听内部值变化
    innerValue(val) {
      // 更新到外部值
      this.$emit('input', val);
      this.$emit('change', val);
      
      // 输入时触发验证
      this.validate();
    }
  },
  
  methods: {
    // 获取焦点
    focus() {
      if (this.$refs.input) {
        this.$refs.input.focus();
      }
    },
    
    // 失去焦点
    blur() {
      if (this.$refs.input) {
        this.$refs.input.blur();
      }
    },
    
    // 清空输入
    clear() {
      this.innerValue = '';
      this.$emit('clear');
      this.focus();
    },
    
    // 处理输入事件
    handleInput(event) {
      this.innerValue = event.target.value;
      this.$emit('input', this.innerValue);
    },
    
    // 处理改变事件
    handleChange(event) {
      this.$emit('change', event.target.value);
    },
    
    // 处理焦点事件
    handleFocus(event) {
      this.focused = true;
      this.$emit('focus', event);
    },
    
    // 处理失去焦点事件
    handleBlur(event) {
      this.focused = false;
      this.$emit('blur', event);
      
      // 在失去焦点时触发验证
      this.validate();
    },
    
    // 处理键盘按下事件
    handleKeydown(event) {
      this.$emit('keydown', event);
    },
    
    // 处理键盘释放事件
    handleKeyup(event) {
      this.$emit('keyup', event);
    },
    
    // 处理鼠标进入事件
    handleMouseEnter() {
      this.hovering = true;
    },
    
    // 处理鼠标离开事件
    handleMouseLeave() {
      this.hovering = false;
    },
    
    // 切换密码可见性
    togglePasswordVisible() {
      this.passwordVisible = !this.passwordVisible;
      // 切换后聚焦
      this.$nextTick(() => {
        this.focus();
      });
    },
    
    // 验证输入
    validate() {
      // 默认验证通过
      this.validateState = '';
      
      // 如果有自定义验证函数
      if (this.validator) {
        try {
          const result = this.validator(this.innerValue);
          if (result === false) {
            this.validateState = 'error';
            return false;
          }
        } catch (error) {
          console.error('Input validator error:', error);
          this.validateState = 'error';
          return false;
        }
      }
      
      // 如果有正则验证
      if (this.pattern && this.innerValue) {
        const pattern = this.pattern instanceof RegExp ? 
          this.pattern : new RegExp(this.pattern);
        
        if (!pattern.test(this.innerValue)) {
          this.validateState = 'error';
          return false;
        }
      }
      
      // 长度验证
      if (this.maxlength && this.innerValue && this.textLength > this.maxlength) {
        this.validateState = 'error';
        return false;
      }
      
      if (this.minlength && this.innerValue && this.textLength < this.minlength) {
        this.validateState = 'error';
        return false;
      }
      
      // 通过验证
      this.validateState = 'success';
      return true;
    },
    
    // 计算文本域高度
    resizeTextarea() {
      if (!this.isTextarea || !this.autosize) return;
      
      const { autosize } = this;
      const minRows = autosize.minRows || 2;
      const maxRows = autosize.maxRows || 6;
      
      // 这里简化了自动高度计算逻辑
      // 实际应用中可能需要更复杂的计算
      this.textareaCalcStyle = {
        'min-height': `${minRows * 20}px`,
        'max-height': maxRows ? `${maxRows * 20}px` : 'none'
      };
    }
  },
  
  mounted() {
    if (this.isTextarea && this.autosize) {
      this.resizeTextarea();
    }
    
    // 自动获取焦点
    if (this.autofocus) {
      this.focus();
    }
  },
  
  updated() {
    if (this.isTextarea && this.autosize) {
      this.$nextTick(this.resizeTextarea);
    }
  },
  
  // 使用渲染函数
  render(h) {
    // 准备输入框属性
    const inputProps = {
      ref: 'input',
      attrs: {
        type: this.inputType,
        placeholder: this.placeholder,
        disabled: this.disabled,
        readonly: this.readonly,
        maxlength: this.maxlength,
        minlength: this.minlength,
        autocomplete: this.autocomplete,
        autofocus: this.autofocus,
        name: this.name,
        rows: this.isTextarea ? this.rows : undefined,
        'aria-label': this.placeholder || 'input'
      },
      domProps: {
        value: this.innerValue
      },
      class: {
        'sac-input__inner': true
      },
      style: this.isTextarea && this.autosize ? this.textareaCalcStyle : {},
      on: {
        input: this.handleInput,
        change: this.handleChange,
        focus: this.handleFocus,
        blur: this.handleBlur,
        keydown: this.handleKeydown,
        keyup: this.handleKeyup
      }
    };
    
    // 创建输入框元素
    const inputElement = h(this.isTextarea ? 'textarea' : 'input', inputProps);
    
    // 准备前缀图标
    const prefixIcon = this.prefixIcon ? h('i', {
      class: ['sac-input__prefix-icon', this.prefixIcon]
    }) : null;
    
    // 准备后缀图标
    let suffixIcon = this.suffixIcon ? h('i', {
      class: ['sac-input__suffix-icon', this.suffixIcon]
    }) : null;
    
    // 如果是密码输入框，添加切换可见性的图标
    if (this.isPassword) {
      const passwordIcon = this.passwordVisible ? 'eye-open' : 'eye-close';
      suffixIcon = h('i', {
        class: ['sac-input__suffix-icon', `sac-icon-${passwordIcon}`],
        on: {
          click: this.togglePasswordVisible
        }
      });
    }
    
    // 准备清除按钮
    const clearIcon = this.showClear ? h('i', {
      class: ['sac-input__clear', 'sac-icon-close-circle'],
      on: {
        click: this.clear
      }
    }) : null;
    
    // 准备字数限制
    const limitText = this.shouldShowLimit ? h('span', {
      class: 'sac-input__count'
    }, `${this.textLength}/${this.maxlength}`) : null;
    
    // 准备错误消息
    const errorMsg = this.validateState === 'error' && this.errorMessage ? h('div', {
      class: 'sac-input__error'
    }, this.errorMessage) : null;
    
    // 创建输入框容器
    return h('div', {
      class: this.inputClass,
      on: {
        mouseenter: this.handleMouseEnter,
        mouseleave: this.handleMouseLeave
      }
    }, [
      prefixIcon ? h('div', { class: 'sac-input__prefix' }, [prefixIcon]) : null,
      inputElement,
      (suffixIcon || clearIcon || limitText) ? h('div', { class: 'sac-input__suffix' }, [
        clearIcon,
        suffixIcon,
        limitText
      ]) : null,
      errorMsg
    ]);
  }
};

/**
 * 文本域组件
 */
export const SacTextarea = {
  name: 'SacTextarea',
  props: {
    // v-model绑定值
    value: {
      type: String,
      default: ''
    },
    // 占位符
    placeholder: {
      type: String,
      default: ''
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否只读
    readonly: {
      type: Boolean,
      default: false
    },
    // 最大长度
    maxlength: {
      type: [String, Number],
      default: null
    },
    // 最小长度
    minlength: {
      type: [String, Number],
      default: null
    },
    // 自动调整大小
    autosize: {
      type: [Boolean, Object],
      default: false
    },
    // 行数
    rows: {
      type: [String, Number],
      default: 3
    },
    // 自动聚焦
    autofocus: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      // 内部值，用于实现受控组件
      internalValue: this.value,
      // 是否聚焦
      isFocused: false,
      // 文本域高度
      textareaHeight: null
    };
  },
  
  computed: {
    // 计算文本域类名
    textareaClasses() {
      return [
        'sac-textarea',
        {
          'sac-textarea--focused': this.isFocused,
          'sac-textarea--disabled': this.disabled,
          'sac-textarea--readonly': this.readonly,
          'sac-textarea--autosize': this.autosize
        }
      ];
    },
    
    // 计算文本域样式
    textareaStyles() {
      const styles = {};
      
      if (this.textareaHeight && this.autosize) {
        styles.height = `${this.textareaHeight}px`;
        styles.minHeight = this.autosize.minRows 
          ? `${this.autosize.minRows * 20}px` 
          : null;
        styles.maxHeight = this.autosize.maxRows 
          ? `${this.autosize.maxRows * 20}px` 
          : null;
      }
      
      return styles;
    }
  },
  
  watch: {
    // 监听外部值变化
    value(newValue) {
      this.internalValue = newValue;
      if (this.autosize) {
        this.$nextTick(this.resizeTextarea);
      }
    }
  },
  
  mounted() {
    if (this.autosize) {
      this.resizeTextarea();
    }
  },
  
  methods: {
    // 处理输入事件
    handleInput(event) {
      const value = event.target.value;
      this.internalValue = value;
      this.$emit('input', value);
      
      if (this.autosize) {
        this.resizeTextarea();
      }
    },
    
    // 处理变化事件
    handleChange(event) {
      this.$emit('change', event.target.value);
    },
    
    // 处理聚焦事件
    handleFocus(event) {
      this.isFocused = true;
      this.$emit('focus', event);
    },
    
    // 处理失焦事件
    handleBlur(event) {
      this.isFocused = false;
      this.$emit('blur', event);
    },
    
    // 调整文本域大小
    resizeTextarea() {
      const textarea = this.$refs.textarea;
      if (!textarea) return;
      
      // 重置高度以便正确计算
      textarea.style.height = 'auto';
      
      // 计算新高度
      this.textareaHeight = textarea.scrollHeight;
    },
    
    // 聚焦方法
    focus() {
      this.$refs.textarea && this.$refs.textarea.focus();
    },
    
    // 失焦方法
    blur() {
      this.$refs.textarea && this.$refs.textarea.blur();
    }
  },
  
  // 使用渲染函数
  render(h) {
    return h('div', {
      class: this.textareaClasses
    }, [
      h('textarea', {
        ref: 'textarea',
        class: 'sac-textarea__inner',
        style: this.textareaStyles,
        domProps: {
          value: this.internalValue
        },
        attrs: {
          rows: this.rows,
          placeholder: this.placeholder,
          disabled: this.disabled,
          readonly: this.readonly,
          autofocus: this.autofocus,
          maxlength: this.maxlength,
          minlength: this.minlength
        },
        on: {
          input: this.handleInput,
          change: this.handleChange,
          focus: this.handleFocus,
          blur: this.handleBlur
        }
      })
    ]);
  }
};

// 输入框相关的CSS样式
export const inputStyle = `
.sac-input,
.sac-textarea {
  position: relative;
  display: inline-block; /* input默认是inline-block, textarea默认是block，这里统一 */
  width: 100%;
  font-size: var(--b3-font-size);
  color: var(--b3-theme-on-surface);
}

/* 通用内部输入/文本域元素样式 */
.sac-input__inner,
.sac-textarea__inner {
  -webkit-appearance: none;
  appearance: none; /* 标准写法 */
  background-color: var(--b3-theme-background);
  background-image: none;
  border-radius: var(--b3-border-radius-s); /* 参考 .b3-text-field */
  border: 1px solid var(--b3-border-color);
  box-sizing: border-box;
  color: var(--b3-theme-on-background);
  display: block; /* 统一为块级 */
  font-size: inherit;
  outline: none;
  padding: 5px 8px; /* 参考 .b3-text-field padding */
  transition: var(--b3-transition); /* 使用统一过渡 */
  width: 100%;
}

/* 聚焦状态 */
.sac-input__inner:focus,
.sac-textarea__inner:focus {
  border-color: var(--b3-theme-primary);
  /* 思源原生输入框聚焦时似乎没有 box-shadow */
}

/* --- SacInput 特定样式 --- */

.sac-input__inner {
  height: 30px; /* 参考 .b3-text-field 计算高度 = padding-top + padding-bottom + line-height (approx font-size) */
  line-height: 1.42857; /* 保持与原生一致，控制垂直居中 */
}

/* 不同尺寸调整 */
.sac-input--small .sac-input__inner {
  height: 26px;
  font-size: calc(var(--b3-font-size) * 0.9);
  padding: 4px 6px;
}

.sac-input--large .sac-input__inner {
  height: 36px;
  font-size: calc(var(--b3-font-size) * 1.1);
  padding: 6px 10px;
}

/* 禁用状态 */
.sac-input--disabled .sac-input__inner,
.sac-textarea--disabled .sac-textarea__inner {
  background-color: var(--b3-theme-surface-lighter); /* 参考原生禁用背景 */
  border-color: var(--b3-border-color);
  color: var(--b3-theme-on-surface-light); /* 禁用文字颜色 */
  cursor: not-allowed;
}

/* 只读状态 (视觉上通常与普通状态一致，但不可编辑) */
.sac-input--readonly .sac-input__inner,
.sac-textarea--readonly .sac-textarea__inner {
  background-color: var(--b3-theme-surface-lighter); /* 给只读一个稍微不同的背景 */
}

/* 带前缀/后缀图标时的内边距调整 */
.sac-input--with-prefix .sac-input__inner {
  padding-left: 30px; /* 需要与图标容器宽度协调 */
}

.sac-input--with-suffix .sac-input__inner {
  padding-right: 30px; /* 需要与图标容器宽度协调 */
}

/* 图标容器 */
.sac-input__prefix,
.sac-input__suffix {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  color: var(--b3-theme-on-surface-light); /* 图标默认颜色 */
  pointer-events: none; /* 默认不响应鼠标事件 */
}

.sac-input__prefix {
  left: 5px;
}

.sac-input__suffix {
  right: 5px;
  gap: 4px; /* 后缀区域可能有多个图标，增加间距 */
}

/* 容器内的具体图标 */
.sac-input__prefix .sac-input__prefix-icon,
.sac-input__suffix .sac-input__suffix-icon,
.sac-input__suffix .sac-input__clear,
.sac-input__suffix .sac-icon-eye-open,
.sac-input__suffix .sac-icon-eye-close {
  height: 100%;
  width: 20px; /* 稍微减小图标宽度 */
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto; /* 使图标可交互 */
  cursor: default;
  transition: var(--b3-transition);
}

/* 可交互图标（清除、密码切换） */
.sac-input__clear,
.sac-icon-eye-open,
.sac-icon-eye-close {
  cursor: pointer;
}

.sac-input__clear:hover,
.sac-icon-eye-open:hover,
.sac-icon-eye-close:hover {
  color: var(--b3-theme-on-surface); /* 悬停时颜色加深 */
}

/* 字数统计 */
.sac-input__suffix .sac-input__count {
  font-size: 12px;
  color: var(--b3-theme-on-surface-light);
  padding: 0 5px;
  user-select: none;
  pointer-events: none;
}

/* 错误状态 */
.sac-input--error .sac-input__inner,
.sac-input--error .sac-textarea__inner {
  border-color: var(--b3-theme-error);
}

/* 错误消息 */
.sac-input__error {
  color: var(--b3-theme-error);
  font-size: 12px;
  line-height: 1.2;
  padding-top: 4px;
}

/* --- SacTextarea 特定样式 --- */

.sac-textarea__inner {
  line-height: 1.5; /* 文本域行高需要大一点 */
  resize: vertical; /* 允许用户垂直调整，除非 autosize 启用 */
  min-height: 60px; /* 默认最小高度 */
}

.sac-textarea--autosize .sac-textarea__inner {
  resize: none; /* 自动调整时禁用手动调整 */
  overflow-y: hidden; /* 隐藏滚动条，靠 JS 计算高度 */
}
`;

// 中文别名
export const 输入框 = SacInput;
export const 文本域 = SacTextarea; 