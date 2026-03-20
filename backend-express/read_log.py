import os
with open('log.txt', 'rb') as f:
    print(f.read().decode('utf-16le', errors='ignore'))
