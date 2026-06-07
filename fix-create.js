import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const handleCreateProfile = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsCreateProfileOpen\(false\);\n  \};/;

const newFunc = `const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim() || !newProfileEmail.trim()) {
      showToast('Name and email are required.', 'danger');
      return;
    }

    try {
      if (editingProfileId) {
        const acc = accounts.find(a => a.id === editingProfileId);
        if (!acc) return;
        const updatedAcc = {
           ...acc,
           name: newProfileName.trim(),
           schoolEmail: newProfileEmail.trim(),
           schoolId: newProfileSchoolId.trim(),
           primarySubteam: newProfilePrimary,
           secondarySubteam: newProfileSecondary,
           role: newProfileRole,
           leadership: newProfileLeadership
        } as any;
        await setDoc(doc(db, 'users', acc.id), updatedAcc);
        showToast('Profile updated successfully!', 'success');
      } else {
        const uid = Date.now().toString() + Math.random().toString().substring(2, 6);
        const newAcc = {
           id: uid,
           name: newProfileName.trim(),
           schoolEmail: newProfileEmail.trim(),
           schoolId: newProfileSchoolId.trim() || 'N/A',
           primarySubteam: newProfilePrimary,
           secondarySubteam: newProfileSecondary,
           role: newProfileRole,
           leadership: newProfileLeadership,
           status: 'Approved',
           createdAt: Date.now()
        } as any;
        await setDoc(doc(db, 'users', uid), newAcc);
        
        // Let's create an auth user if it doesn't exist? No, this is just for creating a profile doc for the roster.
        // It's up to the user to claim it via Register!
        
        showToast('Created profile for the roster! They will be able to claim it when they register.', 'success');
      }
    } catch (e: any) {
        showToast(\`Operation failed: \${e.message}\`, 'danger');
    }
    closeCreateProfileModal();
  };`;

app = app.replace(regex, newFunc);
fs.writeFileSync('src/App.tsx', app);
console.log("Restored handleCreateProfile");
