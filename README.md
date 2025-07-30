# PharmaDesk - Pharmacy Management System

A modern, responsive login page built with React.js and Tailwind CSS for a pharmacy management system.

## Features

- 🎨 **Clean, Modern Design**: Aqua blue theme with professional pharmacy styling
- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- 🔐 **Secure Login**: Form validation and error handling
- ⚡ **Fast & Lightweight**: Built with React and Tailwind CSS
- 🎯 **User-Friendly**: Intuitive interface with clear feedback

## Tech Stack

- **React.js** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing
- **Inter Font** - Modern, readable typography

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pharmadesk-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Login page component
│   └── Home.js           # Home page component
├── App.js                # Main app component with routing
├── index.js              # React entry point
└── index.css             # Global styles and Tailwind imports
```

## API Configuration

The login form sends a POST request to `http://localhost:3001/login` with the following payload:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

To change the API URL, update the axios request in `src/components/Login.js`:

```javascript
const response = await axios.post('YOUR_API_URL/login', formData);
```

## Features

### Login Form
- Email and password input fields
- Form validation
- Loading states
- Error handling
- Success feedback

### Responsive Design
- Desktop: 50/50 split layout with image and form
- Mobile: Stacked layout with form on top
- Tablet: Adaptive layout

### Styling
- Aqua blue color scheme
- Modern typography with Inter font
- Subtle shadows and transitions
- Professional pharmacy-themed design

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (not recommended)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 