import re
import json

def check():
    with open('data.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        count = line.count('"')
        if count > 2 and 'id:' not in line and 'icon:' not in line and 'theme:' not in line:
            print(f'Line {i+1} has {count} quotes: {line.strip()}')

if __name__ == "__main__":
    check()
