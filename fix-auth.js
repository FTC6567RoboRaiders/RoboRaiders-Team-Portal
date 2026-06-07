import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

const handleRegRegex = /const handleRegister = async \(e: React\.FormEvent\) => \{[\s\S]*?(?=const handleStartEditProfile =)/;

const newHandleReg = `const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim()) {
      showToast('Full name is required.', 'danger');
      return;
    }
    if (!registerEmail.trim()) {
      showToast('School email is required.', 'danger');
      return;
    }
    if (!registerSchoolId.trim()) {
      showToast('School ID is required.', 'danger');
      return;
    }

    const emailToFind = registerEmail.trim().toLowerCase();
    const password = registerSchoolId.trim() + "_ftc_auth";

    try {
      // 1. Create the Auth user. This signs them in, allowing Firestore reads/writes based on their UID.
      const userCredential = await createUserWithEmailAndPassword(auth, emailToFind, password);
      const uid = userCredential.user.uid;

      // 2. NOW check if they are claiming a premade account
      const q = query(collection(db, 'users'), where('schoolEmail', '==', emailToFind));
      const qSnap = await getDocs(q);

      if (!qSnap.empty) {
        // PREMADE ACCOUNT FOUND! Adopt it!
        const premade = qSnap.docs[0].data() as any;
        
        // If the premade account was already "Approved" by an admin, that's fine. 
        // But note: Firestore rule validates creation. To bypass issues, we can just retain its Approval status,
        // BUT wait, if we create it with "Approved" and they aren't on the list, it will fail.
        // So we might need to set it to 'Pending' if they aren't on the list, or the rule needs to be fixed.
        // Actually, if we just set it up, the rule says:
        // allow create: if ... request.resource.data.status == 'Pending' OR (request.resource.data.status == 'Approved' && email in [...])
        
        const isHardcodedAdmin = emailToFind === 'ftc6567@gmail.com' || emailToFind === 'mentor@school.edu' || emailToFind === 'admin@school.edu' || emailToFind === 'schen@school.edu' || emailToFind === 'arivera@school.edu';
        
        const newAcc = { 
            ...premade, 
            id: uid, 
            schoolId: registerSchoolId.trim(),
            status: isHardcodedAdmin ? 'Approved' : 'Pending'
        };
        
        await setDoc(doc(db, 'users', uid), newAcc);
        if (premade.id !== uid) {
          await deleteDoc(doc(db, 'users', premade.id));
        }
        
        // Clear registration controls and prefill login credentials
        setLoginEmail(registerEmail.trim());
        setLoginSchoolId('');
        
        setRegisterName('');
        setRegisterEmail('');
        setRegisterSchoolId('');
        setRegisterPrimary('Design/Build/Fabrication');
        setRegisterSecondary('None');
        setRegisterRole('member');
        setRegisterLeadership('None');

        setAuthMode('login');
        showToast('Account adopted successfully! You are now pending approval (or approved). Please log in.', 'success');
        return;
      }

      const isHardcodedAdmin = emailToFind === 'ftc6567@gmail.com' || emailToFind === 'mentor@school.edu' || emailToFind === 'admin@school.edu' || emailToFind === 'schen@school.edu' || emailToFind === 'arivera@school.edu';
      const initialStatus = isHardcodedAdmin ? 'Approved' : 'Pending';
      const initialRole = isHardcodedAdmin ? 'mentor' : registerRole;

      const newAcc: any = {
        id: uid,
        name: registerName.trim(),
        schoolEmail: registerEmail.trim(),
        schoolId: registerSchoolId.trim(),
        primarySubteam: registerPrimary,
        secondarySubteam: registerSecondary,
        role: initialRole,
        status: initialStatus,
        createdAt: Date.now(),
        leadership: registerLeadership
      };

      await setDoc(doc(db, 'users', uid), newAcc);
      
      // Send email to team mentor/captains
      const mentorsAndCaptains = accounts.filter(a => a.role === 'mentor' || a.role === 'captain');
      mentorsAndCaptains.forEach(mc => {
        sendEmailNotification(
          mc.schoolEmail,
          \`[FTC #6567] New Access Request: \${newAcc.name}\`,
          \`Hello \${mc.name},

A new user has requested database access to the FTC #6567 Workspace:
• Name: \${newAcc.name}
• Email: \${newAcc.schoolEmail}
• Requested Role: \${newAcc.role === 'mentor' ? 'Coach / Mentor' : newAcc.role === 'captain' ? 'Subteam Lead / Captain' :  'Team Member'}
• Leadership Value: \${newAcc.leadership || 'None'}
• Primary Subteam: \${newAcc.primarySubteam}
• Secondary Subteam: \${newAcc.secondarySubteam !== 'None' ? newAcc.secondarySubteam : 'None'}

Please visit the "Roster & Approvals" security panel inside the portal to review this registration.
Thanks!\`
        );
      });

      // Clear registration controls and prefill login credentials
      setLoginEmail(registerEmail.trim());
      setLoginSchoolId('');
      
      setRegisterName('');
      setRegisterEmail('');
      setRegisterSchoolId('');
      setRegisterPrimary('Design/Build/Fabrication');
      setRegisterSecondary('None');
      setRegisterRole('member');
      setRegisterLeadership('None');

      setAuthMode('login');
      if (initialStatus === 'Approved') {
        showToast('Success! Developer/Mentor account registered and approved automatically!', 'success');
      } else {
        showToast('Success! Your request is in the queue to be approved by a mentor/captain.', 'success');
      }
    } catch (e: any) {
      showToast(\`Registration failed: \${e.message}\`, 'danger');
    }
  };
`;

app = app.replace(handleRegRegex, newHandleReg);

const handleLoginRegex = /const handleLogin = async \(e: React\.FormEvent\) => \{[\s\S]*?(?=\n  const handleRegister = async)/;

const newHandleLogin = `const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginSchoolId.trim()) {
      showToast('Please enter both school email and school ID/password.', 'danger');
      return;
    }
    const emailToFind = loginEmail.trim().toLowerCase();
    const typedCredential = loginSchoolId.trim();
    // Default fallback to old logic if no Auth record
    const defaultPassword = typedCredential + "_ftc_auth";

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, emailToFind, typedCredential);
      } catch (authErr1: any) {
        try {
           userCredential = await signInWithEmailAndPassword(auth, emailToFind, defaultPassword);
        } catch (authErr2: any) {
           showToast('Incorrect credentials. Please verify your School ID, or Register if you are new.', 'danger');
           return;
        }
      }

      const userUid = userCredential.user.uid;
      const docRef = doc(db, 'users', userUid);
      let docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
          showToast('Account profile not found. Please ask admin for help.', 'danger');
          return;
      }

      const found = docSnap.data() as any;

      // Auto-correct role for admins!
      const isUserAdminTest = emailToFind === 'ftc6567@gmail.com' || emailToFind === 'mentor@school.edu' || emailToFind === 'admin@school.edu' || emailToFind === 'schen@school.edu' || emailToFind === 'arivera@school.edu';
      if (isUserAdminTest && found.role !== 'mentor') {
          found.role = 'mentor';
          found.status = 'Approved';
          await setDoc(docRef, found);
      }

      setCurrentUser(found);
      localStorage.setItem('ftc_current_user', JSON.stringify(found));
      if (found.status === 'Approved') {
          showToast(\`Welcome back, \${found.name}!\`, 'success');
        } else if (found.status === 'Rejected') {
          showToast('Account Access Request was rejected by Mentors.', 'danger');
        } else {
          showToast('Access pending administrator approval.', 'info');
        }
    } catch (e: any) {
      showToast(\`Login failed: \${e.message}\`, 'danger');
    }
  };`;

app = app.replace(handleLoginRegex, newHandleLogin);

fs.writeFileSync('src/App.tsx', app);
console.log("Replaced handleRegister and handleLogin with fixed auth logic.");
