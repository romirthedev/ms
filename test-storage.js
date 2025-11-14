// Test script to check if storage can be imported
console.log('Starting storage import test...');

try {
  console.log('Current working directory:', process.cwd());
  console.log('Attempting to import storage...');
  
  // Test the import path
  const storagePath = './server/storage.ts';
  console.log('Import path:', storagePath);
  
  // Try dynamic import
  import(storagePath).then(module => {
    console.log('Storage module imported successfully');
    console.log('Module keys:', Object.keys(module));
    console.log('Storage instance:', typeof module.storage);
    
    if (module.storage) {
      console.log('Storage constructor:', module.storage.constructor.name);
      console.log('Storage methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(module.storage)).filter(name => typeof module.storage[name] === 'function'));
      
      // Test calling a method
      console.log('Testing getTopRatedStockAnalyses...');
      module.storage.getTopRatedStockAnalyses(5).then(result => {
        console.log('getTopRatedStockAnalyses result:', result);
      }).catch(err => {
        console.error('getTopRatedStockAnalyses error:', err);
      });
    }
  }).catch(error => {
    console.error('Failed to import storage:', error);
    console.error('Error stack:', error.stack);
  });
  
} catch (error) {
  console.error('Sync error:', error);
  console.error('Sync error stack:', error.stack);
}