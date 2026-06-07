import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const handleDownloadBackup = () => handleExportJSON();`;

const injectedFunctions = `
  const showToast = (text: string, type: 'success' | 'danger' | 'info') => {
    setStatusMessage({text, type});
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const saveEntriesToLocalStorage = (updated: JournalEntry[]) => {
    setEntries(updated);
    localStorage.setItem('ftc_journal_entries', JSON.stringify(updated));
  };

  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPlanned('');
    setFormAccomplished('');
    setFormProblemsAndSolutions(['']);
    setFormPlanNextTime('');
    setFormImages([]);
    setFormAttendees([]);
    setCustomAttendee('');
    setSubmissionType('Pending Review');
  };

  const loadDemoData = () => {};

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleRequestReset = async (email: string) => {
  };

  const handleRefreshStatus = () => {
    window.location.reload();
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateProfileOpen(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingsOpen(false);
  };

  const handleSetupCustomPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingUpPassword(false);
    setShowPasswordSetupPrompt(false);
  };

  const handleRunTransition = () => {
    setIsBackupTransitionOpen(false);
  };

  const handleAddProblemField = () => {
    setFormProblemsAndSolutions([...formProblemsAndSolutions, '']);
  };

  const handleUpdateProblemField = (index: number, value: string) => {
    const updated = [...formProblemsAndSolutions];
    updated[index] = value;
    setFormProblemsAndSolutions(updated);
  };

  const handleRemoveProblemField = (index: number) => {
    const updated = [...formProblemsAndSolutions];
    updated.splice(index, 1);
    setFormProblemsAndSolutions(updated);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
        await processFile(e.dataTransfer.files[i]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    for (let i = 0; i < e.target.files.length; i++) {
        await processFile(e.target.files[i]);
    }
  };

  const processFile = async (file: File) => {
    setIsImageProcessing(true);
    try {
        const base64 = await compressAndResizeImage(file);
        setFormImages(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(),
            url: base64,
            caption: ''
        }]);
    } catch {
        showToast('Image processing failed', 'danger');
    } finally {
        setIsImageProcessing(false);
    }
  };

  const handleRemoveImage = (index: number) => {
      const updated = [...formImages];
      updated.splice(index, 1);
      setFormImages(updated);
  };
`;

app = app.replace(target, injectedFunctions + '\n' + target);
fs.writeFileSync('src/App.tsx', app);
console.log('Injected functions');
