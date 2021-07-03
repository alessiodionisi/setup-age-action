# Setup age

This action sets up [age](https://github.com/FiloSottile/age) and adds it to the PATH.

## Usage

Basic:

```yaml
steps:
  - uses: adnsio/setup-age-action@v1
  - run: age --version
```

Specific version:

```yaml
steps:
  - uses: adnsio/setup-age-action@v1
    with:
      version: 1.0.0-rc.3
  - run: age --version
```
