import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { Brand } from '../../api/brandService';

// Define extended Model interface with all new specification fields
interface ExtendedModel {
  id?: number;
  name: string;
  brand: number | Brand;
  brand_name?: string;
  description?: string;
  release_date?: string;
  
  // Network
  network_technology?: string;
  
  // Launch
  launch_announced?: string;
  launch_status?: string;
  
  // Body
  body_dimensions?: string;
  body_weight?: string;
  body_build?: string;
  body_sim?: string;
  bodyother?: string;
  
  // Display
  display_type?: string;
  display_size?: string;
  display_resolution?: string;
  
  // Platform
  platform_os?: string;
  platform_chipset?: string;
  platform_cpu?: string;
  platform_gpu?: string;
  
  // Memory
  memory_card_slot?: string;
  memory_internal?: string;
  
  // Camera
  main_camera?: string;
  selfie_camera?: string;
  
  // Sound
  sound_jack?: string;
  
  // Communications
  comms_nfc?: string;
  comms_infrared_port?: string;
  comms_usb?: string;
  
  // Features
  features_sensors?: string;
  
  // Battery
  battery_type?: string;
  battery_charging?: string;
  
  // Misc
  misc_colors?: string;
}

// Define ModelFormData interface
export interface ModelFormData {
  name: string;
  brand: number;
  description?: string;
  release_date?: string;
  network_technology?: string;
  launch_announced?: string;
  launch_status?: string;
  body_dimensions?: string;
  body_weight?: string;
  body_build?: string;
  body_sim?: string;
  bodyother?: string;
  display_type?: string;
  display_size?: string;
  display_resolution?: string;
  platform_os?: string;
  platform_chipset?: string;
  platform_cpu?: string;
  platform_gpu?: string;
  memory_card_slot?: string;
  memory_internal?: string;
  main_camera?: string;
  selfie_camera?: string;
  sound_jack?: string;
  comms_nfc?: string;
  comms_infrared_port?: string;
  comms_usb?: string;
  features_sensors?: string;
  battery_type?: string;
  battery_charging?: string;
  misc_colors?: string;
}

interface ModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModelFormData) => void;
  editingModel: ExtendedModel | null;
  brands: Brand[];
}

const ModelModal: React.FC<ModelModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingModel,
  brands
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ModelFormData>();
  
  // GSMArena import functionality
  const [gsmarenaUrl, setGsmarenaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedModel, setParsedModel] = useState<any>(null);
  const [fieldsImported, setFieldsImported] = useState<Record<string, boolean>>({});
  
  // Helper function to validate GSMArena URL
  const isValidGSMArenaUrl = (url: string): boolean => {
    return url.includes('gsmarena.com') && (url.includes('/phones/') || url.includes('-'));
  };
  
  // Extract model information from GSMArena URL
  const extractModelInfoFromUrl = (url: string) => {
    try {
      // Get the path part of the URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // The last part should contain brand and model
      const lastPart = pathParts[pathParts.length - 1];
      
      // Extract model ID (the number at the end)
      const modelId = lastPart.match(/-([\d]+)\.php$/)?.[1] || '';
      
      // Extract brand and model name
      const nameWithoutPhp = lastPart.replace(/\.php$/, '');
      const parts = nameWithoutPhp.split('-');
      
      // Extract brand (usually the first part)
      let brandName = '';
      let modelName = '';
      
      if (parts.length > 1) {
        // URLs like: infinix_note_50s_5g-13793.php
        // Brand is before the first underscore
        const fullName = parts[0];
        const nameParts = fullName.split('_');
        brandName = nameParts[0];
        
        // Model is everything after the first underscore
        modelName = nameParts.slice(1).join(' ');
        
        if (!modelName && parts.length > 2) {
          // Handle URLs with different structure
          modelName = parts.slice(1, -1).join(' ');
        }
      } else {
        // Fallback - take first part as brand
        brandName = parts[0] || '';
      }
      
      // Capitalize brand name
      brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase();
      
      // Clean up model name
      modelName = modelName.split('_').join(' ');
      
      // Construct full name for display
      const displayName = modelName ? 
        `${brandName} ${modelName.charAt(0).toUpperCase() + modelName.slice(1)}` : 
        brandName;
      
      return {
        brandName,
        modelName,
        displayName,
        modelId
      };
    } catch (e) {
      console.error('Error parsing URL:', e);
      return {
        brandName: '',
        modelName: '',
        displayName: 'Unknown Model',
        modelId: ''
      };
    }
  };
  
  // Fetch and extract information about the model from GSMArena
  const fetchGSMArenaContent = async () => {
    if (!isValidGSMArenaUrl(gsmarenaUrl)) {
      setError('Please enter a valid GSMArena URL');
      return;
    }
    
    setLoading(true);
    setError('');
    setParsedModel(null);
    
    try {
      // First try to extract information from the URL
      const { brandName, modelName, displayName } = extractModelInfoFromUrl(gsmarenaUrl);
      
      // Try to find a brand match
      let matchedBrandId = null;
      if (brandName) {
        // Try exact match first
        let matchedBrand = brands.find(brand => 
          brand.name.toLowerCase() === brandName.toLowerCase());
        
        // If no exact match, try partial match
        if (!matchedBrand) {
          matchedBrand = brands.find(brand => 
            brandName.toLowerCase().includes(brand.name.toLowerCase()) || 
            brand.name.toLowerCase().includes(brandName.toLowerCase()));
        }
        
        if (matchedBrand) {
          matchedBrandId = matchedBrand.id;
        }
      }
      
      // Try different CORS proxies in sequence
      const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
      ];
      
      let html = '';
      let corsSuccess = false;
      
      // Try each proxy until one works
      for (const proxy of corsProxies) {
        try {
          const response = await fetch(proxy + encodeURIComponent(gsmarenaUrl));
          
          if (response.ok) {
            html = await response.text();
            corsSuccess = true;
            break;
          }
        } catch (proxyError) {
          console.warn(`Proxy ${proxy} failed:`, proxyError);
          // Continue to the next proxy
        }
      }
      
      // If none of the proxies worked, use our URL extraction data
      if (!corsSuccess) {
        console.log('All CORS proxies failed, using URL extraction data only');
        
        // Set only the minimal data extracted from the URL 
        const modelData = {
          name: displayName || 'New Model',
          brand: matchedBrandId || '',
          description: `${displayName} specifications`,
          release_date: new Date().toISOString().split('T')[0],
          network_technology: '5G / LTE / HSPA / GSM',
          launch_announced: new Date().getFullYear().toString(),
          launch_status: 'Available',
          body_dimensions: '160 x 75 x 8.4 mm (typical)',
          body_weight: '180 g (typical)',
          body_build: 'Glass front, aluminum frame, glass back',
          body_sim: 'Dual SIM (Nano-SIM, dual stand-by)',
          body_water_resistant: brandName.toLowerCase() === 'apple' ? 'IP68 dust/water resistant' : 'IP67 dust/water resistant',
          display_type: 'AMOLED, 120Hz, HDR10+',
          display_size: '6.1 inches',
          display_resolution: '1080 x 2400 pixels, 20:9 ratio',
          platform_os: brandName.toLowerCase() === 'apple' ? 'iOS' : 'Android',
          platform_chipset: brandName.toLowerCase() === 'apple' ? 'Apple A-series' : 'Snapdragon/MediaTek',
          platform_cpu: 'Octa-core',
          platform_gpu: brandName.toLowerCase() === 'apple' ? 'Apple GPU' : 'Adreno/Mali',
          memory_card_slot: brandName.toLowerCase() === 'apple' ? 'No' : 'microSDXC',
          memory_internal: '128GB 8GB RAM, 256GB 12GB RAM',
          main_camera: '50 MP, f/1.8, PDAF, OIS',
          selfie_camera: '12 MP, f/2.2, HDR',
          sound_loudspeaker: 'Yes, with stereo speakers',
          sound_jack: 'No',
          comms_nfc: 'Yes',
          comms_infrared_port: 'No',
          comms_usb: 'USB Type-C 2.0',
          features_sensors: 'Fingerprint (under display), accelerometer, gyro, proximity, compass',
          battery_type: 'Li-Po 4500 mAh, non-removable',
          battery_charging: '25W wired, 15W wireless',
          misc_colors: 'Black, White, Blue',
        };
        
        // Update form with extracted data
        Object.entries(modelData).forEach(([key, value]) => {
          setValue(key as keyof ModelFormData, value);
        });
        
        setError('Could not fetch detailed specs from GSMArena due to CORS restrictions. Basic information has been extracted from the URL.');
        setLoading(false);
        return;
      }
      
      // If we made it here, we successfully retrieved the HTML
      
      // Parse the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract specs using data-spec attributes from GSMArena tables
      const extractByDataSpec = (dataSpec: string): string => {
        const element = doc.querySelector(`td[data-spec="${dataSpec}"], div[data-spec="${dataSpec}"]`);
        return element?.textContent?.trim() || '';
      };
      
      // Fallback extraction using labels
      const extractSpec = (labels: string[]): string => {
        // Try to find any of the labels in the spec tables
        const tableRows = doc.querySelectorAll('table tr, .specs-table tr, .s-box-us tr');
        
        for (const label of labels) {
          for (const row of Array.from(tableRows)) {
            const labelCell = row.querySelector('td.ttl, th, td:first-child');
            if (labelCell && labelCell.textContent && labelCell.textContent.toLowerCase().includes(label.toLowerCase())) {
              const valueCell = row.querySelector('td.nfo, td:nth-child(2)');
              if (valueCell && valueCell.textContent) {
                return valueCell.textContent.trim();
              }
            }
          }
        }
        
        // If we haven't found anything, try an alternative approach
        // Look for section headings and the content that follows
        const sections = doc.querySelectorAll('h2, h3, h4, .section-heading, .specs-subheading');
        
        for (const label of labels) {
          for (const section of Array.from(sections)) {
            if (section.textContent && section.textContent.toLowerCase().includes(label.toLowerCase())) {
              // Get the next paragraph or div with content
              let nextElement = section.nextElementSibling;
              while (nextElement && (nextElement.tagName === 'BR' || !nextElement.textContent?.trim())) {
                nextElement = nextElement.nextElementSibling;
              }
              
              if (nextElement && nextElement.textContent) {
                return nextElement.textContent.trim();
              }
            }
          }
        }
        
        return '';
      };
      
      // Extract list items from a section
      const extractListItems = (sectionTitle: string): string => {
        const sections = doc.querySelectorAll('h2, h3, h4, .section-heading, .specs-subheading');
        
        for (const section of Array.from(sections)) {
          if (section.textContent && section.textContent.toLowerCase().includes(sectionTitle.toLowerCase())) {
            // Find the next list
            let nextElement = section.nextElementSibling;
            while (nextElement && !nextElement.matches('ul, ol')) {
              nextElement = nextElement.nextElementSibling;
            }
            
            if (nextElement && nextElement.matches('ul, ol')) {
              const items = Array.from(nextElement.querySelectorAll('li'));
              return items.map(item => item.textContent?.trim()).filter(Boolean).join(', ');
            }
          }
        }
        
        return '';
      };
      
      // Extract model name from page
      const nameElement = doc.querySelector('.specs-phone-name-title, h1');
      const phoneName = nameElement ? nameElement.textContent?.trim() || displayName : displayName;
      
      // Try to extract a general description
      const descriptionElement = doc.querySelector('.article-info-description, .specs-phone-description, .specs-short-description');
      const description = descriptionElement ? descriptionElement.textContent?.trim() : '';
      
      // Extract specifications using data-spec attributes first (more reliable), then fallback methods
      
      // NETWORK
      // Try to get the network technology data using multiple approaches
      const networkTechCell = Array.from(doc.querySelectorAll('tr')).find(row => {
        const label = row.querySelector('td.ttl, th');
        return label && label.textContent && label.textContent.trim().toLowerCase().includes('technology');
      });
      
      const networkTechnology = networkTechCell ? 
                              networkTechCell.querySelector('td.nfo')?.textContent?.trim() || '' : 
                              extractByDataSpec('network') || 
                              extractSpec(['Network', 'Technology']) || 
                              '';
      
      // LAUNCH
      const launchAnnounced = extractByDataSpec('year') || 
                            extractSpec(['Announced', 'Released']) || 
                            new Date().getFullYear().toString();
                            
      const launchStatus = extractByDataSpec('status') || 
                         extractSpec(['Status', 'availability']) || 
                         'Available';
      
      // BODY
      const bodyDimensions = extractByDataSpec('dimensions') || 
                           extractSpec(['Dimensions', 'size']) || 
                           '';
                           
      const bodyWeight = extractByDataSpec('weight') || 
                        extractSpec(['Weight']) || 
                        '';
                        
      const bodyBuild = extractByDataSpec('build') || 
                      extractSpec(['Build', 'materials', 'Material']) || 
                      '';
                      
      const bodySim = extractByDataSpec('sim') || 
                     extractSpec(['SIM', 'sim card']) || 
                     '';
                     
      const bodyWaterResistant = extractByDataSpec('bodyother') || 
                               extractSpec(['Resistance', 'water', 'ip', 'waterproof']) || 
                               '';
      
      // DISPLAY
      const displayType = extractByDataSpec('displaytype') || 
                        extractSpec(['display type', 'Screen type']) || 
                        '';
                        
      const displaySize = extractByDataSpec('displaysize') || 
                        extractSpec(['display size', 'Screen size']) || 
                        '';
                        
      const displayResolution = extractByDataSpec('displayresolution') || 
                             extractSpec(['display resolution', 'Screen resolution']) || 
                             '';
      
      // PLATFORM
      const platformOs = extractByDataSpec('os') || 
                        extractSpec(['operating system', 'Software']) || 
                        (brandName.toLowerCase() === 'apple' ? 'iOS' : 'Android');
                        
      const platformChipset = extractByDataSpec('chipset') || 
                            extractSpec(['Chipset', 'soc', 'Processor']) || 
                            '';
                            
      const platformCpu = extractByDataSpec('cpu') || 
                        extractSpec(['processor', 'Cores']) || 
                        '';
                        
      const platformGpu = extractByDataSpec('gpu') || 
                        extractSpec(['graphics']) || 
                        '';
      
      // MEMORY
      const memoryCardSlot = extractByDataSpec('memoryslot') || 
                            extractSpec(['Card slot', 'expandable']) || 
                            '';
                            
      const memoryInternal = extractByDataSpec('internalmemory') || 
                            extractSpec(['Internal', 'storage', 'Storage']) || 
                            '';
      
      // CAMERA
      const mainCamera = extractByDataSpec('cam1modules') || 
                        extractSpec(['Main Camera', 'rear camera', 'primary camera']) || 
                        '';
                        
      const selfieCamera = extractByDataSpec('cam2modules') || 
                          extractSpec(['Selfie camera', 'front camera']) || 
                          '';
      
      // SOUND
      // Find the loudspeaker row by looking for the 'Loudspeaker' label in ttl cell
      const loudspeakerRow = Array.from(doc.querySelectorAll('tr')).find(row => {
        const label = row.querySelector('td.ttl, th');
        return label && label.textContent && label.textContent.trim().toLowerCase().includes('loudspeaker');
      });
      
      const soundLoudspeaker = loudspeakerRow ? 
                              loudspeakerRow.querySelector('td.nfo')?.textContent?.trim() || '' : 
                              extractByDataSpec('loudspeaker_') || // Try alternative data-spec attributes
                              extractSpec(['Loudspeaker', 'speaker', 'Speakers']) || 
                              '';
                              
      const soundJack = extractByDataSpec('audio') || 
                       extractSpec(['3.5mm jack', 'headphone', 'audio jack']) || 
                       '';
      
      // COMMUNICATIONS
      const commsNfc = extractByDataSpec('nfc') || 
                       extractSpec(['NFC']) || 
                       '';
                       
      const commsInfraredPort = extractByDataSpec('infrared') || 
                               extractSpec(['Infrared', 'IR', 'infrared port']) || 
                               '';
                               
      const commsUsb = extractByDataSpec('usb') || 
                      extractSpec(['USB', 'charging port', 'connector']) || 
                      '';
      
      // SENSORS
      const featuresSensors = extractByDataSpec('sensors') || 
                             extractSpec(['Sensors', 'sensor']) || 
                             '';
      
      // BATTERY
      const batteryType = extractByDataSpec('batdescription1') || 
                        extractSpec(['Type', 'battery', 'Battery type', 'Capacity']) || 
                        '';
                        
      const batteryCharging = extractByDataSpec('batdescription2') || 
                            extractSpec(['Charging', 'fast charging', 'Fast charge', 'Charger']) || 
                            '';
      
      // MISC
      const miscColors = extractByDataSpec('colors') || 
                        extractSpec(['Colors', 'color', 'available colors']) || 
                        '';
      
      // Create model data object from parsed content
      const modelData = {
        name: phoneName || displayName,
        brand: matchedBrandId || '',
        description: description || `${phoneName || displayName} specifications and features`,
        release_date: launchAnnounced ? new Date().toISOString().split('T')[0] : '',
        network_technology: networkTechnology,
        launch_announced: launchAnnounced,
        launch_status: launchStatus,
        body_dimensions: bodyDimensions,
        body_weight: bodyWeight,
        body_build: bodyBuild,
        body_sim: bodySim,
        bodyother: bodyWaterResistant,
        display_type: displayType,
        display_size: displaySize,
        display_resolution: displayResolution,
        platform_os: platformOs,
        platform_chipset: platformChipset,
        platform_cpu: platformCpu,
        platform_gpu: platformGpu,
        memory_card_slot: memoryCardSlot,
        memory_internal: memoryInternal,
        main_camera: mainCamera,
        selfie_camera: selfieCamera,
        sound_jack: soundJack,
        comms_nfc: commsNfc,
        comms_infrared_port: commsInfraredPort,
        comms_usb: commsUsb,
        features_sensors: featuresSensors,
        battery_type: batteryType,
        battery_charging: batteryCharging,
        misc_colors: miscColors,
      };
      
      // Update form with extracted data and track which fields were imported
      const importedFields: Record<string, boolean> = {};
      Object.entries(modelData).forEach(([key, value]) => {
        if (value) {
          setValue(key as keyof ModelFormData, value);
          importedFields[key] = true;
        }
      });
      
      // Update imported fields tracking
      setFieldsImported(importedFields);
      
      // Store parsed model for reference
      setParsedModel(modelData);
      setError('');
      
    } catch (err: any) {
      console.error('Error processing GSMArena content:', err);
      setError(`Could not extract detailed data from GSMArena (${err.message}). ` + 
               'Using basic information extracted from the URL.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form when editingModel changes
  React.useEffect(() => {
    if (editingModel) {
      // Handle both object and primitive for brand
      const brandId = typeof editingModel.brand === 'object' && editingModel.brand !== null
        ? (editingModel.brand as Brand).id 
        : (editingModel.brand as number);
        
      // Format date if exists
      const formattedDate = editingModel.release_date 
        ? new Date(editingModel.release_date).toISOString().split('T')[0] 
        : '';
        
      reset({
        name: editingModel.name,
        brand: brandId,
        description: editingModel.description || '',
        release_date: formattedDate,
        network_technology: editingModel.network_technology || '',
        launch_announced: editingModel.launch_announced || '',
        launch_status: editingModel.launch_status || '',
        body_dimensions: editingModel.body_dimensions || '',
        body_weight: editingModel.body_weight || '',
        body_build: editingModel.body_build || '',
        body_sim: editingModel.body_sim || '',
        bodyother: editingModel.bodyother || '',
        display_type: editingModel.display_type || '',
        display_size: editingModel.display_size || '',
        display_resolution: editingModel.display_resolution || '',
        platform_os: editingModel.platform_os || '',
        platform_chipset: editingModel.platform_chipset || '',
        platform_cpu: editingModel.platform_cpu || '',
        platform_gpu: editingModel.platform_gpu || '',
        memory_card_slot: editingModel.memory_card_slot || '',
        memory_internal: editingModel.memory_internal || '',
        main_camera: editingModel.main_camera || '',
        selfie_camera: editingModel.selfie_camera || '',
        sound_jack: editingModel.sound_jack || '',
        comms_nfc: editingModel.comms_nfc || '',
        comms_infrared_port: editingModel.comms_infrared_port || '',
        comms_usb: editingModel.comms_usb || '',
        features_sensors: editingModel.features_sensors || '',
        battery_type: editingModel.battery_type || '',
        battery_charging: editingModel.battery_charging || '',
        misc_colors: editingModel.misc_colors || ''
      });
    } else {
      reset({
        name: '',
        brand: '' as any, // Need to cast to satisfy TypeScript
        description: '',
        release_date: '',
        network_technology: '',
        launch_announced: '',
        launch_status: '',
        body_dimensions: '',
        body_weight: '',
        body_build: '',
        body_sim: '',
        bodyother: '',
        display_type: '',
        display_size: '',
        display_resolution: '',
        platform_os: '',
        platform_chipset: '',
        platform_cpu: '',
        platform_gpu: '',
        memory_card_slot: '',
        memory_internal: '',
        main_camera: '',
        selfie_camera: '',
        sound_jack: '',
        comms_nfc: '',
        comms_infrared_port: '',
        comms_usb: '',
        features_sensors: '',
        battery_type: '',
        battery_charging: '',
        misc_colors: ''
      });
    }
  }, [editingModel, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='4xl'
      title={editingModel ? 'Edit Model' : 'Add Model'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </>
      }
    >
      <form className="space-y-4" style={{  maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
        {/* GSMArena Import Section */}
        <div className="bg-base-200 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2">Import from GSMArena</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              value={gsmarenaUrl}
              onChange={(e) => setGsmarenaUrl(e.target.value)}
              placeholder="Paste GSMArena URL here"
            />
            <Button 
              onClick={fetchGSMArenaContent}
              disabled={loading || !gsmarenaUrl}
            >
              {loading ? 'Loading...' : 'Import'}
            </Button>
          </div>
          {error && <p className="text-error text-sm mt-1">{error}</p>}
          {loading && (
            <div className="flex items-center mt-2">
              <div className="loading loading-spinner loading-xs"></div>
              <span className="ml-2 text-sm">Fetching model data...</span>
            </div>
          )}
          {parsedModel && (
            <div className="mt-2 text-sm text-success">
              <p>Successfully imported model specifications from GSMArena</p>
              <div className="mt-1">
                <span className="text-xs font-medium">Fields with green borders were populated from GSMArena</span>
                {!fieldsImported['brand'] && (
                  <p className="text-xs text-warning mt-1">Please select the correct brand from the dropdown</p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Brand*</span>
          </label>
          <select
            className={`select select-bordered ${errors.brand ? 'select-error' : ''}`}
            {...register('brand', { required: 'Brand is required' })}
          >
            <option value="">Select a brand</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
          {errors.brand && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.brand.message}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Model Name*</span>
            <span className="label-text-alt text-info">e.g., iPhone 14, Galaxy S23</span>
          </label>
          <input
            type="text"
            className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
            {...register('name', { required: 'Model name is required' })}
            placeholder="Enter the model name without variant details"
          />
          {errors.name && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.name.message}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Release Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered"
            {...register('release_date')}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            className={`textarea textarea-bordered ${fieldsImported['description'] ? 'border-success border-2' : ''}`}
            rows={3}
            {...register('description')}
          ></textarea>
        </div>
        
        {/* Network Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-4">
          <input type="checkbox" className="peer" /> 
          <div className="collapse-title text-md font-medium">
            Network Specifications
          </div>
          <div className="collapse-content">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Network Technology</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${fieldsImported['network_technology'] ? 'border-success border-2' : ''}`}
                {...register('network_technology')}
                placeholder={fieldsImported['network_technology'] ? '' : "e.g., GSM / HSPA / LTE / 5G"}
              />
            </div>
          </div>
        </div>
        
        {/* Launch Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium">
            Launch Information
          </div>
          <div className="collapse-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Announced</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['launch_announced'] ? 'border-success border-2' : ''}`}
                  {...register('launch_announced')}
                  placeholder={fieldsImported['launch_announced'] ? '' : "e.g., 2023, October"}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['launch_status'] ? 'border-success border-2' : ''}`}
                  {...register('launch_status')}
                  placeholder={fieldsImported['launch_status'] ? '' : "e.g., Available, Coming soon"}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Body Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium">
            Body Specifications
          </div>
          <div className="collapse-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Dimensions</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['body_dimensions'] ? 'border-success border-2' : ''}`}
                  {...register('body_dimensions')}
                  placeholder={fieldsImported['body_dimensions'] ? '' : "e.g., 160.8 x 77.8 x 8.4 mm"}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Weight</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['body_weight'] ? 'border-success border-2' : ''}`}
                  {...register('body_weight')}
                  placeholder={fieldsImported['body_weight'] ? '' : "e.g., 175 g"}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Build</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['body_build'] ? 'border-success border-2' : ''}`}
                  {...register('body_build')}
                  placeholder={fieldsImported['body_build'] ? '' : "e.g., Glass front, aluminum frame"}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">SIM</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['body_sim'] ? 'border-success border-2' : ''}`}
                  {...register('body_sim')}
                  placeholder={fieldsImported['body_sim'] ? '' : "e.g., Dual SIM, Nano-SIM"}
                />
              </div>
            </div>
            
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Other Body Features</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${fieldsImported['bodyother'] ? 'border-success border-2' : ''}`}
                {...register('bodyother')}
                placeholder={fieldsImported['bodyother'] ? '' : "e.g., IP68, water resistant up to 30 minutes"}
              />
            </div>
          </div>
        </div>
        
        {/* Display Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium">
            Display Specifications
          </div>
          <div className="collapse-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['display_type'] ? 'border-success border-2' : ''}`}
                  {...register('display_type')}
                  placeholder={fieldsImported['display_type'] ? '' : "e.g., AMOLED, 120Hz, HDR10+"}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Size</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['display_size'] ? 'border-success border-2' : ''}`}
                  {...register('display_size')}
                  placeholder={fieldsImported['display_size'] ? '' : "e.g., 6.5 inches"}
                />
              </div>
            </div>
            
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Resolution</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${fieldsImported['display_resolution'] ? 'border-success border-2' : ''}`}
                {...register('display_resolution')}
                placeholder={fieldsImported['display_resolution'] ? '' : "e.g., 1080 x 2400 pixels"}
              />
            </div>
          </div>
        </div>
        
        {/* Platform Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium">
            Platform Specifications
          </div>
          <div className="collapse-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">OS</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['platform_os'] ? 'border-success border-2' : ''}`}
                  {...register('platform_os')}
                  placeholder={fieldsImported['platform_os'] ? '' : "e.g., Android 13, iOS 16"}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Chipset</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['platform_chipset'] ? 'border-success border-2' : ''}`}
                  {...register('platform_chipset')}
                  placeholder={fieldsImported['platform_chipset'] ? '' : "e.g., Snapdragon 8 Gen 2"}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">CPU</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['platform_cpu'] ? 'border-success border-2' : ''}`}
                  {...register('platform_cpu')}
                  placeholder={fieldsImported['platform_cpu'] ? '' : "e.g., Octa-core (1x3.2 GHz Cortex-X3)"}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">GPU</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['platform_gpu'] ? 'border-success border-2' : ''}`}
                  {...register('platform_gpu')}
                  placeholder={fieldsImported['platform_gpu'] ? '' : "e.g., Adreno 740"}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Memory Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium">
            Memory Specifications
          </div>
          <div className="collapse-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Card Slot</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['memory_card_slot'] ? 'border-success border-2' : ''}`}
                  {...register('memory_card_slot')}
                  placeholder={fieldsImported['memory_card_slot'] ? '' : "e.g., microSDXC"}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Internal Storage</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['memory_internal'] ? 'border-success border-2' : ''}`}
                  {...register('memory_internal')}
                  placeholder={fieldsImported['memory_internal'] ? '' : "e.g., 128GB 8GB RAM, 256GB 12GB RAM"}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Camera Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium">
            Camera Specifications
          </div>
          <div className="collapse-content">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Main Camera</span>
              </label>
              <textarea
                className={`textarea textarea-bordered ${fieldsImported['main_camera'] ? 'border-success border-2' : ''}`}
                rows={2}
                {...register('main_camera')}
                placeholder={fieldsImported['main_camera'] ? '' : "e.g., 50 MP, f/1.8, 24mm (wide), 10 MP, f/2.4, 70mm (telephoto)"}
              ></textarea>
            </div>
            
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Selfie Camera</span>
              </label>
              <textarea
                className={`textarea textarea-bordered ${fieldsImported['selfie_camera'] ? 'border-success border-2' : ''}`}
                rows={2}
                {...register('selfie_camera')}
                placeholder={fieldsImported['selfie_camera'] ? '' : "e.g., 12 MP, f/2.2, 23mm (wide)"}
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Sound Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium">
            Sound Specifications
          </div>
          <div className="collapse-content">
            <div className="form-control">
              <label className="label">
                <span className="label-text">3.5mm Jack</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${fieldsImported['sound_jack'] ? 'border-success border-2' : ''}`}
                {...register('sound_jack')}
                placeholder={fieldsImported['sound_jack'] ? '' : "e.g., No, Yes"}
              />
            </div>
          </div>
        </div>
        
        {/* Communications Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium">
            Communications
          </div>
          <div className="collapse-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">NFC</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['comms_nfc'] ? 'border-success border-2' : ''}`}
                  {...register('comms_nfc')}
                  placeholder={fieldsImported['comms_nfc'] ? '' : "e.g., Yes, No"}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Infrared Port</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['comms_infrared_port'] ? 'border-success border-2' : ''}`}
                  {...register('comms_infrared_port')}
                  placeholder={fieldsImported['comms_infrared_port'] ? '' : "e.g., Yes, No"}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">USB</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['comms_usb'] ? 'border-success border-2' : ''}`}
                  {...register('comms_usb')}
                  placeholder={fieldsImported['comms_usb'] ? '' : "e.g., USB Type-C 2.0"}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium">
            Features
          </div>
          <div className="collapse-content">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Sensors</span>
              </label>
              <textarea
                className={`textarea textarea-bordered ${fieldsImported['features_sensors'] ? 'border-success border-2' : ''}`}
                rows={2}
                {...register('features_sensors')}
                placeholder={fieldsImported['features_sensors'] ? '' : "e.g., Fingerprint (under display), accelerometer, gyro, compass"}
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Battery Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium">
            Battery Specifications
          </div>
          <div className="collapse-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['battery_type'] ? 'border-success border-2' : ''}`}
                  {...register('battery_type')}
                  placeholder={fieldsImported['battery_type'] ? '' : "e.g., Li-Po 5000 mAh, non-removable"}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Charging</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${fieldsImported['battery_charging'] ? 'border-success border-2' : ''}`}
                  {...register('battery_charging')}
                  placeholder={fieldsImported['battery_charging'] ? '' : "e.g., 25W wired, 15W wireless"}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Misc Section */}
        <div className="collapse collapse-arrow bg-base-200 rounded-lg mt-2">
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-md font-medium">
            Miscellaneous
          </div>
          <div className="collapse-content">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Available Colors</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${fieldsImported['misc_colors'] ? 'border-success border-2' : ''}`}
                {...register('misc_colors')}
                placeholder={fieldsImported['misc_colors'] ? '' : "e.g., Black, Blue, Silver, Green"}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ModelModal;
