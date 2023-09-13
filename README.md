# ZephIR-KIOSK
Minimal electron browser for embedding in [NeuroPAL_ID](https://github.com/Yemini-Lab/NeuroPAL_ID). This is not for general use, it's a hacky workaround for a niche problem that Mathworks will hopefully solve for us someday.

## Background
ZephIR-KIOSK is a javascript application we developed to allow us to pseudo-embed web pages in MATLAB uifigures. Ideally this will eventually be replaced by an expanded web() call or analogous AppDesigner component Mathworks develops sometime in the future. Structurally it's essentially a minimal electron browser with some custom end points that allow us to manipulate browser input and page-based js code execution from within MATLAB.

## Dependencies
```
npm install yargs ws http node-ffi-napi ref-napi ffi-napi express electron
npm install electron-packager -g
```

## Compilation
Since we should strive to make using NeuroPAL_ID as simple as possible and not require installing nodejs and ZephIR-KIOSK's various dependencies, we compile the browser as such:

```
cd zephir-kiosk
npx electron-packager . wrap-browser --overwrite
```

## Usage

### Windows
`start wrap-browser.exe x y width height --trace-warnings`

### MacOS
`wrap-browser.app x y width height --trace-warnings`

## Endpoints

- **Updating browser position:** `http://localhost:port/updatePosition?x=%.f&y=%.f&width=%.f&height=%.f`
- **Emulating keystrokes:** `http://localhost:port/textInput?input=keystrokes`
- **Select elements:** `http://localhost:port/selectElement?class=targetcssclass`
- **Execute javascript:** `http://localhost:port/executeJS?code=jscode`
- **Remote procedure calls:** `http://localhost:port/rpc?method=method&state=state&arg=arg`

Note that inputs must be URL-encoded, i.e. replace spaces with `%20`, newlines with `%0A`, and slashes with `%2F`.
