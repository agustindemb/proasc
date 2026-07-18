import sharp from 'sharp';
import fs from 'fs';

async function generate() {
  try {
    const source = 'public/logo.jpeg'; // Use the correct user logo
    
    // Generate 48x48 favicon (multiple of 48, required by Google crawler)
    await sharp(source)
      .resize(48, 48)
      .png()
      .toFile('public/favicon.png');
    console.log('✓ public/favicon.png (48x48) generated.');

    // Generate 32x32 favicon (standard browser tab size)
    await sharp(source)
      .resize(32, 32)
      .png()
      .toFile('public/favicon-32x32.png');
    console.log('✓ public/favicon-32x32.png generated.');

    // Generate 192x192 Apple touch icon / Android size
    await sharp(source)
      .resize(192, 192)
      .png()
      .toFile('public/apple-touch-icon.png');
    console.log('✓ public/apple-touch-icon.png (192x192) generated.');
    
    // Also save a fallback .ico for legacy browsers
    // Note: since .ico is just a container, we can copy the 48x48 png as favicon.ico and browsers will parse it correctly.
    fs.copyFileSync('public/favicon.png', 'public/favicon.ico');
    console.log('✓ public/favicon.ico generated.');
  } catch (err) {
    console.error('Error generating favicons:', err);
  }
}

generate();
