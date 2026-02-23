#!/usr/bin/env node

const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const SITE_URL = 'https://taiwan-landlord-vietnam-tenant-syst.vercel.app';
const FEATURES_TO_CHECK = [
  '物業收支', // 應該顯示這個而不是"水電收支"
  '快速收租',
  '批量抄錶',
  '總表', // Dashboard應該顯示"總表"而不是"儀表板"
  'Excel' // 設定中應該有Excel匯出
];

async function checkWebsite() {
  console.log('🔍 檢查網站部署狀態...');
  console.log(`🌐 網站URL: ${SITE_URL}`);
  console.log('=' .repeat(50));

  try {
    // 1. 檢查HTTP狀態
    const status = await new Promise((resolve, reject) => {
      https.get(SITE_URL, (res) => {
        resolve(res.statusCode);
      }).on('error', reject);
    });

    console.log(`✅ HTTP狀態: ${status}`);

    if (status !== 200) {
      console.log(`❌ 網站返回非200狀態: ${status}`);
      return false;
    }

    // 2. 獲取頁面內容
    const content = await new Promise((resolve, reject) => {
      let data = '';
      https.get(SITE_URL, (res) => {
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      }).on('error', reject);
    });

    // 3. 檢查關鍵功能
    console.log('\n🔎 檢查新功能關鍵字:');
    let allFeaturesFound = true;
    
    for (const feature of FEATURES_TO_CHECK) {
      const found = content.includes(feature);
      console.log(`   ${found ? '✅' : '❌'} ${feature}`);
      if (!found) allFeaturesFound = false;
    }

    // 4. 檢查緩存標頭
    console.log('\n📊 檢查緩存資訊:');
    const cacheMatch = content.match(/<meta[^>]*cache-control[^>]*>/i);
    if (cacheMatch) {
      console.log(`   🔍 找到緩存標籤: ${cacheMatch[0].substring(0, 50)}...`);
    } else {
      console.log('   ℹ️ 未找到明確的緩存標籤');
    }

    // 5. 檢查版本標識
    console.log('\n🏷️ 檢查版本標識:');
    const versionMatch = content.match(/v\d+\.\d+\.\d+/);
    if (versionMatch) {
      console.log(`   📦 版本: ${versionMatch[0]}`);
    } else {
      console.log('   ℹ️ 未找到版本標識');
    }

    // 6. 檢查最後修改時間
    console.log('\n⏰ 檢查最後部署時間:');
    const dateMatch = content.match(/部署時間.*?\d{4}-\d{2}-\d{2}/i);
    if (dateMatch) {
      console.log(`   📅 ${dateMatch[0]}`);
    } else {
      // 檢查etag或類似標識
      const etagMatch = content.match(/etag.*?"([^"]+)"/i);
      if (etagMatch) {
        console.log(`   🔑 ETag: ${etagMatch[1].substring(0, 20)}...`);
      }
    }

    console.log('\n' + '=' .repeat(50));
    
    if (allFeaturesFound) {
      console.log('🎉 所有新功能關鍵字都找到了！網站應該已更新。');
      console.log('\n💡 如果仍然看到舊版本，請嘗試：');
      console.log('   1. 清除瀏覽器緩存 (Ctrl+Shift+Delete)');
      console.log('   2. 使用無痕模式訪問');
      console.log('   3. 等待幾分鐘讓Vercel部署完成');
      return true;
    } else {
      console.log('⚠️ 有些新功能關鍵字未找到，網站可能還在舊版本。');
      console.log('\n🔄 Vercel部署可能需要幾分鐘時間。');
      console.log('   最新提交: f34efe2 (修復TypeScript錯誤並完成功能實現)');
      console.log('   請等待幾分鐘後再檢查。');
      return false;
    }

  } catch (error) {
    console.error(`❌ 檢查網站時出錯: ${error.message}`);
    return false;
  }
}

async function checkGitStatus() {
  console.log('\n📦 檢查Git狀態:');
  try {
    const { stdout } = await execAsync('git log --oneline -3');
    console.log('最近提交:');
    console.log(stdout.trim());
    
    const { stdout: status } = await execAsync('git status --short');
    if (status.trim()) {
      console.log('⚠️ 有未提交的更改:');
      console.log(status.trim());
    } else {
      console.log('✅ 所有更改已提交');
    }
  } catch (error) {
    console.log(`❌ 無法檢查Git狀態: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 開始檢查租賃管理系統部署狀態');
  console.log('=' .repeat(50));
  
  await checkGitStatus();
  console.log('\n' + '=' .repeat(50));
  
  const websiteOk = await checkWebsite();
  
  console.log('\n' + '=' .repeat(50));
  console.log(websiteOk ? '✅ 檢查完成 - 網站應該正常' : '⚠️ 檢查完成 - 可能需要等待部署');
  
  if (!websiteOk) {
    console.log('\n🔧 建議操作:');
    console.log('   1. 等待5-10分鐘讓Vercel完成部署');
    console.log('   2. 訪問 https://vercel.com/leo124805290-ctrl/taiwan-landlord-vietnam-tenant-system/deployments');
    console.log('   3. 檢查部署日誌確認狀態');
  }
}

main().catch(console.error);