const memoryUsage = process.memoryUsage();
console.log('Memory usage:', memoryUsage);

const usedHeap = memoryUsage.heapUsed / 1024 / 1024;
console.log(`Heap used: ${usedHeap.toFixed(2)} MB`);

const totalHeap = memoryUsage.heapTotal / 1024 / 1024;
console.log(`Heap total: ${totalHeap.toFixed(2)} MB`);