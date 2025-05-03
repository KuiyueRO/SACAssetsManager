<template>
  <div 
    class="b3-card" 
    :class="{
      'b3-card--wrap': wrap,
      'b3-card--current': current,
      'b3-card--disabled': disabled,
      'b3-card--hoverable': hoverable
    }"
  >
    <div v-if="$slots.image" class="b3-card__img">
      <slot name="image"></slot>
    </div>
    <div class="fn__flex-1 fn__flex-column">
      <div class="b3-card__info fn__flex-1">
        <slot></slot>
      </div>
      <div v-if="$slots.actions" class="b3-card__actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  wrap: {
    type: Boolean,
    default: false
  },
  current: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  hoverable: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.b3-card {
  margin: var(--b3-margin-half);
  border-radius: var(--b3-border-radius);
  background-color: var(--b3-theme-background);
  box-shadow: var(--b3-card-shadow);
  transition: all 150ms ease-in-out;
  border: 1px solid var(--b3-theme-surface-lighter);
}

.b3-card--hoverable:hover {
  box-shadow: var(--b3-card-hover-shadow);
  border-color: var(--b3-theme-primary-lightest);
}

.b3-card--current {
  background-color: var(--b3-theme-primary-lightest);
  border-color: var(--b3-theme-primary-lighter);
}

.b3-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--b3-theme-surface-lighter);
}

.b3-card__img {
  width: 100%;
  border-top-left-radius: var(--b3-border-radius);
  border-top-right-radius: var(--b3-border-radius);
  overflow: hidden;
}

.b3-card__info {
  padding: var(--b3-padding);
}

.b3-card__actions {
  display: flex;
  justify-content: flex-end;
  padding: var(--b3-padding-half);
  border-top: 1px solid var(--b3-border-color);
}
</style> 