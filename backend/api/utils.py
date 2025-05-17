import os
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from io import BytesIO
from PIL import Image
import uuid
import logging

# Try to import optional dependencies
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

logger = logging.getLogger(__name__)

def download_image_from_url(url, save_path=None):
    """
    Download an image from a URL and save it to local storage.
    
    Args:
        url (str): URL of the image to download
        save_path (str, optional): Path to save the image. If None, a temporary path is generated.
        
    Returns:
        django.core.files.File: The downloaded and saved image file
        str: The path where the image was saved
    """
    # Check if requests is available
    if not HAS_REQUESTS:
        logger.error("Requests package is not installed. Cannot download image from URL.")
        return None, None
        
    try:
        # Add user agent to avoid being blocked
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Download the image
        response = requests.get(url, headers=headers, stream=True, timeout=10)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Generate a unique filename if none provided
        if not save_path:
            ext = os.path.splitext(url.split('?')[0])[1] or '.jpg'  # Default to .jpg if no extension
            filename = f"gsmarena_{uuid.uuid4().hex}{ext}"
            save_path = os.path.join('phone_images', filename)
        
        # Use PIL to open and potentially process the image
        img = Image.open(BytesIO(response.content))
        
        # Convert to RGB if RGBA (remove alpha channel)
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # Save to a BytesIO object
        output = BytesIO()
        img.save(output, format='JPEG', quality=85)
        output.seek(0)
        
        # Save the file using Django's storage system
        saved_path = default_storage.save(save_path, ContentFile(output.read()))
        
        # Return a file object that Django can use
        return default_storage.open(saved_path), saved_path
        
    except Exception as e:
        logger.error(f"Error downloading image from {url}: {str(e)}")
        return None, None
