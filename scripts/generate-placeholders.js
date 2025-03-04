const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Generate an SVG placeholder with text
const generatePlaceholderSVG = (width, height, text, bgColor, textColor) => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;
};

// Project image data
const projectImages = [
  // Design System
  { name: 'design-system-1.jpg', text: 'Design System - Components', bgColor: '#4F46E5', textColor: '#FFFFFF' },
  { name: 'design-system-2.jpg', text: 'Design System - Color Palette', bgColor: '#8B5CF6', textColor: '#FFFFFF' },
  { name: 'design-system-3.jpg', text: 'Design System - Typography', bgColor: '#6366F1', textColor: '#FFFFFF' },
  
  // E-commerce
  { name: 'ecommerce-1.jpg', text: 'E-commerce - Homepage', bgColor: '#EC4899', textColor: '#FFFFFF' },
  { name: 'ecommerce-2.jpg', text: 'E-commerce - Product Page', bgColor: '#F472B6', textColor: '#FFFFFF' },
  
  // Mobile App
  { name: 'mobile-app-1.jpg', text: 'Mobile App - Dashboard', bgColor: '#10B981', textColor: '#FFFFFF' },
  { name: 'mobile-app-2.jpg', text: 'Mobile App - Profile', bgColor: '#34D399', textColor: '#FFFFFF' },
  { name: 'mobile-app-3.jpg', text: 'Mobile App - Analytics', bgColor: '#059669', textColor: '#FFFFFF' },
  { name: 'mobile-app-4.jpg', text: 'Mobile App - Settings', bgColor: '#6EE7B7', textColor: '#333333' },
  
  // Brand Identity
  { name: 'brand-1.jpg', text: 'Brand Identity - Logo', bgColor: '#F59E0B', textColor: '#FFFFFF' },
  { name: 'brand-2.jpg', text: 'Brand Identity - Guidelines', bgColor: '#FBBF24', textColor: '#333333' },
];

// Output directory
const outputDir = path.join(__dirname, '../public/images/projects');

// Ensure the output directory exists
ensureDirectoryExists(outputDir);

// Generate and save each placeholder image
projectImages.forEach(({ name, text, bgColor, textColor }) => {
  const svgContent = generatePlaceholderSVG(800, 600, text, bgColor, textColor);
  const outputPath = path.join(outputDir, name);
  
  fs.writeFileSync(outputPath, svgContent);
  console.log(`Generated: ${outputPath}`);
});

console.log('All placeholder images generated successfully!'); 