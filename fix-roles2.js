import fs from 'fs';

// App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(/\|\| user\.role === 'mentor_captain'/g, '');
appContent = appContent.replace(/user\.role === 'mentor_captain' \|\|/g, '');
appContent = appContent.replace(/currentUser\?.role === 'mentor_captain' \|\|/g, '');
appContent = appContent.replace(/acc\.role === 'mentor_captain' \|\|/g, '');
appContent = appContent.replace(/inspectLeaderboardAccount\.role === 'mentor_captain' \|\|/g, '');

appContent = appContent.replace(/isUserAdmin \? 'mentor_captain' : 'member'/g, "isUserAdmin ? 'mentor' : 'member'");

appContent = appContent.replace(/useState<.*?\('member'\)/g, (match) => {
    if (match.includes("mentor_captain")) {
        return "useState<'member' | 'mentor' | 'captain'>('member')";
    }
    return match;
});

appContent = appContent.replace(/if \(isUserAdminTest && found\.role !== 'mentor_captain'\) \{/g, "if (isUserAdminTest && found.role !== 'mentor') {");
appContent = appContent.replace(/found\.role = 'mentor_captain';/g, "found.role = 'mentor';");

appContent = appContent.replace(/shouldAutoApprove \? 'mentor_captain'/g, "shouldAutoApprove ? 'mentor'");

appContent = appContent.replace(/a\.role === 'mentor_captain' \|\| /g, '');

appContent = appContent.replace(/newAcc\.role === 'mentor_captain' \? 'Mentor \/ Captain' :/g, "");

appContent = appContent.replace(/currentUser\.role === 'mentor_captain' \? 'Mentor \/ Captain' :/g, "");
appContent = appContent.replace(/currentUser\?\.role === 'mentor_captain' \? 'Mentor \/ Capt\.' :/g, "");
appContent = appContent.replace(/currentUser\?\.role === 'mentor_captain' \? 'Mentor \/ Captain' :/g, "");

appContent = appContent.replace(/acc\.role === 'mentor_captain' \? 'Mentor \/ Captain' :/g, "");

const optionRegex = /<option value="mentor_captain".*?<\/option>/g;
appContent = appContent.replace(optionRegex, "");

fs.writeFileSync('src/App.tsx', appContent);

// types.ts
let typesContent = fs.readFileSync('src/types.ts', 'utf8');
typesContent = typesContent.replace(/'member' \| 'mentor_captain' \| 'mentor' \| 'captain'/g, "'member' | 'mentor' | 'captain'");
fs.writeFileSync('src/types.ts', typesContent);

// gamification.ts
let gamiContent = fs.readFileSync('src/utils/gamification.ts', 'utf8');
gamiContent = gamiContent.replace(/user\.role === 'mentor_captain' \|\| /g, "");
fs.writeFileSync('src/utils/gamification.ts', gamiContent);

// MemberDirectory.tsx
let memberContent = fs.readFileSync('src/components/MemberDirectory.tsx', 'utf8');
memberContent = memberContent.replace(/currentUser\?\.role === 'mentor_captain' \|\| /g, "");
memberContent = memberContent.replace(/acc\.role === 'mentor_captain' \|\| /g, "");
memberContent = memberContent.replace(/\|\| acc\.role === 'mentor_captain'/g, "");
memberContent = memberContent.replace(/acc\.role === 'mentor_captain' \? 'Mentor\/Captain' : /g, "");
fs.writeFileSync('src/components/MemberDirectory.tsx', memberContent);

console.log("Done");
