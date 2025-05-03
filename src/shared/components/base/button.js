/**
 * 基础按钮组件
 * 
 * 提供可定制的按钮组件，使用JavaScript定义Vue组件。
 * 
 * @module shared/components/base/button
 */

/**
 * 按钮组件
 * 用JavaScript定义的Vue按钮组件
 */
export const SacButton = {
  name: 'SacButton',
  props: {
    // 按钮文本
    text: {
      type: String,
      default: ''
    },
    // 按钮类型
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'danger', 'text'].includes(value)
    },
    // 按钮大小
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 图标
    icon: {
      type: String,
      default: ''
    },
    // 是否为圆形按钮
    round: {
      type: Boolean,
      default: false
    },
    // 是否为块级按钮
    block: {
      type: Boolean,
      default: false
    }
  },
  
  computed: {
    // 计算按钮类名
    buttonClasses() {
      return [
        'sac-button',
        `sac-button--${this.type}`,
        `sac-button--${this.size}`,
        {
          'sac-button--disabled': this.disabled,
          'sac-button--round': this.round,
          'sac-button--block': this.block
        }
      ];
    }
  },
  
  methods: {
    // 处理点击事件
    handleClick(event) {
      if (this.disabled) {
        event.preventDefault();
        return;
      }
      this.$emit('click', event);
    }
  },
  
  // 使用渲染函数
  render(h) {
    return h(
      'button',
      {
        class: this.buttonClasses,
        attrs: {
          disabled: this.disabled,
          type: 'button'
        },
        on: {
          click: this.handleClick
        }
      },
      [
        // 图标
        this.icon ? h('span', { class: 'sac-button__icon' }, [
          h('i', { class: this.icon })
        ]) : null,
        
        // 文本
        this.text ? h('span', { class: 'sac-button__text' }, this.text) : null,
        
        // 默认插槽
        this.$slots.default
      ].filter(Boolean)
    );
  }
};

/**
 * 按钮组组件
 * 用JavaScript定义的Vue按钮组组件
 */
export const SacButtonGroup = {
  name: 'SacButtonGroup',
  props: {
    // 排列方向
    vertical: {
      type: Boolean,
      default: false
    },
    // 大小
    size: {
      type: String,
      default: '',
      validator: (value) => ['', 'small', 'medium', 'large'].includes(value)
    }
  },
  
  computed: {
    // 计算组件类名
    groupClasses() {
      return [
        'sac-button-group',
        {
          'sac-button-group--vertical': this.vertical
        },
        this.size ? `sac-button-group--${this.size}` : ''
      ];
    }
  },
  
  render(h) {
    // 如果指定了大小，给所有子按钮应用相同大小
    const children = this.$slots.default || [];
    
    if (this.size) {
      children.forEach(vnode => {
        if (vnode.componentOptions && vnode.componentOptions.tag === 'sac-button') {
          if (!vnode.componentOptions.propsData) {
            vnode.componentOptions.propsData = {};
          }
          vnode.componentOptions.propsData.size = this.size;
        }
      });
    }
    
    return h('div', { class: this.groupClasses }, children);
  }
};

// 按钮的CSS样式，可以通过Vue插件安装时注入
export const buttonStyle = `
.sac-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  transition: box-shadow var(--b3-transition, 280ms cubic-bezier(.4, 0, .2, 1)), background-color var(--b3-transition, .2s cubic-bezier(0, 0, .2, 1)), color var(--b3-transition, .2s cubic-bezier(0, 0, .2, 1));
  user-select: none;
  vertical-align: middle;
  border: 0;
  border-radius: var(--b3-border-radius, 4px);
  padding: 4px 8px;
  font-size: var(--b3-font-size-base, 14px);
  margin: 0;
  text-decoration: none;
}

.sac-button:hover,
.sac-button:focus {
  text-decoration: none;
}

.sac-button:focus {
}

.sac-button--default {
  background-color: var(--b3-theme-primary, #4285f4);
  color: var(--b3-theme-on-primary, #ffffff);
}

.sac-button--default:hover,
.sac-button--default:focus {
  box-shadow: var(--b3-button-shadow, 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12));
}

.sac-button--default:active {
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12);
}

.sac-button--primary {
  background-color: var(--b3-theme-primary, #4285f4);
  color: var(--b3-theme-on-primary, #ffffff);
}

.sac-button--primary:hover,
.sac-button--primary:focus {
  box-shadow: var(--b3-button-shadow, 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12));
}

.sac-button--primary:active {
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, .2), 0 8px 10px 1px rgba(0, 0, 0, .14), 0 3px 14px 2px rgba(0, 0, 0, .12);
}

.sac-button--danger {
  background-color: transparent;
  color: var(--b3-theme-error, #f56c6c);
  box-shadow: inset 0 0 0 .6px var(--b3-theme-error, #f56c6c);
}

.sac-button--danger:hover,
.sac-button--danger:focus {
  background-color: var(--b3-card-error-background, rgba(245,108,108,0.1));
  box-shadow: inset 0 0 0 1px var(--b3-theme-error, #f56c6c);
}

.sac-button--danger:active {
  background-color: var(--b3-card-error-background, rgba(245,108,108,0.15));
  box-shadow: inset 0 0 0 1px var(--b3-theme-error, #f56c6c);
}

.sac-button--text {
  background: transparent;
  color: var(--b3-theme-primary, #4285f4);
}

.sac-button--text:hover,
.sac-button--text:focus {
  background-color: var(--b3-theme-primary-lightest, rgba(66,133,244,0.08));
  box-shadow: none;
}

.sac-button--text:active {
  background-color: var(--b3-theme-primary-lighter, rgba(66,133,244,0.12));
  box-shadow: none;
}

.sac-button--cancel {
  background-color: transparent;
  color: var(--b3-theme-on-surface, #606266);
}

.sac-button--cancel:hover,
.sac-button--cancel:focus {
  background-color: var(--b3-list-hover, rgba(0,0,0,0.05));
  box-shadow: none;
}

.sac-button--cancel:active {
  background-color: var(--b3-list-icon-hover, rgba(0,0,0,0.08));
  box-shadow: none;
}

.sac-button--disabled {
  cursor: not-allowed;
  opacity: .38;
  pointer-events: none;
  box-shadow: none !important;
}

.sac-button--small {
  padding: 0 4px;
  font-size: 12px;
  line-height: 18px;
}

.sac-button--medium {
}

.sac-button--large {
  padding: 8px 16px;
  line-height: 24px;
}

.sac-button--round {
  border-radius: 100px;
}

.sac-button--block {
  display: flex;
  width: 100%;
}

.sac-button__icon {
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
  height: 16px;
  flex-shrink: 0;
}
.sac-button__icon svg {
  height: 16px;
  width: 16px;
}

.sac-button__text {
  display: inline-block;
}

.sac-button-group {
  display: inline-flex;
  vertical-align: middle;
}

.sac-button-group > .sac-button:not(:first-child) {
  margin-left: -1px;
}

.sac-button-group > .sac-button:not(:first-child):not(:last-child) {
  border-radius: 0;
}

.sac-button-group > .sac-button:first-child:not(:last-child) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.sac-button-group > .sac-button:last-child:not(:first-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.sac-button-group--vertical {
  flex-direction: column;
}

.sac-button-group--vertical > .sac-button:not(:first-child) {
  margin-left: 0;
  margin-top: -1px;
}

.sac-button-group--vertical > .sac-button:not(:first-child):not(:last-child) {
  border-radius: 0;
}

.sac-button-group--vertical > .sac-button:first-child:not(:last-child) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.sac-button-group--vertical > .sac-button:last-child:not(:first-child) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
`;

// 中文别名
export const 按钮 = SacButton;
export const 按钮组 = SacButtonGroup; 