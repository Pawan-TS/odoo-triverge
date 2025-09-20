require('dotenv').config();
const redis = require('redis');

async function testRedisEnvConfig() {
  console.log('🔄 Testing Redis with .env configuration...');
  console.log(`📍 Host: ${process.env.REDIS_HOST}`);
  console.log(`🔌 Port: ${process.env.REDIS_PORT}`);
  console.log(`🔐 Password: ${process.env.REDIS_PASSWORD ? '***hidden***' : 'none'}`);
  console.log(`📀 Database: ${process.env.REDIS_DB}`);
  
  const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB)
  });

  try {
    await client.connect();
    console.log('✅ Redis connected successfully with .env config!');
    
    // Test HSN cache simulation
    const hsnCacheKey = 'hsn:search:furniture';
    const hsnData = {
      code: '9403',
      description: 'Other furniture and parts thereof',
      gstRate: '18%',
      cachedAt: new Date().toISOString()
    };
    
    await client.setEx(hsnCacheKey, parseInt(process.env.HSN_CACHE_TTL), JSON.stringify(hsnData));
    console.log(`💾 HSN data cached for ${process.env.HSN_CACHE_TTL} seconds (30 days)`);
    
    const cachedHsn = await client.get(hsnCacheKey);
    console.log('📦 Retrieved HSN data:', JSON.parse(cachedHsn));
    
    await client.disconnect();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
  }
}

testRedisEnvConfig();