import os
import glob
import re

html_files = glob.glob("*.html")

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Convert ALL data-src back to src
    content = content.replace('data-src="', 'src="')
    
    # 2. Now properly find blocks that are grids, and only convert those
    # The grids have classes containing: gallery-grid, masonry-grid, instagram-grid
    # We can split the file by these grid classes, or better, we can use a simpler approach.
    
    # Let's replace src with data-src ONLY if it occurs on lines that contain:
    # class="... insta-item ...", "masonry-item", "gallery-item"
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        if 'insta-item' in line or 'masonry-item' in line or 'gallery-item' in line:
            # We assume the img or video tag is on the same line, or the next line.
            # Actually, looking at the code:
            # <div class="masonry-item filter-item nail all">
            #     <img src="..." >
            # This spans multiple lines.
            pass
            
    # Instead, let's use a regex that matches the div wrapper and its content up to the closing div
    # Regex to match <div class="[^"]*(insta-item|masonry-item|gallery-item)[^"]*">.*?</div>
    # and replace src= with data-src= inside it.
    
    def replacer(match):
        block = match.group(0)
        block = block.replace(' src="images/', ' data-src="images/')
        block = block.replace(' src="videos/', ' data-src="videos/')
        return block
        
    content = re.sub(r'<div class="[^"]*?(insta-item|masonry-item|gallery-item)[^"]*?">.*?</div>', replacer, content, flags=re.DOTALL)
    
    # What about the video tags in masonry-grid? They are inside masonry-item. The above regex catches them!
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Fixed data-src in {file}")
