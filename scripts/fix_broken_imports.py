import os
import re

def fix_import_import(directory):
    # Match 'import src.X import Y' with any indentation, handling optional trailing spaces/carriage returns
    pattern = re.compile(r'^\s*import\s+(src\.[^\s]+)\s+import\s+([^\s\r\n]+)', re.MULTILINE)
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    new_content = pattern.sub(r'from \1 import \2', content)
                    
                    if new_content != content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Fixed {path}")
                except Exception as e:
                    print(f"Error fixing {path}: {e}")

if __name__ == "__main__":
    fix_import_import('src')
    print("Cleanup fix complete.")

