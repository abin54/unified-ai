import os
import sys
import importlib.util

def check_imports(directory):
    missing_packages = set()
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    try:
                        lines = f.readlines()
                    except:
                        continue
                    for line in lines:
                        if line.strip().startswith(('import ', 'from ')):
                            parts = line.split()
                            if not parts: continue
                            
                            # Get the base package name
                            if parts[0] == 'import':
                                pkg = parts[1].split('.')[0]
                            else: # from ... import ...
                                pkg = parts[1].split('.')[0]
                            
                            # Skip internal imports
                            if pkg in ['src', 'scripts', 'core', 'constants', 'os_detect']:
                                continue
                                
                            # Skip standard library (rough check)
                            if importlib.util.find_spec(pkg) is None:
                                missing_packages.add(pkg)
    return missing_packages

if __name__ == "__main__":
    # Add project root to sys.path
    sys.path.append(os.getcwd())
    
    missing = check_imports('src')
    if missing:
        print("Potential missing packages:")
        for m in sorted(missing):
            print(f" - {m}")
    else:
        print("No missing packages found (rough check).")
