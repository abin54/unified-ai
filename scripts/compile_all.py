import os
import py_compile
import sys

def check_syntax(directory):
    errors = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                try:
                    py_compile.compile(path, doraise=True)
                except py_compile.PyCompileError as e:
                    errors.append((path, str(e)))
                except Exception as e:
                    errors.append((path, f"Unexpected error: {e}"))
    return errors

if __name__ == "__main__":
    errors = check_syntax('src')
    if errors:
        print(f"Found {len(errors)} syntax errors:")
        for path, err in errors:
            print(f"--- {path} ---")
            print(err)
            print()
        sys.exit(1)
    else:
        print("No syntax errors found in src/.")
