import subprocess

def get_file_content(branch, path):
    cmd = ['git', 'show', f'{branch}:{path}']
    result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
    return result.stdout

if __name__ == "__main__":
    print(get_file_content('Stage', 'src/lib/api/endpoints.js'))
