import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

const regex1 = /const handleSaveSettings = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsSettingsOpen\(false\);\n  \};/;
const newFunc1 = `const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const updated = { ...currentUser, name: settingsName, primarySubteam: settingsPrimary, secondarySubteam: settingsSecondary };
      await setDoc(doc(db, 'users', currentUser.id), updated);
      setCurrentUser(updated);
      localStorage.setItem('ftc_current_user', JSON.stringify(updated));
      showToast('Settings saved successfully.', 'success');
      setIsSettingsOpen(false);
    } catch (e: any) {
      showToast('Failed to save settings: ' + e.message, 'danger');
    }
  };`;

app = app.replace(regex1, newFunc1);

const regex2 = /const handleSetupCustomPassword = async \(e: React\.FormEvent\) => \{[\s\S]*?setShowPasswordSetupPrompt\(false\);\n  \};/;
const newFunc2 = `const handleSetupCustomPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupCustomPassword !== setupConfirmPassword) {
      showToast('Passwords do not match.', 'danger');
      return;
    }
    if (setupCustomPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'danger');
      return;
    }
    try {
       setIsSettingUpPassword(true);
       if (!auth.currentUser) throw new Error("Not logged into Auth. Please log out and log back in, then try again.");
       await updatePassword(auth.currentUser, setupCustomPassword);
       showToast('Password updated! Use this new password next time you log in.', 'success');
       setShowPasswordSetupPrompt(false);
    } catch (e: any) {
       if (e.code === 'auth/requires-recent-login') {
          showToast('For security, please log out and log back in to change your password.', 'danger');
       } else {
          showToast('Failed to update password: ' + e.message, 'danger');
       }
    } finally {
       setIsSettingUpPassword(false);
    }
  };`;

app = app.replace(regex2, newFunc2);

fs.writeFileSync('src/App.tsx', app);
console.log("Restored handleSaveSettings and handleSetupCustomPassword");
