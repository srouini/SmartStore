import os
import shutil
import subprocess
import sys
import platform

def main():
    print("SmartStore Packaging Script")
    print("===========================")
    
    # Check operating system
    if platform.system() != "Windows":
        print("Warning: This packaging script is designed for Windows. Some features may not work on other platforms.")
    
    # Create build directory if it doesn't exist
    if not os.path.exists("build"):
        os.makedirs("build")
    
    # Step 1: Build React frontend
    print("\nStep 1: Building React frontend...")
    os.chdir("frontend")
    subprocess.run(["npm", "run", "build"], check=True)
    os.chdir("..")
    
    # Step 2: Create build directory in Django project if it doesn't exist
    if not os.path.exists("backend/build"):
        os.makedirs("backend/build")
    
    # Step 3: Copy React build files to Django build directory
    print("\nStep 2: Copying React build files to Django...")
    for item in os.listdir("frontend/dist"):
        src = os.path.join("frontend/dist", item)
        dst = os.path.join("backend/build", item)
        if os.path.isdir(src):
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
    
    # Step 4: Collect static files
    print("\nStep 3: Collecting Django static files...")
    os.chdir("backend")
    subprocess.run([sys.executable, "manage.py", "collectstatic", "--noinput"], check=True)
    os.chdir("..")
    
    # Step 5: Create entry point script for PyInstaller
    print("\nStep 4: Creating entry point script...")
    with open("entry_point.py", "w") as f:
        f.write("""
import os
import sys
import waitress
from django.core.wsgi import get_wsgi_application

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartstore.settings')

# Get the WSGI application
application = get_wsgi_application()

# Run the server
if __name__ == '__main__':
    print("Starting SmartStore server...")
    print("Open your web browser and navigate to http://127.0.0.1:8000")
    waitress.serve(application, host='127.0.0.1', port=8000)
""")
    
    # Step 6: Create PyInstaller spec file
    print("\nStep 5: Creating PyInstaller spec file...")
    with open("SmartStore.spec", "w") as f:
        f.write("""# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(['entry_point.py'],
             pathex=['.'],
             binaries=[],
             datas=[
                ('backend/build', 'build'),
                ('backend/media', 'media'),
                ('backend/db.sqlite3', '.'),
             ],
             hiddenimports=['django.contrib.admin.apps', 'django.contrib.auth.apps', 
                           'django.contrib.contenttypes.apps', 'django.contrib.sessions.apps',
                           'django.contrib.messages.apps', 'django.contrib.staticfiles.apps',
                           'rest_framework', 'corsheaders', 'api.apps.ApiConfig'],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)

pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)

exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          [],
          name='SmartStore',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          upx_exclude=[],
          runtime_tmpdir=None,
          console=True,
          icon='frontend/public/favicon.ico')
""")
    
    # Step 7: Run PyInstaller
    print("\nStep 6: Running PyInstaller...")
    subprocess.run(["pyinstaller", "SmartStore.spec"], check=True)
    
    print("\nPackaging complete! The executable is in the 'dist' directory.")
    print("To run the application, execute 'dist/SmartStore.exe'")

if __name__ == "__main__":
    main()
