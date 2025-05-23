<template>
  <SCard 
    class="provider-card" 
    :current="isActive"
    :hoverable="true"
    @click="$emit('select', provider.id)"
  >
    <template #image>
      <div class="provider-logo">
        <img :src="provider.logo" :alt="provider.name">
      </div>
    </template>
    
    <div class="card-header">
      <div class="provider-info">
        <div class="provider-name">{{ provider.name }}</div>
        <div class="provider-location">{{ provider.location }} · {{ provider.establishedYear }}</div>
      </div>
      <div class="model-count">
        <span>{{ provider.modelCount }}个模型</span>
      </div>
    </div>
    <div class="provider-description">{{ provider.description }}</div>
    <div class="provider-features">
      <span class="feature-item" v-for="feature in provider.features" :key="feature">
        <i class="icon-check"></i>{{ feature }}
      </span>
    </div>
    <div class="provider-links">
      <a 
        v-for="(url, type) in provider.links" 
        :key="type" 
        :href="url" 
        target="_blank" 
        class="link-item"
      >
        <i :class="`icon-${type}`"></i>
        {{ getLinkText(type) }}
      </a>
    </div>
    
    <template #actions>
      <div class="tags">
        <span class="tag" v-for="tag in provider.services" :key="tag">{{ tag }}</span>
      </div>
    </template>
  </SCard>
</template>

<script setup>
import SCard from '../../../../shared/siyuanUI-vue/components/SCard.vue'

const props = defineProps({
  provider: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select'])

const getLinkText = (type) => {
  const textMap = {
    homepage: '官网',
    console: '控制台',
    docs: '文档',
    pricing: '价格',
    github: 'GitHub'
  }
  return textMap[type] || type
}
</script>

<style scoped>
.provider-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  justify-content: space-between;
}

.provider-logo {
  width: 48px;
  height: 48px;
}

.provider-logo img {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  object-fit: contain;
}

.provider-info {
  flex: 1;
  margin-right: 16px;
}

.provider-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.provider-location {
  color: #666;
  font-size: 14px;
}

.provider-description {
  color: #333;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.provider-features {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 16px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 4px;
}

.icon-check {
  color: #52c41a;
  font-size: 12px;
}

.provider-links {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  background: #f0f5ff;
  transition: all 0.3s;
}

.link-item:hover {
  background: #e6f7ff;
}

.model-count {
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
}

[class^="icon-"] {
  font-size: 16px;
}

.icon-homepage {
  color: #1890ff;
}

.icon-console {
  color: #722ed1;
}

.icon-docs {
  color: #13c2c2;
}

.icon-pricing {
  color: #52c41a;
}

.icon-github {
  color: #333;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  background: #f5f5f5;
  font-size: 12px;
  color: #666;
}
</style> 