# stackblitz-fuel-tracker

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/KuzikevichDavid/stackblitz-fuel-tracker)

# EAS 

## evironment variables

- add a variable

```powershell
eas env
```

 - remove variable

```powershell
eas env:delete
```

## make development build

 - config 

```bash
eas build:configure
```

 - login to sevices

```bash
eas login
```

 - command to create development build

```bash
eas build -p android --profile development
```

## build local ".apk"

```bash
eas build -p android --profile local
```