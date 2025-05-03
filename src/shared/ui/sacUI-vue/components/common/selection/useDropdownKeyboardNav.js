import { ref, nextTick,watch } from '../../../../../../../static/vue.esm-browser.js';

/**
 * @description 管理多选下拉框内部的键盘导航逻辑。
 * @param {object} refs - 包含组件内部元素引用的对象。
 * @param {Ref<HTMLElement>} refs.trigger - 触发器元素的 ref。
 * @param {Ref<HTMLElement>} refs.searchInput - 搜索输入框的 ref。
 * @param {Ref<HTMLElement>} refs.selectAllCheckbox - 全选复选框的 ref。
 * @param {Ref<HTMLElement>} refs.listbox - 选项列表容器 (ul/div) 的 ref。
 * @param {Ref<Array<HTMLElement>>} refs.optionRefs - 选项元素 ref 的数组。
 * @param {Ref<Array<any>>} filteredExtensions - 经过过滤的当前可见选项数组。
 * @returns {object} - 包含键盘处理函数和焦点状态的对象。
 * @returns {Ref<number>} focusedOptionIndex - 当前键盘聚焦选项的索引 (-1 表示无选项聚焦)。
 * @returns {function} handleDropdownKeyDown - 处理下拉框内部按键事件的函数。
 * @returns {function} focusOption - 将焦点设置到指定索引选项的函数。
 */
export function useDropdownKeyboardNav(refs, filteredExtensions) {
    const { trigger, searchInput, selectAllCheckbox, listbox, optionRefs } = refs;
    const focusedOptionIndex = ref(-1); // Index for keyboard focus within options

    const focusOption = (index) => {
        if (index < 0 || index >= filteredExtensions.value.length) return;
        focusedOptionIndex.value = index;
        nextTick(() => {
            // Vue 的 ref 数组可能包含 null，需要检查
            optionRefs.value[index]?.focus();
        });
    };

    const focusSearchInput = () => {
        focusedOptionIndex.value = -1;
        searchInput.value?.focus();
    };

    const focusSelectAll = () => {
        focusedOptionIndex.value = -1;
        selectAllCheckbox.value?.focus();
    };

    const handleDropdownKeyDown = (event) => {
        const itemsCount = filteredExtensions.value.length;
        // 使用 event.target 确认当前焦点元素比 document.activeElement 更可靠
        const currentFocusElement = event.target;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (currentFocusElement === searchInput.value) {
                    focusSelectAll();
                } else if (currentFocusElement === selectAllCheckbox.value) {
                    if (itemsCount > 0) focusOption(0);
                } else { // Focus is on an option item or listbox itself
                    const nextIndex = itemsCount > 0 ? (focusedOptionIndex.value + 1) % itemsCount : -1;
                    if (nextIndex !== -1) focusOption(nextIndex);
                }
                break;

            case 'ArrowUp':
                event.preventDefault();
                if (currentFocusElement === searchInput.value) {
                    // Loop to the last option if available, otherwise select all
                    if (itemsCount > 0) focusOption(itemsCount - 1); else focusSelectAll();
                } else if (currentFocusElement === selectAllCheckbox.value) {
                    focusSearchInput();
                } else { // Focus is on an option item or listbox itself
                    const prevIndex = itemsCount > 0 ? (focusedOptionIndex.value - 1 + itemsCount) % itemsCount : -1;
                    if (prevIndex !== -1) focusOption(prevIndex);
                    // If moving up from the first item, decide where to go (search or select all)
                    // Going to search input feels more natural when looping up
                    else focusSearchInput();
                }
                break;

            case 'Home':
                // Check if focus is generally within the listbox context (option or listbox itself)
                if (itemsCount > 0 && (currentFocusElement?.role === 'option' || currentFocusElement === listbox.value)) {
                    event.preventDefault();
                    focusOption(0);
                }
                break;

            case 'End':
                 if (itemsCount > 0 && (currentFocusElement?.role === 'option' || currentFocusElement === listbox.value)) {
                    event.preventDefault();
                    focusOption(itemsCount - 1);
                }
                break;
            // Enter and Space are handled directly on the elements
            // Escape is handled on the dropdown container
            // Tab behavior remains default (moves focus out of the component)
        }
    };

    // Reset focus index when filtered items change
    watch(filteredExtensions, () => {
        focusedOptionIndex.value = -1;
    }, { deep: true });

    return {
        focusedOptionIndex,
        handleDropdownKeyDown,
        focusOption // Expose if needed externally, though maybe not
    };
} 