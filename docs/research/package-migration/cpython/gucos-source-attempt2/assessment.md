# CPython diagnostic source attempt 2

The frozen diagnostic source at 66db2cba37d3b3e638a498e4b2ee12c91c07d438
failed its full subprocess suite on runtime 19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441.
Compilation, generated sysconfig, smoke and atomic checks passed. Fifteen of
sixteen subprocess tests passed, including the preserved signal fixture.

The failing PATH=. symlink launch now retains its captured stderr: program
name is spawn-python, sys.executable and sys._base_executable are empty,
stdlib lookup falls back to /usr/local/lib/python3.14, and initialization
fails importing encodings. This establishes the child initialization failure;
the underlying path-discovery cause still requires source diagnosis.
The later explicit relative executable case was not reached. No test was
skipped and no installed stdlib was seeded as a workaround. No export,
installed/reload acceptance or publication follows from this run.
