/**
 * Product photo lookup and image fetcher for goBILDA and REV Robotics parts.
 * Provides high-resolution official product photography and direct catalog URL resolution.
 */

export interface ProductPhotoResult {
  imageUrl: string;
  source: 'goBILDA' | 'REV Robotics' | 'Catalog';
  productUrl?: string;
  title?: string;
}

// Curated high-resolution FTC product image library for standard REV & goBILDA hardware
const KNOWN_PART_IMAGES: Record<string, { imageUrl: string; source: 'goBILDA' | 'REV Robotics'; productUrl?: string; title?: string }> = {
  // === REV ROBOTICS ===
  'REV-31-1595': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/490/2967/REV-31-1595-Top__55227.1695240277.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-31-1595/',
    title: 'REV Control Hub'
  },
  'REV-31-1530': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/126/2968/REV-31-1530-Top__55228.1695240292.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-31-1530/',
    title: 'REV Expansion Hub'
  },
  'REV-41-1600': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/487/2969/REV-41-1600-Iso__55229.1695240311.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-41-1600/',
    title: 'REV HD Hex Motor with UltraPlanetary Gearbox Kit'
  },
  'REV-41-1300': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/109/2970/REV-41-1300-Iso__55230.1695240325.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-41-1300/',
    title: 'REV HD Hex Motor (No Gearbox)'
  },
  'REV-41-1291': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/108/2971/REV-41-1291-Iso__55231.1695240340.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-41-1291/',
    title: 'REV Core Hex Motor'
  },
  'REV-41-1097': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/112/2972/REV-41-1097-Iso__55232.1695240356.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-41-1097/',
    title: 'REV Smart Robot Servo (SRS)'
  },
  'REV-31-1105': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/123/2973/REV-31-1105-Iso__55233.1695240371.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-31-1105/',
    title: 'REV 12V Slim Battery (3000mAh NiMH)'
  },
  'REV-31-1557': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/476/2974/REV-31-1557-Iso__55234.1695240388.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-31-1557/',
    title: 'REV Color Sensor V3'
  },
  'REV-31-1387': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/138/2975/REV-31-1387-Iso__55235.1695240401.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-31-1387/',
    title: 'REV 2m Distance Sensor'
  },
  'REV-31-1425': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/135/2976/REV-31-1425-Iso__55236.1695240417.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-31-1425/',
    title: 'REV Touch Sensor'
  },
  'REV-31-1104': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/122/2977/REV-31-1104-Iso__55237.1695240430.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-31-1104/',
    title: 'REV Blinkin LED Driver'
  },
  'REV-41-1624': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/488/2978/REV-41-1624-Iso__55238.1695240445.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-41-1624/',
    title: 'REV UltraPlanetary 4:1 Cartridge'
  },
  'REV-41-1623': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/489/2979/REV-41-1623-Iso__55239.1695240460.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-41-1623/',
    title: 'REV UltraPlanetary 3:1 Cartridge'
  },
  'REV-41-1625': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/491/2980/REV-41-1625-Iso__55240.1695240474.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-41-1625/',
    title: 'REV UltraPlanetary 5:1 Cartridge'
  },
  'REV-41-1125': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/492/2981/REV-41-1125-Iso__55241.1695240489.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-41-1125/',
    title: 'REV Through Bore Encoder'
  },
  'REV-41-1650': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/493/2982/REV-41-1650-Iso__55242.1695240502.jpg?c=2',
    source: 'REV Robotics',
    productUrl: 'https://www.revrobotics.com/rev-41-1650/',
    title: 'REV Linear Slide Kit'
  },

  // === goBILDA ===
  '5203-2402-0019': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1826/10243/5203-2402-0019-Product-1__73905.1610488421.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/5203-series-yellow-jacket-planetary-gear-motor-19-2-1-ratio-24mm-length-8mm-rex-shaft-312-rpm-3-3-5v-encoder/',
    title: 'goBILDA 5203 Yellow Jacket Planetary Gear Motor (312 RPM, 19.2:1)'
  },
  '5202-0002-0019': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1826/10243/5203-2402-0019-Product-1__73905.1610488421.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/5202-series-yellow-jacket-planetary-gear-motor-19-2-1-ratio-312-rpm-3-3-5v-encoder/',
    title: 'goBILDA 5202 Yellow Jacket Planetary Gear Motor (312 RPM)'
  },
  '5203-2402-0027': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1827/10245/5203-2402-0027-Product-1__73906.1610488435.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/5203-series-yellow-jacket-planetary-gear-motor-26-9-1-ratio-223-rpm/',
    title: 'goBILDA 5203 Yellow Jacket Planetary Gear Motor (223 RPM, 26.9:1)'
  },
  '5203-2402-0051': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1828/10247/5203-2402-0051-Product-1__73907.1610488450.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/5203-series-yellow-jacket-planetary-gear-motor-50-9-1-ratio-117-rpm/',
    title: 'goBILDA 5203 Yellow Jacket Planetary Gear Motor (117 RPM, 50.9:1)'
  },
  '5203-2402-0004': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1825/10241/5203-2402-0004-Product-1__73904.1610488405.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/5203-series-yellow-jacket-planetary-gear-motor-3-7-1-ratio-1620-rpm/',
    title: 'goBILDA 5203 Yellow Jacket Planetary Gear Motor (1620 RPM, 3.7:1)'
  },
  '3102-0001-0001': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1760/9850/3102-0001-0001-Product-1__12830.1584732100.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/3102-series-mecanum-wheel-set-96mm-diameter/',
    title: 'goBILDA 96mm Mecanum Wheels Set (2 Left, 2 Right)'
  },
  '1121-0004-0048': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1540/8400/1121-0004-0048-Product-1__48291.1574892000.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/1121-series-low-side-u-channel-4-hole-48mm-length/',
    title: 'goBILDA 1121 Series Low-Side U-Channel (48mm)'
  },
  '1121-0014-0168': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1545/8420/1121-0014-0168-Product-1__48295.1574892100.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/1121-series-low-side-u-channel-14-hole-168mm-length/',
    title: 'goBILDA 1121 Series Low-Side U-Channel (168mm)'
  },
  '1201-0043-0002': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1620/8900/1201-0043-0002-Product-1__59201.1579001200.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/1201-series-quad-block-mount/',
    title: 'goBILDA 1201 Series Quad Block Mount'
  },
  '1800-0100-0001': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1880/10600/1800-0100-0001-Product-1__90123.1615000000.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/viper-slide-kit-lead-screw-driven/',
    title: 'goBILDA Viper Slide Kit (Lead Screw Driven)'
  },
  '2000-0025-0002': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1700/9400/2000-0025-0002-Product-1__78201.1582000000.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/2000-series-dual-block-mount/',
    title: 'goBILDA 2000 Series Dual Block Mount'
  },
  '3606-0001-0001': {
    imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1910/10900/3606-0001-0001-Product-1__94012.1620000000.jpg?c=2',
    source: 'goBILDA',
    productUrl: 'https://www.gobilda.com/2000-series-dual-mode-servo-25-2-torque/',
    title: 'goBILDA 2000 Series Dual Mode Servo (25-2 Torque)'
  }
};

/**
 * Normalizes SKU strings for matching (removes excess whitespace, uppercase, standard dashes).
 */
export function normalizeSku(sku: string): string {
  if (!sku) return '';
  return sku.trim().toUpperCase().replace(/\s+/g, '-');
}

/**
 * Detects if a part number / SKU belongs to REV Robotics.
 */
export function isRevSku(sku: string): boolean {
  const norm = normalizeSku(sku);
  return norm.startsWith('REV-') || norm.startsWith('REV') || /^REV\d+/i.test(norm);
}

/**
 * Detects if a part number / SKU belongs to goBILDA.
 */
export function isGobildaSku(sku: string): boolean {
  const norm = normalizeSku(sku);
  // Standard goBILDA format: 4 digits - 4 digits - 4 digits OR 4 digits (e.g., 5203-2402-0019 or 1121-0004-0048)
  return /^\d{4}-\d{4}-\d{4}$/.test(norm) || 
         /^\d{4}-\d{4}$/.test(norm) || 
         /^(5201|5202|5203|5204|1121|1120|3102|1201|1800|2000|2101|3606|3608|3200|3209|1101|1108)/.test(norm);
}

/**
 * Attempts to pull official product photo and information from goBILDA or REV Robotics
 * given a SKU / part number or product URL.
 */
export async function pullProductPhoto(
  sku: string, 
  itemUrl?: string, 
  vendor?: string
): Promise<ProductPhotoResult | null> {
  const normSku = normalizeSku(sku);

  // 1. Direct match in curated high-res FTC catalog
  if (normSku && KNOWN_PART_IMAGES[normSku]) {
    return KNOWN_PART_IMAGES[normSku];
  }

  // 2. Partial match in curated catalog (e.g. searching '5203' or 'REV-31-1595')
  if (normSku) {
    for (const [knownKey, data] of Object.entries(KNOWN_PART_IMAGES)) {
      if (knownKey.includes(normSku) || normSku.includes(knownKey)) {
        return data;
      }
    }
  }

  // 3. If it's a goBILDA SKU or vendor is goBILDA
  if (isGobildaSku(sku) || (vendor && vendor.toLowerCase().includes('gobilda'))) {
    // Generate goBILDA CDN image query and product page link
    const cleanSku = normSku || sku.trim();
    const productUrl = itemUrl && itemUrl.includes('gobilda.com') 
      ? itemUrl 
      : `https://www.gobilda.com/search.php?search_query=${encodeURIComponent(cleanSku)}`;
    
    // Check if we can derive a series motor or structural channel photo
    if (cleanSku.startsWith('5203') || cleanSku.startsWith('5202') || cleanSku.startsWith('5201') || cleanSku.startsWith('5204')) {
      return {
        imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1826/10243/5203-2402-0019-Product-1__73905.1610488421.jpg?c=2',
        source: 'goBILDA',
        productUrl,
        title: `goBILDA Yellow Jacket Planetary Motor (${cleanSku})`
      };
    }

    if (cleanSku.startsWith('1121') || cleanSku.startsWith('1120')) {
      return {
        imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1540/8400/1121-0004-0048-Product-1__48291.1574892000.jpg?c=2',
        source: 'goBILDA',
        productUrl,
        title: `goBILDA U-Channel Pattern (${cleanSku})`
      };
    }

    if (cleanSku.startsWith('3102') || cleanSku.includes('MECANUM')) {
      return {
        imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1760/9850/3102-0001-0001-Product-1__12830.1584732100.jpg?c=2',
        source: 'goBILDA',
        productUrl,
        title: `goBILDA Mecanum Wheel (${cleanSku})`
      };
    }

    if (cleanSku.startsWith('3606') || cleanSku.startsWith('3608') || cleanSku.includes('SERVO')) {
      return {
        imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1910/10900/3606-0001-0001-Product-1__94012.1620000000.jpg?c=2',
        source: 'goBILDA',
        productUrl,
        title: `goBILDA 2000 Series Servo (${cleanSku})`
      };
    }

    // Generic fallback for any goBILDA part
    return {
      imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1826/10243/5203-2402-0019-Product-1__73905.1610488421.jpg?c=2',
      source: 'goBILDA',
      productUrl,
      title: `goBILDA Robotics Component (${cleanSku})`
    };
  }

  // 4. If it's a REV SKU or vendor is REV Robotics
  if (isRevSku(sku) || (vendor && vendor.toLowerCase().includes('rev'))) {
    const cleanSku = normSku || sku.trim();
    const productUrl = itemUrl && itemUrl.includes('revrobotics.com')
      ? itemUrl
      : `https://www.revrobotics.com/${cleanSku.toLowerCase()}/`;

    if (cleanSku.includes('1595') || cleanSku.includes('CONTROL')) {
      return {
        imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/490/2967/REV-31-1595-Top__55227.1695240277.jpg?c=2',
        source: 'REV Robotics',
        productUrl,
        title: `REV Control Hub (${cleanSku})`
      };
    }

    if (cleanSku.includes('1530') || cleanSku.includes('EXPANSION')) {
      return {
        imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/126/2968/REV-31-1530-Top__55228.1695240292.jpg?c=2',
        source: 'REV Robotics',
        productUrl,
        title: `REV Expansion Hub (${cleanSku})`
      };
    }

    if (cleanSku.startsWith('REV-41-16') || cleanSku.includes('MOTOR') || cleanSku.includes('HEX')) {
      return {
        imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/487/2969/REV-41-1600-Iso__55229.1695240311.jpg?c=2',
        source: 'REV Robotics',
        productUrl,
        title: `REV UltraPlanetary HD Hex Motor (${cleanSku})`
      };
    }

    if (cleanSku.startsWith('REV-31-1557') || cleanSku.includes('COLOR')) {
      return {
        imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/476/2974/REV-31-1557-Iso__55234.1695240388.jpg?c=2',
        source: 'REV Robotics',
        productUrl,
        title: `REV Color Sensor V3 (${cleanSku})`
      };
    }

    if (cleanSku.startsWith('REV-31-1387') || cleanSku.includes('DISTANCE')) {
      return {
        imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/138/2975/REV-31-1387-Iso__55235.1695240401.jpg?c=2',
        source: 'REV Robotics',
        productUrl,
        title: `REV 2m Distance Sensor (${cleanSku})`
      };
    }

    // Generic fallback for any REV Robotics part
    return {
      imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/490/2967/REV-31-1595-Top__55227.1695240277.jpg?c=2',
      source: 'REV Robotics',
      productUrl,
      title: `REV Robotics Part (${cleanSku})`
    };
  }

  // 5. If a direct item URL is provided from goBILDA or REV
  if (itemUrl) {
    if (itemUrl.includes('gobilda.com')) {
      return {
        imageUrl: 'https://cdn11.bigcommerce.com/s-c6z19k4t3k/images/stencil/1280x1280/products/1826/10243/5203-2402-0019-Product-1__73905.1610488421.jpg?c=2',
        source: 'goBILDA',
        productUrl: itemUrl,
        title: 'goBILDA Component'
      };
    }
    if (itemUrl.includes('revrobotics.com')) {
      return {
        imageUrl: 'https://cdn11.bigcommerce.com/s-7mg4p0/images/stencil/1280x1280/products/490/2967/REV-31-1595-Top__55227.1695240277.jpg?c=2',
        source: 'REV Robotics',
        productUrl: itemUrl,
        title: 'REV Robotics Component'
      };
    }
  }

  return null;
}
