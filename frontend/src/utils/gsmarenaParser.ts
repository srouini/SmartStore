/**
 * GSMArena Parser Utility
 * 
 * This utility helps parse phone data from GSMArena HTML content
 * to create compatible phone objects for the SmartStore database.
 */

interface GSMArenaPhone {
  name: string;
  brand: string;
  model?: string;
  releaseDate?: string;
  dimensions?: string;
  weight?: string;
  os?: string;
  chipset?: string;
  cpu?: string;
  storage?: string;
  ram?: string;
  displayType?: string;
  displaySize?: string;
  displayResolution?: string;
  mainCamera?: string;
  selfieCamera?: string;
  battery?: string;
  colors?: string[];
  imageUrl?: string;
}

interface PhoneImportData {
  name: string;
  brand_id: number;
  model_id?: number;
  cost_price: number; // This needs to be manually set
  selling_unite_price: number; // This needs to be manually set
  selling_semi_bulk_price?: number;
  selling_bulk_price?: number;
  description?: string;
  processor?: string;
  ram_gb?: number;
  storage_gb?: number;
  screen_type?: string;
  operating_system?: string;
  rear_camera_mp?: string;
  front_camera_mp?: string;
  battery_mah?: number;
  color?: string;
  condition: string;
  version: string;
  phone_type: string;
}

/**
 * Extract phone data from GSMArena HTML content
 * 
 * @param htmlContent The HTML content from GSMArena phone page
 * @returns Parsed phone data
 */
export const parseGSMArenaHTML = (htmlContent: string): GSMArenaPhone => {
  const phone: GSMArenaPhone = {
    name: '',
    brand: '',
    colors: []
  };

  // Extract name
  const nameMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
  if (nameMatch && nameMatch[1]) {
    phone.name = nameMatch[1].trim();
    // Extract brand from name (usually the first word)
    const brandMatch = phone.name.match(/^(\w+)/);
    if (brandMatch) {
      phone.brand = brandMatch[1];
    }
  }

  // Extract release date
  const releaseDateMatch = htmlContent.match(/Released\s+(\d{4},\s+\w+(?:\s+\d+)?)/i);
  if (releaseDateMatch) {
    phone.releaseDate = releaseDateMatch[1];
  }

  // Extract dimensions
  const dimensionsMatch = htmlContent.match(/Dimensions<\/td>\s*<td[^>]*>([\d.x\s]+mm)/i);
  if (dimensionsMatch) {
    phone.dimensions = dimensionsMatch[1].trim();
  }

  // Extract weight
  const weightMatch = htmlContent.match(/Weight<\/td>\s*<td[^>]*>([\d.]+\s*g)/i);
  if (weightMatch) {
    phone.weight = weightMatch[1].trim();
  }

  // Extract OS
  const osMatch = htmlContent.match(/OS<\/td>\s*<td[^>]*>([^<]+)/i);
  if (osMatch) {
    phone.os = osMatch[1].trim();
  }

  // Extract chipset
  const chipsetMatch = htmlContent.match(/Chipset<\/td>\s*<td[^>]*>([^<]+)/i);
  if (chipsetMatch) {
    phone.chipset = chipsetMatch[1].trim();
  }

  // Extract CPU
  const cpuMatch = htmlContent.match(/CPU<\/td>\s*<td[^>]*>([^<]+)/i);
  if (cpuMatch) {
    phone.cpu = cpuMatch[1].trim();
  }

  // Extract storage
  const storageMatch = htmlContent.match(/Internal<\/td>\s*<td[^>]*>([^<]+)/i);
  if (storageMatch) {
    phone.storage = storageMatch[1].trim();
  }

  // Extract RAM (from storage string)
  if (phone.storage) {
    const ramMatch = phone.storage.match(/(\d+)\s*GB\s*RAM/i);
    if (ramMatch) {
      phone.ram = ramMatch[1] + ' GB';
    }
  }

  // Extract display type
  const displayTypeMatch = htmlContent.match(/Type<\/td>\s*<td[^>]*>([^<]+)/i);
  if (displayTypeMatch) {
    phone.displayType = displayTypeMatch[1].trim();
  }

  // Extract display size
  const displaySizeMatch = htmlContent.match(/Size<\/td>\s*<td[^>]*>([^<]+inches)/i);
  if (displaySizeMatch) {
    phone.displaySize = displaySizeMatch[1].trim();
  }

  // Extract display resolution
  const displayResolutionMatch = htmlContent.match(/Resolution<\/td>\s*<td[^>]*>([^<]+pixels)/i);
  if (displayResolutionMatch) {
    phone.displayResolution = displayResolutionMatch[1].trim();
  }

  // Extract main camera
  const mainCameraMatch = htmlContent.match(/Main Camera<\/th>.*?<td[^>]*>([^<]+MP)/i);
  if (mainCameraMatch) {
    phone.mainCamera = mainCameraMatch[1].trim();
  }

  // Extract selfie camera
  const selfieCameraMatch = htmlContent.match(/Selfie camera<\/th>.*?<td[^>]*>([^<]+MP)/i);
  if (selfieCameraMatch) {
    phone.selfieCamera = selfieCameraMatch[1].trim();
  }

  // Extract battery
  const batteryMatch = htmlContent.match(/Battery<\/th>.*?<td[^>]*>([^<]+mAh)/i);
  if (batteryMatch) {
    phone.battery = batteryMatch[1].trim();
  }

  // Extract colors
  const colorsMatch = htmlContent.match(/Colors<\/td>\s*<td[^>]*>([^<]+)/i);
  if (colorsMatch) {
    const colorString = colorsMatch[1].trim();
    phone.colors = colorString.split(',').map(color => color.trim());
  }

  // Extract image URL
  const imageMatch = htmlContent.match(/<img src="([^"]+)" alt="[^"]+" class="specs-photo-main">/i);
  if (imageMatch) {
    phone.imageUrl = imageMatch[1];
  }

  return phone;
};

/**
 * Convert GSMArena phone data to SmartStore import format
 * 
 * @param gsmarenaPhone The parsed GSMArena phone data
 * @param brandId The brand ID in the SmartStore database
 * @param modelId The model ID in the SmartStore database (optional)
 * @returns Phone data in SmartStore import format
 */
export const convertToSmartStoreFormat = (
  gsmarenaPhone: GSMArenaPhone, 
  brandId: number, 
  modelId?: number,
  costPrice = 0,
  sellingPrice = 0
): PhoneImportData => {
  // Extract numeric values
  let ramGb = 0;
  if (gsmarenaPhone.ram) {
    const ramMatch = gsmarenaPhone.ram.match(/(\d+)/);
    if (ramMatch) ramGb = parseInt(ramMatch[1], 10);
  }

  let storageGb = 0;
  if (gsmarenaPhone.storage) {
    const storageMatch = gsmarenaPhone.storage.match(/(\d+)\s*GB/);
    if (storageMatch) storageGb = parseInt(storageMatch[1], 10);
  }

  let batteryMah = 0;
  if (gsmarenaPhone.battery) {
    const batteryMatch = gsmarenaPhone.battery.match(/(\d+)/);
    if (batteryMatch) batteryMah = parseInt(batteryMatch[1], 10);
  }

  // Determine screen type
  let screenType = 'lcd';
  if (gsmarenaPhone.displayType) {
    if (gsmarenaPhone.displayType.toLowerCase().includes('amoled')) {
      screenType = 'amoled';
    } else if (gsmarenaPhone.displayType.toLowerCase().includes('oled')) {
      screenType = 'oled';
    } else if (gsmarenaPhone.displayType.toLowerCase().includes('ips')) {
      screenType = 'ips_lcd';
    }
  }

  // Format camera info
  let rearCameraInfo = '';
  if (gsmarenaPhone.mainCamera) {
    rearCameraInfo = gsmarenaPhone.mainCamera;
  }

  let frontCameraInfo = '';
  if (gsmarenaPhone.selfieCamera) {
    frontCameraInfo = gsmarenaPhone.selfieCamera;
  }

  return {
    name: gsmarenaPhone.name,
    brand_id: brandId,
    model_id: modelId,
    cost_price: costPrice,
    selling_unite_price: sellingPrice,
    selling_semi_bulk_price: Math.round(sellingPrice * 0.9 * 100) / 100,
    selling_bulk_price: Math.round(sellingPrice * 0.8 * 100) / 100,
    description: `${gsmarenaPhone.name} - ${gsmarenaPhone.displaySize} ${gsmarenaPhone.displayType} display, ${gsmarenaPhone.chipset || 'powerful chipset'}, ${gsmarenaPhone.mainCamera || 'high-quality camera'}.`,
    processor: gsmarenaPhone.chipset || gsmarenaPhone.cpu,
    ram_gb: ramGb,
    storage_gb: storageGb,
    screen_type: screenType,
    operating_system: gsmarenaPhone.os,
    rear_camera_mp: rearCameraInfo,
    front_camera_mp: frontCameraInfo,
    battery_mah: batteryMah,
    color: gsmarenaPhone.colors && gsmarenaPhone.colors.length > 0 ? gsmarenaPhone.colors[0] : undefined,
    condition: 'new',
    version: 'global',
    phone_type: 'ordinary'
  };
};

/**
 * Create a FormData object from PhoneImportData for API submission
 * 
 * @param phoneData The phone data in SmartStore format
 * @param photoFile Optional photo file to include
 * @returns FormData object ready for submission
 */
export const createPhoneFormData = (phoneData: PhoneImportData, photoFile?: File): FormData => {
  const formData = new FormData();
  
  // Add all properties to FormData
  Object.entries(phoneData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  
  // Add photo if provided
  if (photoFile) {
    formData.append('photo', photoFile);
  }
  
  return formData;
};
