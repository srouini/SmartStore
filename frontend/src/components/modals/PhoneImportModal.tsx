import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { parseGSMArenaHTML, convertToSmartStoreFormat, createPhoneFormData } from '../../utils/gsmarenaParser';
import { useBrands, useModels } from '../../contexts/BrandModelContext';
import axiosInstance from '../../api/axios';
import { PhoneFormData } from './PhoneModal';

interface PhoneImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: PhoneFormData) => void;
}

const PhoneImportModal: React.FC<PhoneImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [gsmarenaUrl, setGsmarenaUrl] = useState('');
  const [gsmarenaContent, setGsmarenaContent] = useState('');
  const [parsedPhone, setParsedPhone] = useState<any>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get brands/models from context
  const brands = useBrands();
  const models = useModels(selectedBrand || undefined);

  // Helper function to validate URL
  const isValidGSMArenaUrl = (url: string): boolean => {
    return url.includes('gsmarena.com') && (url.includes('/phones/') || url.includes('-'));
  };

  // Extract phone information from GSMArena URL
  const extractPhoneInfoFromUrl = (url: string) => {
    // Parse information from the URL structure
    // Example: https://www.gsmarena.com/infinix_note_50s_5g-13793.php
    // We can extract brand (infinix) and model (note_50s_5g)
    
    try {
      // Get the path part of the URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // The last part should contain brand and model
      const lastPart = pathParts[pathParts.length - 1];
      
      // Extract model ID (the number at the end)
      const modelId = lastPart.match(/-(\d+)\.php$/)?.[1] || '';
      
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
        displayName: 'Unknown Phone',
        modelId: ''
      };
    }
  };
  
  // Fetch and extract information about the phone
  const fetchGSMArenaContent = async () => {
    if (!isValidGSMArenaUrl(gsmarenaUrl)) {
      setError('Please enter a valid GSMArena URL');
      return;
    }
    
    setLoading(true);
    setError('');
    setGsmarenaContent('');
    setParsedPhone(null);
    
    try {
      // First try to extract information from the URL
      const { brandName, modelName, displayName } = extractPhoneInfoFromUrl(gsmarenaUrl);
      
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
          setSelectedBrand(matchedBrandId);
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
        
        // Create a phone data object with information extracted from the URL
        const phoneData = {
          name: displayName,
          brandName: brandName,
          modelName: modelName,
          gsmarenaUrl: gsmarenaUrl,
          mainImageUrl: '',
          imageUrls: [],
          // Default values for specs
          displaySize: '6.1 inches',
          processor: 'Snapdragon/MediaTek',
          ram: '8GB',
          storage: '128GB',
          mainCamera: '50MP',
          selfieCamera: '12MP',
          battery: '4000mAh'
        };
        
        // Update state with the extracted information
        setParsedPhone({
          ...phoneData,
          brand: selectedBrand || matchedBrandId || '',
          model: selectedModel || '',
          ram_gb: 8,
          storage_gb: 128,
          battery_mah: 4000,
          chipset: phoneData.processor
        });
        
        setError('Could not fetch detailed specs from GSMArena due to CORS restrictions. Basic information has been extracted from the URL.');
        setLoading(false);
        return;
      }
      
      // If we made it here, we successfully retrieved the HTML
      setGsmarenaContent(html);
      
      // Parse the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract phone name from page
      const nameElement = doc.querySelector('.specs-phone-name-title, h1');
      const phoneName = nameElement ? nameElement.textContent?.trim() || displayName : displayName;
      
      // Extract main image
      const mainImageElement = doc.querySelector('.specs-photo-main img, .review-header-image img');
      const mainImageUrl = mainImageElement ? mainImageElement.getAttribute('src') || '' : '';
      
      // Extract all images
      const imageElements = doc.querySelectorAll('.specs-photo-main img, .specs-photo-sub img, .review-header-image img');
      const imageUrls = Array.from(imageElements)
        .map(img => img.getAttribute('src'))
        .filter(Boolean) as string[];
      
      // Extract specs using different selectors that might be present in GSMArena's HTML
      const extractSpec = (labels: string[]): string => {
        // Try to find any of the labels in the spec tables
        const tableRows = doc.querySelectorAll('table tr, .specs-table tr');
        
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
        
        return '';
      };
      
      // Create phone data object from parsed content
      const phoneData = {
        name: phoneName,
        brandName: brandName,
        modelName: modelName,
        gsmarenaUrl: gsmarenaUrl,
        mainImageUrl: mainImageUrl,
        imageUrls: imageUrls,
        displaySize: extractSpec(['Display', 'Screen', 'display size']) || '6.1 inches',
        processor: extractSpec(['Chipset', 'CPU', 'Processor', 'SoC']) || 'Snapdragon/MediaTek',
        ram: extractSpec(['Memory', 'RAM', 'memory']) || '8GB',
        storage: extractSpec(['Storage', 'memory', 'Internal']) || '128GB',
        mainCamera: extractSpec(['Main Camera', 'Camera', 'Rear camera']) || '50MP',
        selfieCamera: extractSpec(['Selfie camera', 'Front camera']) || '12MP',
        battery: extractSpec(['Battery', 'battery capacity']) || '4000mAh'
      };
      
      // Extract numerical values for specifications
      const extractNumberFromText = (text: string, unit: string): number => {
        const regex = new RegExp(`(\\d+(\\.\\d+)?)\\s*${unit}`, 'i');
        const match = text.match(regex);
        return match ? parseFloat(match[1]) : 0;
      };
      
      // Update state with the extracted information
      setParsedPhone({
        ...phoneData,
        brand: selectedBrand || matchedBrandId || '',
        model: selectedModel || '',
        // Convert specifications to numerical values where possible
        ram_gb: extractNumberFromText(phoneData.ram, 'GB'),
        storage_gb: extractNumberFromText(phoneData.storage, 'GB'),
        battery_mah: extractNumberFromText(phoneData.battery, 'mAh'),
        chipset: phoneData.processor
      });
      
      setError('');
    } catch (err: any) {
      console.error('Error processing GSMArena content:', err);
      setError(`Could not extract detailed data from GSMArena (${err.message}). ` + 
               'Using basic information extracted from the URL.');
    } finally {
      setLoading(false);
    }
  };

  // No longer need to process pasted content since we use the API now

  // Process the import
  const handleImport = () => {
    if (!parsedPhone || !selectedBrand || !costPrice || !sellingPrice) {
      setError('Please fill in all required fields');
      return;
    }
    
    const phoneData = convertToSmartStoreFormat(
      parsedPhone,
      selectedBrand,
      selectedModel || undefined,
      costPrice,
      sellingPrice
    );
    
    // Convert to PhoneFormData format ensuring required fields are present
    const formData: PhoneFormData = {
      name: phoneData.name,
      brand: phoneData.brand_id,
      model: phoneData.model_id,
      cost_price: phoneData.cost_price,
      selling_unite_price: phoneData.selling_unite_price,
      selling_semi_bulk_price: phoneData.selling_semi_bulk_price,
      selling_bulk_price: phoneData.selling_bulk_price,
      description: phoneData.description,
      processor: phoneData.processor,
      ram_gb: phoneData.ram_gb,
      storage_gb: phoneData.storage_gb,
      screen_type: phoneData.screen_type,
      operating_system: phoneData.operating_system,
      rear_camera_mp: phoneData.rear_camera_mp,
      front_camera_mp: phoneData.front_camera_mp,
      battery_mah: phoneData.battery_mah,
      color: phoneData.color,
      condition: phoneData.condition || 'new',
      version: phoneData.version || 'global',
      phone_type: phoneData.phone_type || 'ordinary'
    };
    
    onImport(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Phone from GSMArena"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            disabled={!parsedPhone || !selectedBrand || costPrice <= 0 || sellingPrice <= 0}
          >
            Import
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">GSMArena URL</span>
          </label>
          <div className="flex">
            <input
              type="text"
              className="input input-bordered flex-1"
              value={gsmarenaUrl}
              onChange={(e) => setGsmarenaUrl(e.target.value)}
              placeholder=""
            />
            <Button 
              className="ml-2" 
              onClick={fetchGSMArenaContent}
              disabled={loading || !gsmarenaUrl}
            >
              {loading ? 'Loading...' : 'Fetch'}
            </Button>
          </div>
          {error && <p className="text-error text-sm mt-1">{error}</p>}
        </div>

        {loading && (
          <div className="flex justify-center p-4">
            <div className="loading loading-spinner loading-md"></div>
            <span className="ml-2">Fetching phone data...</span>
          </div>
        )}

        {parsedPhone && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-bold text-lg">{parsedPhone.name}</h3>
            {parsedPhone.mainImageUrl && (
              <img 
                src={parsedPhone.mainImageUrl} 
                alt={parsedPhone.name} 
                className="h-40 object-contain my-2 mx-auto"
              />
            )}
            {parsedPhone.imageUrls && parsedPhone.imageUrls.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Available Images: {parsedPhone.imageUrls.length}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {parsedPhone.imageUrls.slice(0, 5).map((url: string, index: number) => (
                    <img 
                      key={index}
                      src={url}
                      alt={`${parsedPhone.name} preview ${index + 1}`}
                      className="h-16 w-16 object-cover rounded border border-base-300"
                    />
                  ))}
                  {parsedPhone.imageUrls.length > 5 && (
                    <div className="h-16 w-16 bg-base-300 rounded flex items-center justify-center">
                      <span className="text-xs">+{parsedPhone.imageUrls.length - 5}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p><span className="font-semibold">Display:</span> {parsedPhone.displaySize}</p>
                <p><span className="font-semibold">Chipset:</span> {parsedPhone.chipset}</p>
                <p><span className="font-semibold">Storage/RAM:</span> {parsedPhone.storage}</p>
              </div>
              <div>
                <p><span className="font-semibold">Main Camera:</span> {parsedPhone.mainCamera}</p>
                <p><span className="font-semibold">Selfie:</span> {parsedPhone.selfieCamera}</p>
                <p><span className="font-semibold">Battery:</span> {parsedPhone.battery}</p>
              </div>
            </div>
          </div>
        )}

        {parsedPhone && (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Brand*</span>
              </label>
              <select
                className="select select-bordered"
                value={selectedBrand || ''}
                onChange={(e) => {
                  const brandId = parseInt(e.target.value);
                  setSelectedBrand(brandId);
                  setSelectedModel(null); // Reset model when brand changes
                }}
                required
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Model</span>
              </label>
              <select
                className="select select-bordered"
                value={selectedModel || ''}
                onChange={(e) => setSelectedModel(e.target.value ? parseInt(e.target.value) : null)}
                disabled={!selectedBrand}
              >
                <option value="">Select a model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Cost Price*</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={costPrice}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value))}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Selling Price (Unit)*</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value))}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PhoneImportModal;
