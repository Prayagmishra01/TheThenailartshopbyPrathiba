import glob
import re

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add width and height to images to prevent CLS
    def add_dimensions(match):
        img_tag = match.group(0)
        if 'width=' not in img_tag and 'height=' not in img_tag:
            # We add 600x600 as a default dimension that CSS will override, but it provides the aspect ratio
            # for the browser to reserve space.
            return img_tag.replace('<img ', '<img width="600" height="600" ')
        return img_tag

    content = re.sub(r'<img[^>]+>', add_dimensions, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("CLS optimization complete.")
