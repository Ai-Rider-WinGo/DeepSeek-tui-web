#!/usr/bin/env python3
import argparse
import base64
import fcntl
import json
import os
import select
import signal
import struct
import sys
import termios
import time

MAX_BUFFER = 1_000_000  # 1 MB

def emit(kind, **payload):
    sys.stdout.write(json.dumps({"type": kind, **payload}, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def set_winsize(fd, cols, rows):
    packed = struct.pack("HHHH", max(12, rows), max(40, cols), 0, 0)
    fcntl.ioctl(fd, termios.TIOCSWINSZ, packed)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--workspace", required=True)
    parser.add_argument("--cols", type=int, default=120)
    parser.add_argument("--rows", type=int, default=36)
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()

    if not args.command:
        emit("error", message="No command provided")
        return 2

    pid, master_fd = os.forkpty()
    if pid == 0:
        os.chdir(args.workspace)
        os.environ["TERM"] = "xterm-256color"
        os.environ["COLORTERM"] = "truecolor"
        os.environ["COLUMNS"] = str(args.cols)
        os.environ["LINES"] = str(args.rows)
        os.execvp(args.command[0], args.command)

    set_winsize(master_fd, args.cols, args.rows)
    os.set_blocking(master_fd, False)
    os.set_blocking(sys.stdin.fileno(), False)
    emit("ready", pid=pid)

    stdin_buffer = b""
    exit_code = None

    while True:
        try:
            done_pid, status = os.waitpid(pid, os.WNOHANG)
            if done_pid == pid:
                if os.WIFEXITED(status):
                    exit_code = os.WEXITSTATUS(status)
                elif os.WIFSIGNALED(status):
                    exit_code = 128 + os.WTERMSIG(status)
                break
        except ChildProcessError:
            break

        readable, _, _ = select.select([master_fd, sys.stdin.fileno()], [], [], 0.05)

        if master_fd in readable:
            try:
                data = os.read(master_fd, 8192)
            except OSError:
                break
            if not data:
                break
            emit("output", data=base64.b64encode(data).decode("ascii"))

        if sys.stdin.fileno() in readable:
            try:
                chunk = os.read(sys.stdin.fileno(), 8192)
            except BlockingIOError:
                chunk = b""
            if not chunk:
                try:
                    os.kill(pid, signal.SIGHUP)
                except ProcessLookupError:
                    pass
                break
            stdin_buffer += chunk
            if len(stdin_buffer) > MAX_BUFFER:
                emit("error", message="stdin buffer exceeded 1 MB limit")
                break
            while b"\n" in stdin_buffer:
                line, stdin_buffer = stdin_buffer.split(b"\n", 1)
                if not line:
                    continue
                try:
                    message = json.loads(line.decode("utf-8"))
                except json.JSONDecodeError:
                    continue
                if message.get("type") == "input":
                    os.write(master_fd, base64.b64decode(message.get("data", "")))
                elif message.get("type") == "resize":
                    set_winsize(master_fd, int(message.get("cols", 120)), int(message.get("rows", 36)))
                    try:
                        os.kill(pid, signal.SIGWINCH)
                    except ProcessLookupError:
                        pass

    time.sleep(0.05)
    emit("exit", exitCode=exit_code if exit_code is not None else 0)
    return exit_code or 0


if __name__ == "__main__":
    raise SystemExit(main())
