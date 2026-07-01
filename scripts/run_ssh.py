import pty, os, sys

def run_ssh(cmd, is_scp=False):
    pid, fd = pty.fork()
    if pid == 0:
        if is_scp:
            os.execvp("scp", ["scp", "-o", "StrictHostKeyChecking=no", "-P", "6985"] + cmd)
        else:
            os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "-p", "6985", "root@201.46.120.192"] + cmd)
    else:
        out = b""
        while True:
            try:
                chunk = os.read(fd, 1024)
                if not chunk: break
                out += chunk
                if b"assword:" in out:
                    os.write(fd, b"M3un0m3@@19918\n")
                    out = b"" # reset out after password
            except OSError:
                break
        print(out.decode('utf-8', errors='ignore'))

if sys.argv[1] == 'scp':
    run_ssh(sys.argv[2:], is_scp=True)
else:
    run_ssh(sys.argv[1:], is_scp=False)
