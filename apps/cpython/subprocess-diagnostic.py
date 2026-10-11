"""Acceptance checks for the real no-fork interpreter and child processes."""

import errno
import os
from pathlib import Path
import subprocess
import sys
import signal
import tempfile
import unittest


PYTHON = sys.executable


class SpawnTests(unittest.TestCase):
    def python(self, code, **kwargs):
        return subprocess.run([PYTHON, "-c", code], **kwargs)

    def test_configuration(self):
        import sysconfig
        self.assertTrue(os.WASM_POSIX_SPAWN_ONLY)
        self.assertFalse(hasattr(os, "fork"))
        self.assertFalse(hasattr(os, "vfork"))
        self.assertNotIn("_posixsubprocess", sys.builtin_module_names)
        self.assertNotIn("--enable-fork", sysconfig.get_config_var("CFLAGS"))
        self.assertNotIn("--enable-fork", sysconfig.get_config_var("LDSHARED"))
        self.assertIn("-static", sysconfig.get_config_var("LDFLAGS"))

    def test_pipes(self):
        result = self.python("import sys; print(sys.stdin.read().upper()); "
                             "print('error', file=sys.stderr)",
                             input="hello", capture_output=True, text=True, check=True)
        self.assertEqual(result.stdout, "HELLO\n")
        self.assertEqual(result.stderr, "error\n")

    def test_merged_output_and_devnull(self):
        result = self.python("import os; os.write(1,b'out'); os.write(2,b'err')",
                             stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                             stdin=subprocess.DEVNULL, check=True)
        self.assertEqual(result.stdout, b"outerr")

    def test_exit_status(self):
        with self.assertRaises(subprocess.CalledProcessError) as caught:
            self.python("raise SystemExit(7)", check=True)
        self.assertEqual(caught.exception.returncode, 7)

    def test_shell(self):
        self.assertEqual(subprocess.check_output("printf spawn-shell", shell=True),
                         b"spawn-shell")

    def test_cwd_environment_and_path(self):
        original = os.getcwd()
        with tempfile.TemporaryDirectory() as directory:
            os.symlink(PYTHON, os.path.join(directory, "spawn-python"))
            environment = dict(os.environ, PATH=".", SPAWN_MARKER="child-only")
            result = subprocess.run(
                ["spawn-python", "-c", "import os; print(os.getcwd()); "
                 "print(os.environ['SPAWN_MARKER'])"],
                cwd=directory, env=environment, capture_output=True, text=True, check=True)
            self.assertEqual(result.stdout.splitlines(), [directory, "child-only"])
            result = subprocess.run(["./spawn-python", "-c", "print(42)"],
                                    cwd=directory, capture_output=True, check=True)
            self.assertEqual(result.stdout, b"42\n")
        self.assertEqual(os.getcwd(), original)
        self.assertNotIn("SPAWN_MARKER", os.environ)

    def test_bytes_and_pathlike(self):
        self.assertEqual(subprocess.check_output([os.fsencode(PYTHON), b"-c", b"print(12)"]), b"12\n")
        self.assertEqual(subprocess.check_output([Path(PYTHON), "-c", "print(13)"]), b"13\n")

    def test_descriptor_inheritance(self):
        with tempfile.TemporaryFile() as file:
            fd = file.fileno()
            os.set_inheritable(fd, True)
            code = ("import os\ntry: os.fstat(" + str(fd) + ")\n"
                    "except OSError: print('closed')\nelse: print('open')")
            self.assertEqual(self.python(code, capture_output=True, text=True,
                                         check=True).stdout, "closed\n")
            self.assertEqual(self.python(code, close_fds=False, capture_output=True,
                                         text=True, check=True).stdout, "open\n")
            self.assertTrue(os.get_inheritable(fd))

    def test_file_redirection(self):
        with tempfile.TemporaryFile() as file:
            self.python("print('file-output')", stdout=file, check=True)
            file.seek(0)
            self.assertEqual(file.read(), b"file-output\n")

    def test_errors(self):
        with self.assertRaises(FileNotFoundError) as caught:
            subprocess.run(["/no-such-spawn-executable"])
        self.assertEqual(caught.exception.filename, "/no-such-spawn-executable")
        with self.assertRaises(FileNotFoundError) as caught:
            self.python("pass", cwd="/no-such-spawn-directory")
        self.assertEqual(caught.exception.filename, "/no-such-spawn-directory")
        with tempfile.TemporaryDirectory() as directory:
            denied = os.path.join(directory, "denied")
            with open(denied, "w") as file:
                file.write("invalid executable")
            os.chmod(denied, 0o600)
            with self.assertRaises(PermissionError):
                subprocess.run(["denied"], env=dict(os.environ, PATH=directory + ":/missing"))
            with self.assertRaises(NotADirectoryError):
                self.python("pass", cwd=denied)

    def test_timeout_and_reaping(self):
        with subprocess.Popen([PYTHON, "-c", "import time; time.sleep(10)"],
                              stdout=subprocess.PIPE) as child:
            with self.assertRaises(subprocess.TimeoutExpired):
                child.communicate(timeout=0.1)
            child.kill()
            child.communicate(timeout=5)
            self.assertIsNotNone(child.returncode)
        with self.assertRaises(ChildProcessError):
            os.waitpid(child.pid, os.WNOHANG)

    def test_rejected_options(self):
        with tempfile.TemporaryFile() as file:
            options = [{"preexec_fn": lambda: None}, {"pass_fds": (file.fileno(),)},
                       {"start_new_session": True}, {"umask": 0o077}]
            for kwargs in options:
                with self.subTest(kwargs=kwargs), self.assertRaises(NotImplementedError):
                    self.python("pass", stdout=subprocess.PIPE, **kwargs)

    def test_rejected_credentials(self):
        for kwargs in ({"user": 0}, {"group": 0}, {"extra_groups": []}):
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                self.python("pass", **kwargs)

    def test_large_pipe_transfer(self):
        data = b"0123456789" * 20000
        result = self.python("import sys; data=sys.stdin.buffer.read(); "
                             "sys.stdout.buffer.write(data); "
                             "sys.stderr.buffer.write(data)",
                             input=data, capture_output=True, timeout=15, check=True)
        self.assertEqual(result.stdout, data)
        self.assertEqual(result.stderr, data)

    def test_signal_restore(self):
        with tempfile.TemporaryDirectory() as directory:
            executable = os.path.join(directory, "signal-probe")
            subprocess.run(["cc", str(Path(__file__).with_name("spawn-signals.c")),
                            "-o", executable], check=True)
            self.assertEqual(signal.getsignal(signal.SIGPIPE), signal.SIG_IGN)
            self.assertEqual(subprocess.check_output([executable]), b"default\n")
            self.assertEqual(subprocess.check_output([executable], restore_signals=False),
                             b"ignored\n")
            self.assertEqual(signal.getsignal(signal.SIGPIPE), signal.SIG_IGN)

    def test_failed_spawns_do_not_leak_descriptors(self):
        fd = os.open(os.devnull, os.O_RDONLY)
        os.close(fd)
        for _ in range(12):
            with self.assertRaises(FileNotFoundError):
                subprocess.run(["/missing-spawn-program"], stdin=subprocess.PIPE,
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        next_fd = os.open(os.devnull, os.O_RDONLY)
        try:
            self.assertEqual(fd, next_fd)
        finally:
            os.close(next_fd)


class DiagnosticResult(unittest.TextTestResult):
    def addError(self, test, err):
        error = err[1]
        if isinstance(error, subprocess.CalledProcessError):
            print("CPYTHON-SPAWN-ERROR", repr(error.cmd),
                  "returncode", error.returncode, file=sys.stderr)
            print("CPYTHON-SPAWN-STDOUT", repr(error.stdout), file=sys.stderr)
            print("CPYTHON-SPAWN-STDERR", repr(error.stderr), file=sys.stderr)
        super().addError(test, err)


if __name__ == "__main__":
    result = unittest.TextTestRunner(verbosity=2, resultclass=DiagnosticResult).run(
        unittest.defaultTestLoader.loadTestsFromTestCase(SpawnTests))
    if not result.wasSuccessful():
        raise SystemExit(1)
    print("CPYTHON-SPAWN-PASS")
