<template>
    <div ref="dropdownContainer">
        <div
            ref="trigger" 
            @click="toggleDropdown"
            @keydown.enter.prevent="toggleDropdown"
            @keydown.space.prevent="toggleDropdown"
            class="multi-select"
            role="combobox"
            :aria-expanded="dropdownOpen"
            aria-haspopup="listbox"
            tabindex="0" 
        >
            <span v-if="selectedExtensions.length === 0">{{ placeholder }}</span>
            <span v-else>{{ selectedExtensions.join(', ') }}</span>
            <span class="arrow" :class="{ open: dropdownOpen }">▼</span>
        </div>
        <div
            v-if="dropdownOpen"
            class="dropdown"
            @keydown.esc.prevent="closeDropdownAndFocusTrigger" 
        >
            <div class="dropdown-header">
                <input
                    ref="searchInput"
                    type="text"
                    v-model="searchQuery"
                    :placeholder="searchPlaceholder"
                    class="search-input"
                    @keydown="handleDropdownKeyDown" 
                />
                <div class="select-all">
                    <input
                        ref="selectAllCheckbox"
                        type="checkbox"
                        @change="toggleSelectAll"
                        :checked="isAllSelected"
                        @keydown="handleDropdownKeyDown" 
                        id="select-all-checkbox" 
                    />
                    <label for="select-all-checkbox">{{ selectAllLabel }}</label> 
                </div>
            </div>
            <div
                ref="listbox"
                class="dropdown-content"
                role="listbox"
                tabindex="-1" 
                @keydown="handleDropdownKeyDown" 
            >
                <div
                    v-for="(extension, index) in filteredExtensions"
                    :key="extension"
                    :ref="el => { if (el) optionRefs[index] = el }" 
                    class="dropdown-item"
                    :class="{ 'focused': focusedOptionIndex === index }" 
                    role="option"
                    :aria-selected="selectedExtensions.includes(extension)"
                    :tabindex="focusedOptionIndex === index ? 0 : -1" 
                    @click="toggleOption(extension)" 
                    @keydown.space.prevent="toggleOption(extension)"
                    @keydown.enter.prevent="toggleOption(extension)" 
                >
                    <input
                        type="checkbox"
                        :value="extension"
                        v-model="selectedExtensions"
                        tabindex="-1" 
                        :aria-checked="selectedExtensions.includes(extension)" 
                        :id="'option-' + extension" 
                    />
                    <label :for="'option-' + extension">{{ extension }}</label> 
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick ,defineProps, defineEmits} from 'vue';
import { useDropdownKeyboardNav } from './useDropdownKeyboardNav.js'; // 导入 Hook

const props = defineProps({
    options: {
        type: Array,
        default: () => ['jpg', 'png', 'gif', 'bmp', 'svg', 'pdf'] // 默认扩展名列表
    },
    modelValue: {
        type: Array,
        default: () => []
    },
    placeholder: {
        type: String,
        default: '扩展名' // 默认占位符
    },
    searchPlaceholder: {
        type: String,
        default: '搜索扩展名' // 默认搜索框占位符
    },
    selectAllLabel: {
        type: String,
        default: '全选/取消全选' // 默认全选标签
    }
});
const emit = defineEmits(['update:modelValue']);

const selectedExtensions = ref([...props.modelValue]);
watch(selectedExtensions, (newValue) => {
    emit('update:modelValue', newValue);
});

const dropdownOpen = ref(false);
const searchQuery = ref('');
const dropdownContainer = ref(null);
const trigger = ref(null);
const searchInput = ref(null);
const selectAllCheckbox = ref(null);
const listbox = ref(null);
const optionRefs = ref([]);

// 先定义 filteredExtensions
const filteredExtensions = computed(() => {
    optionRefs.value = []; // Clear refs
    return props.options.filter(extension =>
        extension.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// 再使用 Hook，传入已定义的 filteredExtensions
const { focusedOptionIndex, handleDropdownKeyDown, focusOption } = useDropdownKeyboardNav(
    { trigger, searchInput, selectAllCheckbox, listbox, optionRefs },
    filteredExtensions
);

const isAllSelected = computed(() => {
    // Check against all available options, not just filtered ones
    return props.options.length > 0 && props.options.every(opt => selectedExtensions.value.includes(opt));
});

const openDropdown = async () => {
    if (dropdownOpen.value) return;
    dropdownOpen.value = true;
    await nextTick();
    searchInput.value?.focus();
};

const closeDropdown = () => {
    if (!dropdownOpen.value) return;
    dropdownOpen.value = false;
};

const closeDropdownAndFocusTrigger = () => {
    closeDropdown();
    trigger.value?.focus();
};

const toggleDropdown = () => {
    if (dropdownOpen.value) {
        closeDropdownAndFocusTrigger();
    } else {
        openDropdown();
    }
};

const toggleSelectAll = () => {
    const allOptions = props.options;
    if (isAllSelected.value) {
        // Deselect all
        selectedExtensions.value = [];
    } else {
        // Select all
        selectedExtensions.value = [...allOptions];
    }
    selectAllCheckbox.value?.focus();
};

const toggleOption = (option) => {
    const index = selectedExtensions.value.indexOf(option);
    if (index > -1) {
        selectedExtensions.value.splice(index, 1);
    } else {
        selectedExtensions.value.push(option);
    }
    // Keep focus on the option after interaction
    const optionDomIndex = filteredExtensions.value.indexOf(option);
    if (optionDomIndex > -1) {
        focusOption(optionDomIndex);
    }
};

const handleClickOutside = (event) => {
    if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
        closeDropdown();
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside, true);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside, true);
});

watch(filteredExtensions, (newVal) => {
    optionRefs.value.length = newVal.length;
}, { flush: 'post' });

</script>

<style scoped>
.multi-select {
    border: 1px solid var(--b3-border-color);
    padding: 8px 24px 8px 8px; /* 增加内边距，右侧留出箭头空间 */
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;
    min-width: 120px; /* 设置最小宽度 */
    background-color: var(--b3-menu-background);
    border-radius: 4px; /* 添加圆角 */
}

.arrow {
    transition: transform 0.3s;
    position: absolute;
    right: 8px;
    color: var(--b3-theme-on-surface);
    font-size: 12px; /* 调整箭头大小 */
}

.arrow.open {
    transform: rotate(180deg);
}

.dropdown {
    border: 1px solid var(--b3-border-color);
    position: absolute;
    background-color: var(--b3-menu-background);
    z-index: 1000;
    width: 200px;
    max-height: 300px;
    margin-top: 4px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
}

.dropdown-header {
    position: sticky;
    top: 0;
    background-color: var(--b3-menu-background);
    padding: 8px;
    border-bottom: 1px solid var(--b3-border-color);
    z-index: 1;
}

.select-all {
    display: flex;
    align-items: center;
    padding: 6px 0;
    margin-top: 4px;
}

.select-all label {
    margin-left: 5px;
    cursor: pointer; /* Make label clickable */
}

.dropdown-content {
    overflow-y: auto;
    padding: 8px;
}

.dropdown-item {
    padding: 6px 8px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 3px; /* Add some rounding */
}

.dropdown-item:hover, .dropdown-item.focused {
    background-color: var(--b3-list-hover); /* Highlight on hover and keyboard focus */
    outline: none; /* Remove default focus outline */
}

.dropdown-item input {
    margin-right: 5px;
    pointer-events: none; /* Prevent checkbox itself from being focused */
}

.dropdown-item label {
     pointer-events: none; /* Prevent label clicks interfering */
     flex-grow: 1; /* Ensure label takes space */
}

.search-input {
    width: 100%; /* Make search input full width */
    box-sizing: border-box;
    padding: 6px 8px;
    border: 1px solid var(--b3-border-color);
    border-radius: 4px;
    background-color: var(--b3-menu-background);
    color: var(--b3-theme-on-background);
}
</style> 