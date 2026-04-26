import os
import shutil
import sys

def cleanup_vcs(directory):
    """Remove all .git, .github, and __pycache__ folders."""
    print(f"Cleaning VCS data in {directory}...")
    for root, dirs, files in os.walk(directory, topdown=False):
        for name in dirs:
            if name in ['.git', '.github', '__pycache__', '.pytest_cache']:
                path = os.path.join(root, name)
                print(f" - Removing {path}")
                try:
                    shutil.rmtree(path, ignore_errors=True)
                except Exception as e:
                    print(f"   Error: {e}")

def consolidate_requirements(root_dir):
    """Combine all requirements.txt files into the root one."""
    print("Consolidating requirements...")
    all_reqs = set()
    root_req_path = os.path.join(root_dir, 'requirements.txt')
    
    if os.path.exists(root_req_path):
        with open(root_req_path, 'r', encoding='utf-8', errors='ignore') as f:
            all_reqs.update([line.strip() for line in f if line.strip() and not line.startswith('#')])
            
    for root, dirs, files in os.walk(root_dir):
        if root == root_dir: continue # skip root
        if 'requirements.txt' in files:
            path = os.path.join(root, 'requirements.txt')
            print(f" - Reading {path}")
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                all_reqs.update([line.strip() for line in f if line.strip() and not line.startswith('#')])
                
    with open(root_req_path, 'w', encoding='utf-8') as f:
        f.write("# Unified AI Ecosystem Requirements\n")
        for req in sorted(all_reqs):
            f.write(f"{req}\n")

if __name__ == "__main__":
    root = 'f:/PROJECTS/hacking ai/unified-ai'
    cleanup_vcs(os.path.join(root, 'src'))
    consolidate_requirements(root)
    print("Cleanup and consolidation complete.")
