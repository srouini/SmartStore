# SmartStore - Phone Store Management Application

A comprehensive desktop application for managing stock, sales, and invoicing for a phone store selling phones and accessories in bulk, semi-bulk, and individually.

## Technology Stack

### Backend
- Python (Django) with Django REST Framework (DRF)
- SQLite Database
- Authentication using Django's built-in system

### Frontend
- React with TypeScript
- DaisyUI (built on Tailwind CSS)
- Axios for API requests
- React Router DOM for routing

### Packaging
- PyInstaller (for local Windows executable)

## Features

- User Authentication
- Comprehensive Data Management (CRUD operations)
- Detailed Product Information
- Stock Management
- Sales Recording
- Invoice Generation
- Basic Reporting/Statistics

## Project Structure

```
SmartStore/
├── backend/              # Django backend
│   ├── api/              # API app
│   ├── media/            # Media files (uploads)
│   ├── smartstore/       # Project settings
│   ├── manage.py         # Django management script
│   └── requirements.txt  # Python dependencies
├── frontend/             # React frontend
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── api/          # API services
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   └── App.tsx       # Main application component
│   ├── package.json      # Node.js dependencies
│   └── tsconfig.json     # TypeScript configuration
└── README.md             # Project documentation
```

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r backend/requirements.txt
   ```

4. Navigate to the backend directory:
   ```
   cd backend
   ```

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Building for Production

### Frontend Build

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Build the React application:
   ```
   npm run build
   ```

3. Copy the build files to the Django static directory:
   ```
   cp -r build/* ../backend/build/
   ```

### Creating Windows Executable

1. Ensure PyInstaller is installed:
   ```
   pip install pyinstaller
   ```

2. Run PyInstaller:
   ```
   pyinstaller --name=SmartStore --onefile --windowed --add-data "backend/build;build" --add-data "backend/media;media" backend/manage.py
   ```

3. The executable will be created in the `dist` directory.

## Usage

1. Launch the application by running the executable.
2. Open your web browser and navigate to `http://127.0.0.1:8000`.
3. Log in with your credentials.
4. Use the navigation menu to access different features of the application.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
