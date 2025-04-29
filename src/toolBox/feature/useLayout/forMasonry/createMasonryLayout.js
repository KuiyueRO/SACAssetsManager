/**
 * @fileoverview 提供了创建和管理瀑布流布局的核心功能。
 * 使用 Rbush.js 进行空间索引优化查询。
 */
import Rbush from '../../../base/useDeps/thirdParty/rbush.js'; // 更新导入路径
import { forExecuteWithFixedLength } from '../../../base/useTool/useRunner.js';

/**
 * @typedef {object} MasonryItem Required properties for an item in the masonry layout.
 * @property {string|number} id - Unique identifier for the item.
 * @property {number} width - Width of the item.
 * @property {number} [height] - Height of the item (optional initially, can be updated later).
 * @property {number} [index] - Original index of the item (optional).
 */

/**
 * @typedef {object} MasonryLayoutInstance The returned masonry layout instance.
 * @property {Function} addItem - Adds a single item to the layout.
 * @property {Function} addItems - Adds multiple items to the layout.
 * @property {Function} updateItemHeight - Updates the height of a specific item.
 * @property {Function} batchUpdateIndex - Updates the indices of multiple items.
 * @property {Function} sortByIndex - Sorts items based on their index property.
 * @property {Function} search - Searches for items within a given bounding box.
 * @property {Function} rebuildLayout - Rebuilds the entire layout.
 * @property {Function} getTotalHeight - Gets the total height of the layout.
 * @property {Function} getItems - Gets all items currently in the layout.
 * @property {Array<object>} columns - The internal state of the columns.
 * @property {object} tree - The Rbush spatial index instance.
 */

/**
 * 创建一个瀑布流布局管理器实例。
 *
 * @param {object} options - 配置选项。
 * @param {number} options.columnCount - 布局的列数。
 * @param {number} options.gap - 项目之间的间距。
 * @param {Function} [options.reactive] - (可选) Vue 的 reactive 函数，用于创建响应式对象。如果提供，布局状态将是响应式的。
 * @param {Array<MasonryItem>} [options.initialItems=[]] - (可选) 初始的项目数组。
 * @returns {MasonryLayoutInstance} 瀑布流布局实例。
 */
export function createMasonryLayout({ columnCount, gap, reactive, initialItems = [] }) {
  const columns = reactive ? reactive(Array.from({ length: columnCount }, () => ({ height: 0, items: [] }))) : Array.from({ length: columnCount }, () => ({ height: 0, items: [] }));
  const tree = new Rbush();
  let allItems = reactive ? reactive([]) : []; // Store all items for easier access by ID

  const getItemColumnIndex = (item) => {
    return columns.findIndex(col => col.items.some(i => i.id === item.id));
  };

  const findShortestColumnIndex = () => {
    let shortestIndex = 0;
    for (let i = 1; i < columnCount; i++) {
      if (columns[i].height < columns[shortestIndex].height) {
        shortestIndex = i;
      }
    }
    return shortestIndex;
  };

  const calculateItemPosition = (item, columnIndex) => {
    const column = columns[columnIndex];
    const top = column.height;
    // Assuming item width is managed externally or fixed per column for simplicity here
    // We need the actual column width calculation logic if items have variable widths within columns
    // For now, assume items fit within column width boundaries.
    // Let's placeholder the horizontal positioning part
    const left = columnIndex * (item.width + gap); // Simplified placeholder
    const right = left + item.width;
    const bottom = top + (item.height || 0); // Use 0 height if not provided initially

    return { minX: left, minY: top, maxX: right, maxY: bottom, id: item.id, index:item.index }; // Add index here
  };

  const _addItem = (item) => {
    if (allItems.some(existingItem => existingItem.id === item.id)) {
      console.warn(`Item with id ${item.id} already exists. Skipping.`);
      return;
    }

    const shortestColumnIndex = findShortestColumnIndex();
    const column = columns[shortestColumnIndex];
    const position = calculateItemPosition(item, shortestColumnIndex);

    const layoutItem = reactive ? reactive({ ...item, ...position }) : { ...item, ...position };

    column.items.push(layoutItem);
    column.height += (item.height || 0) + gap; // Add gap after adding item height
    allItems.push(layoutItem);
    if (item.height) { // Only insert into Rbush if height is known
        tree.insert(layoutItem);
    }
  };

  // Optimized batch adding using forExecuteWithFixedLength
  const addItems = forExecuteWithFixedLength((items) => {
    items.forEach(_addItem);
  }, 50); // Process 50 items per batch


  const updateItemHeight = (itemId, newHeight) => {
     let itemFound = false;
     for (let i = 0; i < columns.length; i++) {
       const column = columns[i];
       const itemIndex = column.items.findIndex(item => item.id === itemId);
       if (itemIndex !== -1) {
         const item = column.items[itemIndex];
         const oldHeight = item.height || 0;
         const heightDifference = newHeight - oldHeight;

         // Update item properties
         item.height = newHeight;
         item.maxY = item.minY + newHeight;


         // Update Rbush entry
         try {
           tree.remove(item, (a, b) => a.id === b.id); // Use predicate for removal
         } catch (e) {
             // console.warn(`Failed to remove item ${itemId} from tree, might not exist yet.`, e);
             // It might not have been added if height was initially unknown
         }
         if(newHeight > 0) { // Only re-insert if height is valid
             tree.insert(item);
         }


         // Update heights of subsequent items in the same column
         for (let j = itemIndex + 1; j < column.items.length; j++) {
           const subsequentItem = column.items[j];
           subsequentItem.minY += heightDifference;
           subsequentItem.maxY += heightDifference;
           try {
                tree.remove(subsequentItem, (a,b) => a.id === b.id);
           } catch(e) {
               // console.warn("Error removing subsequent item during height update", e)
           }
            if (subsequentItem.height > 0) tree.insert(subsequentItem); // Re-insert with updated position
         }

         // Update column height
         column.height += heightDifference;
         itemFound = true;
         break; // Item found and updated, exit loop
       }
     }
     if (!itemFound) {
       // console.warn(`Item with id ${itemId} not found for height update.`);
     }
   };


  const batchUpdateIndex = forExecuteWithFixedLength((updates) => {
     const updateMap = new Map(updates.map(u => [u.id, u.index]));
     allItems.forEach(item => {
         if (updateMap.has(item.id)) {
             item.index = updateMap.get(item.id);
             // No need to update Rbush as index is not part of spatial data
         }
     });
   }, 500);


   const sortByIndex = () => {
       // 提取所有项目，并根据 index 排序
       const sortedItems = [...allItems].sort((a, b) => (a.index ?? Infinity) - (b.index ?? Infinity));
       // 清空现有布局和 R-tree
       tree.clear();
       allItems.splice(0, allItems.length); // Clear the reactive array if applicable
       columns.forEach(col => {
           col.height = 0;
           col.items.splice(0, col.items.length);
       });
       // 重新添加排序后的项目
       addItems(sortedItems); // Use the batch add function
   };

  const search = (minX, minY, maxX, maxY) => {
    return tree.search({ minX, minY, maxX, maxY });
  };

  const rebuildLayout = (newColumnCount) => {
    const currentItems = JSON.parse(JSON.stringify(allItems)); // Deep clone
    columnCount = newColumnCount; // Update column count

    // Clear existing state
    tree.clear();
    allItems.splice(0, allItems.length);
    columns.splice(0, columns.length, ...Array.from({ length: columnCount }, () => ({ height: 0, items: [] })));
     if (reactive) {
         // If reactive, ensure the outer array structure is also reactive if needed.
         // The spread above might break reactivity chain depending on Vue version/implementation.
         // Re-wrapping might be necessary.
         // This part needs careful handling with Vue's reactivity system.
         // For simplicity, we assume the above works or reactive() handles array mutations.
     }


    // Re-add items
    addItems(currentItems); // Use batch add
  };


  const getTotalHeight = () => {
     if (columns.length === 0) return 0;
     let maxHeight = 0;
     for (const col of columns) {
         if (col.height > maxHeight) {
             maxHeight = col.height;
         }
     }
     // Return the height of the tallest column. Subtract the last gap if needed,
     // but current logic adds gap *after* item height, so maxHeight should be correct.
     return maxHeight;
  };


  const getItems = () => {
    return allItems;
  };


  // Initialize with initial items if provided
  if (initialItems && initialItems.length > 0) {
    addItems(initialItems);
  }


  return {
    addItem: _addItem, // Expose single item add as well
    addItems,
    updateItemHeight,
    batchUpdateIndex,
    sortByIndex,
    search,
    rebuildLayout,
    getTotalHeight,
    getItems,
    // Expose columns and tree for debugging or advanced use? Maybe not.
    get columns() { return columns; }, // Getter to access columns state
    get tree() { return tree; } // Getter to access R-Tree state
  };
}

// Note: The `二分查找可见项` function from the original layout.js is not included here
// as it seemed separate from the core Rbush-based layout logic.
// It can be migrated separately if needed, potentially to a different utility module.
// Also, the detailed calculation logic for item 'left' position needs refinement based on actual column width. 