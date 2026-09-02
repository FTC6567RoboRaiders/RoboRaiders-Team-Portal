export interface InventoryUnitOption {
  value: string;
  label: string;
  category: 'Count' | 'Packaging' | 'Length' | 'Weight' | 'Volume' | 'Other';
}

export const INVENTORY_UNITS: InventoryUnitOption[] = [
  // Count
  { value: 'pcs', label: 'pcs (Pieces)', category: 'Count' },
  { value: 'ea', label: 'ea (Each)', category: 'Count' },
  { value: 'pair', label: 'pair (Pair)', category: 'Count' },
  { value: 'set', label: 'set (Set)', category: 'Count' },
  { value: 'units', label: 'units (Units)', category: 'Count' },
  
  // Packaging & Kits
  { value: 'box', label: 'box (Box / Pack)', category: 'Packaging' },
  { value: 'bag', label: 'bag (Bag)', category: 'Packaging' },
  { value: 'kit', label: 'kit (Complete Kit)', category: 'Packaging' },
  { value: 'spool', label: 'spool (Spool)', category: 'Packaging' },
  { value: 'roll', label: 'roll (Roll)', category: 'Packaging' },
  { value: 'pack', label: 'pack (Multi-Pack)', category: 'Packaging' },

  // Length
  { value: 'ft', label: 'ft (Feet)', category: 'Length' },
  { value: 'in', label: 'in (Inches)', category: 'Length' },
  { value: 'm', label: 'm (Meters)', category: 'Length' },
  { value: 'mm', label: 'mm (Millimeters)', category: 'Length' },
  { value: 'cm', label: 'cm (Centimeters)', category: 'Length' },

  // Weight & Mass
  { value: 'lbs', label: 'lbs (Pounds)', category: 'Weight' },
  { value: 'oz', label: 'oz (Ounces)', category: 'Weight' },
  { value: 'kg', label: 'kg (Kilograms)', category: 'Weight' },
  { value: 'g', label: 'g (Grams)', category: 'Weight' },

  // Volume & Chemical
  { value: 'bottle', label: 'bottle (Bottle / Can)', category: 'Volume' },
  { value: 'can', label: 'can (Aerosol Can)', category: 'Volume' },
  { value: 'tube', label: 'tube (Grease / Threadlocker Tube)', category: 'Volume' }
];

export const DEFAULT_UNIT_VALUES: string[] = INVENTORY_UNITS.map(u => u.value);

/**
 * Returns default preset unit based on inventory category.
 */
export function getDefaultUnitForCategory(category: string): string {
  switch (category) {
    case 'Hardware & Fasteners':
    case 'Raw Materials':
      return 'box';
    case 'Raw Stock':
      return 'ft';
    case '3D Printing & Filament':
      return 'spool';
    case 'Safety & PPE':
      return 'pair';
    case 'Tools & Lab Equipment':
      return 'ea';
    case 'Field & Game Elements':
      return 'set';
    case 'REV Robotics Parts':
    case 'goBILDA & Motion':
    case 'Motors, Servos & Motion':
    case 'Electronics & Power':
    case 'Sensors & Cameras':
    case 'Wheels & Drivetrain':
    case 'Structure & Channel':
    default:
      return 'pcs';
  }
}
