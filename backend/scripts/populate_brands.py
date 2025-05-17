import os
import sys
import django
import requests
import io
import time
from PIL import Image
from django.core.files.base import ContentFile

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartstore.settings')
django.setup()

from api.models import Brand

# Function to download and prepare logo image
def get_logo_image(logo_url, brand_name):
    try:
        response = requests.get(logo_url, timeout=10)
        if response.status_code == 200:
            # Process image to ensure it's in a valid format
            image = Image.open(io.BytesIO(response.content))
            
            # Convert to RGB if image is in RGBA mode (PNG with transparency)
            if image.mode == 'RGBA':
                rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                rgb_image.paste(image, mask=image.split()[3])  # Use alpha channel as mask
                image = rgb_image
            
            # Save as bytes
            img_io = io.BytesIO()
            image.save(img_io, format='JPEG', quality=85)
            img_io.seek(0)
            
            return ContentFile(img_io.read(), name=f"{brand_name.lower().replace(' ', '_')}.jpg")
        else:
            print(f"Failed to download logo for {brand_name}: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"Error processing logo for {brand_name}: {str(e)}")
        return None

# List of known phone brands with their details and logo URLs
brands_data = [
    {
        'name': 'Apple',
        'origin_country': 'United States',
        'description': 'American technology company known for iPhones and iOS.',
        'website': 'https://www.apple.com',
        'logo_url': 'https://logo.clearbit.com/apple.com'
    },
    {
        'name': 'Samsung',
        'origin_country': 'South Korea',
        'description': 'South Korean multinational conglomerate, market leader in Android smartphones.',
        'website': 'https://www.samsung.com',
        'logo_url': 'https://logo.clearbit.com/samsung.com'
    },
    {
        'name': 'Xiaomi',
        'origin_country': 'China',
        'description': 'Chinese electronics company known for affordable smartphones with high specifications.',
        'website': 'https://www.mi.com',
        'logo_url': 'https://logo.clearbit.com/mi.com'
    },
    {
        'name': 'Huawei',
        'origin_country': 'China',
        'description': 'Chinese multinational technology company, known for advanced camera technology.',
        'website': 'https://www.huawei.com',
        'logo_url': 'https://logo.clearbit.com/huawei.com'
    },
    {
        'name': 'Google',
        'origin_country': 'United States',
        'description': 'American technology company that produces Pixel phones known for software integration.',
        'website': 'https://store.google.com',
        'logo_url': 'https://logo.clearbit.com/google.com'
    },
    {
        'name': 'OnePlus',
        'origin_country': 'China',
        'description': 'Chinese smartphone manufacturer known for high-performance devices at competitive prices.',
        'website': 'https://www.oneplus.com',
        'logo_url': 'https://logo.clearbit.com/oneplus.com'
    },
    {
        'name': 'Sony',
        'origin_country': 'Japan',
        'description': 'Japanese multinational corporation, known for Xperia phones with great displays and cameras.',
        'website': 'https://www.sony.com',
        'logo_url': 'https://logo.clearbit.com/sony.com'
    },
    {
        'name': 'Nokia',
        'origin_country': 'Finland',
        'description': 'Finnish telecommunications company, known for durable phones and Android One program.',
        'website': 'https://www.nokia.com/phones',
        'logo_url': 'https://logo.clearbit.com/nokia.com'
    },
    {
        'name': 'Motorola',
        'origin_country': 'United States',
        'description': 'American telecommunications company known for affordable and mid-range smartphones.',
        'website': 'https://www.motorola.com',
        'logo_url': 'https://logo.clearbit.com/motorola.com'
    },
    {
        'name': 'LG',
        'origin_country': 'South Korea',
        'description': 'South Korean multinational electronics company, known for innovative display technology.',
        'website': 'https://www.lg.com',
        'logo_url': 'https://logo.clearbit.com/lg.com'
    },
    {
        'name': 'OPPO',
        'origin_country': 'China',
        'description': 'Chinese consumer electronics manufacturer known for camera technology and fast charging.',
        'website': 'https://www.oppo.com',
        'logo_url': 'https://logo.clearbit.com/oppo.com'
    },
    {
        'name': 'Vivo',
        'origin_country': 'China',
        'description': 'Chinese technology company known for innovative camera features and slim designs.',
        'website': 'https://www.vivo.com',
        'logo_url': 'https://logo.clearbit.com/vivo.com'
    },
    {
        'name': 'Realme',
        'origin_country': 'China',
        'description': 'Chinese smartphone manufacturer focusing on youth market with high specifications at affordable prices.',
        'website': 'https://www.realme.com',
        'logo_url': 'https://logo.clearbit.com/realme.com'
    },
    {
        'name': 'ASUS',
        'origin_country': 'Taiwan',
        'description': 'Taiwanese multinational computer hardware company, known for ROG gaming phones.',
        'website': 'https://www.asus.com',
        'logo_url': 'https://logo.clearbit.com/asus.com'
    },
    {
        'name': 'BlackBerry',
        'origin_country': 'Canada',
        'description': 'Canadian company formerly known for business-oriented phones with physical keyboards.',
        'website': 'https://www.blackberry.com',
        'logo_url': 'https://logo.clearbit.com/blackberry.com'
    },
    {
        'name': 'HTC',
        'origin_country': 'Taiwan',
        'description': 'Taiwanese consumer electronics company known for premium design and audio quality.',
        'website': 'https://www.htc.com',
        'logo_url': 'https://logo.clearbit.com/htc.com'
    },
    {
        'name': 'ZTE',
        'origin_country': 'China',
        'description': 'Chinese multinational telecommunications equipment and systems company.',
        'website': 'https://www.ztedevices.com',
        'logo_url': 'https://logo.clearbit.com/zte.com.cn'
    },
    {
        'name': 'Lenovo',
        'origin_country': 'China',
        'description': 'Chinese multinational technology company that owns Motorola Mobility.',
        'website': 'https://www.lenovo.com',
        'logo_url': 'https://logo.clearbit.com/lenovo.com'
    },
    {
        'name': 'Honor',
        'origin_country': 'China',
        'description': 'Chinese smartphone brand, formerly a sub-brand of Huawei, now independent.',
        'website': 'https://www.hihonor.com',
        'logo_url': 'https://logo.clearbit.com/hihonor.com'
    },
    {
        'name': 'Nothing',
        'origin_country': 'United Kingdom',
        'description': 'UK-based consumer technology company founded by former OnePlus co-founder Carl Pei.',
        'website': 'https://nothing.tech',
        'logo_url': 'https://logo.clearbit.com/nothing.tech'
    }
]

def populate_brands():
    brands_created = 0
    brands_existing = 0
    
    for brand_data in brands_data:
        # Download logo image
        print(f"Processing {brand_data['name']}...")
        logo_image = get_logo_image(brand_data['logo_url'], brand_data['name'])
        
        # Add a small delay to prevent overwhelming the logo service
        time.sleep(1)
        
        # Set up defaults with all fields
        defaults = {
            'origin_country': brand_data['origin_country'],
            'description': brand_data['description'],
            'website': brand_data['website']
        }
        
        # Add the image if we successfully downloaded it
        if logo_image:
            defaults['picture'] = logo_image
        
        # Create or update brand
        brand, created = Brand.objects.get_or_create(
            name=brand_data['name'],
            defaults=defaults
        )
        
        if created:
            print(f"Created brand: {brand.name}")
            brands_created += 1
        else:
            print(f"Brand already exists: {brand.name}")
            brands_existing += 1
    
    print(f"\nPopulation complete! Created {brands_created} new brands. {brands_existing} brands already existed.")

if __name__ == "__main__":
    print("Starting brand population...")
    populate_brands()
