import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const handleRequestReset = async \(email: string\) => \{\n  \};/;
const newFunc = `const handleRequestReset = async (email: string) => {
    if (!email) {
      showToast('Please provide an email to reset.', 'danger');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showToast('Password reset email sent! Check your inbox.', 'success');
      setAuthMode('login');
      setResetCodeInput('');
      setResetEmail('');
    } catch (e: any) {
      showToast('Failed to send reset email: ' + e.message, 'danger');
    }
  };`;

app = app.replace(regex, newFunc);
fs.writeFileSync('src/App.tsx', app);
console.log("Restored handleRequestReset");
