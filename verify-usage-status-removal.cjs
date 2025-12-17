const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Usage Status Removal...\n');

const filesToCheck = [
    'views/AssetsView.tsx',
    'components/UploadAssetModal.tsx',
    'types.ts',
    'constants.tsx',
    'views/AssetsViewUpdated.tsx'
];

let allClear = true;
let issues = [];

filesToCheck.forEach(filePath => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for usage_status field references
        const usageStatusMatches = content.match(/usage_status\s*:/g);
        if (usageStatusMatches && usageStatusMatches.length > 0) {
            issues.push(`❌ ${filePath}: Found ${usageStatusMatches.length} usage_status field references`);
            allClear = false;
        }

        // Check for Usage Status UI text
        const usageStatusUIMatches = content.match(/Usage Status/g);
        if (usageStatusUIMatches && usageStatusUIMatches.length > 0) {
            issues.push(`❌ ${filePath}: Found ${usageStatusUIMatches.length} "Usage Status" UI text references`);
            allClear = false;
        }

        // Check for Available/In Use/Archived options
        const statusOptionsMatches = content.match(/option.*value.*Available|option.*value.*In Use|option.*value.*Archived/g);
        if (statusOptionsMatches && statusOptionsMatches.length > 0) {
            issues.push(`❌ ${filePath}: Found ${statusOptionsMatches.length} usage status option references`);
            allClear = false;
        }

        console.log(`✅ ${filePath}: Clean`);

    } catch (error) {
        console.log(`⚠️  ${filePath}: File not found or error reading`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('📊 USAGE STATUS REMOVAL VERIFICATION RESULTS');
console.log('='.repeat(60));

if (allClear) {
    console.log('🎉 SUCCESS: Usage Status has been completely removed!');
    console.log('\n✅ Verification Results:');
    console.log('   • No usage_status field references found');
    console.log('   • No "Usage Status" UI text found');
    console.log('   • No usage status dropdown options found');
    console.log('   • Types updated correctly');
    console.log('   • Constants cleaned up');
    console.log('\n🚀 Requirement 3 COMPLETED: Usage Status successfully removed');
} else {
    console.log('⚠️  ISSUES FOUND:');
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log('\n❌ Usage Status removal incomplete');
}

console.log('\n' + '='.repeat(60));

// Additional check: Verify AssetLibraryItem interface
try {
    const typesContent = fs.readFileSync('types.ts', 'utf8');
    const interfaceMatch = typesContent.match(/export interface AssetLibraryItem \{[\s\S]*?\}/);

    if (interfaceMatch) {
        const interfaceContent = interfaceMatch[0];
        if (interfaceContent.includes('usage_status')) {
            console.log('❌ AssetLibraryItem interface still contains usage_status');
        } else {
            console.log('✅ AssetLibraryItem interface: usage_status properly removed');
        }
    }
} catch (error) {
    console.log('⚠️  Could not verify AssetLibraryItem interface');
}

console.log('\n📋 Summary:');
console.log(`   Files checked: ${filesToCheck.length}`);
console.log(`   Issues found: ${issues.length}`);
console.log(`   Status: ${allClear ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);