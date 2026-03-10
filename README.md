# Setup age

This action sets up [age](https://github.com/FiloSottile/age) and adds it to the PATH.

## Usage

Basic:

```yaml
steps:
  - uses: alessiodionisi/setup-age-action@v1.4.0
  - run: age --version
```

Specific version:

```yaml
steps:
  - uses: alessiodionisi/setup-age-action@v1.4.0
    with:
      version: ^1.3.0
  - run: age --version
```
