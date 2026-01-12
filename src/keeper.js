/**
 * Keeper Bot Entry Point
 * 
 * Runs billing for all due subscriptions.
 * Can be executed manually: npm run keeper
 * Or scheduled via cron: 0 * * * * cd /path/to/project && npm run keeper
 */

require('dotenv').config();
const { runKeeper } = require('./services/keeperService');
const { close } = require('./utils/db');

async function main() {
  console.log('='.repeat(50));
  console.log(`[Keeper] Starting at ${new Date().toISOString()}`);
  console.log('='.repeat(50));
  
  try {
    const results = await runKeeper();
    
    console.log('\n[Keeper] Summary:');
    console.log(`  - Processed: ${results.processed}`);
    console.log(`  - Success: ${results.success}`);
    console.log(`  - Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log('\n[Keeper] Errors:');
      results.errors.forEach(e => {
        console.log(`  - Subscription #${e.subscriptionId}: ${e.error}`);
      });
    }
    
    // Exit with error code if any failures
    process.exitCode = results.failed > 0 ? 1 : 0;
  } catch (err) {
    console.error('[Keeper] Fatal error:', err.message);
    process.exitCode = 1;
  } finally {
    // Close database connection
    close();
    console.log('\n[Keeper] Done');
  }
}

main();
