import os
import glob
import re

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add preconnects
    if 'rel="preconnect" href="https://res.cloudinary.com"' not in content:
        content = content.replace('</head>', '    <link rel="preconnect" href="https://res.cloudinary.com">\n    <link rel="dns-prefetch" href="https://res.cloudinary.com">\n</head>')
        
    # Defer main JS
    content = content.replace('<script src="js/main.js"></script>', '<script src="js/main.js" defer></script>')
    
    # Preload CSS
    if 'rel="preload" href="css/style.css" as="style"' not in content:
        content = content.replace('<link rel="stylesheet" href="css/style.css">', '<link rel="preload" href="css/style.css" as="style">\n    <link rel="stylesheet" href="css/style.css">')
        
    # Preload Hero image for index.html
    if filepath == 'index.html' and 'rel="preload" as="image" href="https://res.cloudinary.com/dz3ixer7i/image/upload/v1776184909/upscaled__16.jpeg_202604142207_1_ci8n72.webp"' not in content:
        content = content.replace('</head>', '    <link rel="preload" as="image" href="https://res.cloudinary.com/dz3ixer7i/image/upload/v1776184909/upscaled__16.jpeg_202604142207_1_ci8n72.webp">\n</head>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Optimization complete.")
