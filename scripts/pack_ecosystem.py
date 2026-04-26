import os

def pack_ecosystem(src_dir, output_file):
    ignore_exts = {'.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.tar', '.gz', '.7z', '.exe', '.dll', '.so', '.pyc', '.pyo'}
    ignore_dirs = {'node_modules', 'dist', '.git', '.github', '__pycache__', '.venv', 'venv', 'env'}
    
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write("# UNIFIED AI ECOSYSTEM - MASTER SNAPSHOT\n")
        out.write(f"# Repositories: 42 Integrated\n")
        out.write(f"# Structure: src/ tree\n\n")
        
        for root, dirs, files in os.walk(src_dir):
            # Skip ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in ignore_exts:
                    continue
                
                path = os.path.join(root, file)
                rel_path = os.path.relpath(path, start=os.path.dirname(src_dir))
                
                try:
                    out.write(f"\n--- FILE: {rel_path} ---\n")
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        out.write(f.read())
                    out.write(f"\n--- END FILE: {rel_path} ---\n")
                except Exception as e:
                    out.write(f"\n--- ERROR READING {rel_path}: {e} ---\n")

if __name__ == "__main__":
    pack_ecosystem('src', 'unified_ai_master_pack.md')
    print("Custom pack complete: unified_ai_master_pack.md")
