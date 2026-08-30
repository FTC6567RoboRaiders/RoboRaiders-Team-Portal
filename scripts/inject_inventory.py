import os
import re

with open('src/App.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Fix handlers in App.tsx
old_handler = """  const handleSaveInventoryItem = async (item: InventoryItem): Promise<boolean> => {
    const existingIndex = inventoryItems.findIndex(i => i.id === item.id);
    let updated: InventoryItem[];
    if (existingIndex >= 0) {
      updated = [...inventoryItems];
      updated[existingIndex] = item;
    } else {
      updated = [item, ...inventoryItems];
    }
    setInventoryItems(updated);
    try {
      await setDoc(doc(db, 'inventoryItems', item.id), item);
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, );
      return false;
    }
  };

  const handleDeleteInventoryItem = async (id: string): Promise<boolean> => {
    const updated = inventoryItems.filter(i => i.id !== id);
    setInventoryItems(updated);
    try {
      await deleteDoc(doc(db, 'inventoryItems', id));
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, );
      return false;
    }
  };

  const handleAddInventoryTransaction = async (tx: Omit<InventoryTransaction, 'id' | 'timestamp'>): Promise<boolean> => {
    const newTx: InventoryTransaction = {
      ...tx,
      id: ,
      timestamp: Date.now()
    };
    const updated = [newTx, ...inventoryTransactions];
    setInventoryTransactions(updated);
    try {
      await setDoc(doc(db, 'inventoryTransactions', newTx.id), newTx);
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, );
      return false;
    }
  };"""

correct_handler = """  const handleSaveInventoryItem = async (item: InventoryItem): Promise<boolean> => {
    const existingIndex = inventoryItems.findIndex(i => i.id === item.id);
    let updated: InventoryItem[];
    if (existingIndex >= 0) {
      updated = [...inventoryItems];
      updated[existingIndex] = item;
    } else {
      updated = [item, ...inventoryItems];
    }
    setInventoryItems(updated);
    try {
      await setDoc(doc(db, 'inventoryItems', item.id), item);
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `inventoryItems/${item.id}`);
      return false;
    }
  };

  const handleDeleteInventoryItem = async (id: string): Promise<boolean> => {
    const updated = inventoryItems.filter(i => i.id !== id);
    setInventoryItems(updated);
    try {
      await deleteDoc(doc(db, 'inventoryItems', id));
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `inventoryItems/${id}`);
      return false;
    }
  };

  const handleAddInventoryTransaction = async (tx: Omit<InventoryTransaction, 'id' | 'timestamp'>): Promise<boolean> => {
    const newTx: InventoryTransaction = {
      ...tx,
      id: 'inv_tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now()
    };
    const updated = [newTx, ...inventoryTransactions];
    setInventoryTransactions(updated);
    try {
      await setDoc(doc(db, 'inventoryTransactions', newTx.id), newTx);
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `inventoryTransactions/${newTx.id}`);
      return false;
    }
  };"""

# Fix in content
if old_handler in content:
    content = content.replace(old_handler, correct_handler)
else:
    # Use regex replacement for handlers
    pattern = r"const handleSaveInventoryItem = async \(item: InventoryItem\): Promise<boolean> => \{.+?handleFirestoreError\(e, OperationType\.WRITE, \);\s+return false;\s+\};\s+\};"
    content = re.sub(pattern, correct_handler, content, flags=re.DOTALL)

# Fix listener paths if corrupted
content = content.replace(
    "handleFirestoreError(err, OperationType.WRITE, );",
    "handleFirestoreError(err, OperationType.WRITE, `inventoryItems/${item.id}`);"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished fixing handler templates in App.tsx")
