import fs from 'fs';

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/currentUser\?\.role === 'mentor_captain' \|\| /g, "");
    content = content.replace(/currentUser\.role === 'mentor_captain' \|\| /g, "");
    content = content.replace(/userRole === 'mentor_captain' \|\| /g, "");
    content = content.replace(/\|\| acc\.role === 'mentor_captain' /g, "");
    fs.writeFileSync(filePath, content);
}

replaceInFile('src/components/ArenaPortal.tsx');
replaceInFile('src/components/GeneralLedger.tsx');
replaceInFile('src/data/subteamRanks.ts');
replaceInFile('src/App.tsx');

console.log("Done");
