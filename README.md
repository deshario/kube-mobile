# Kube Mobile

View Kubernetes pod logs from your phone over local WiFi.

## Screenshots

![Cluster Selection](https://i.gyazo.com/6dd8a3453244280076733be9b45fbb76.png)

![Namespace Input](https://i.gyazo.com/3191e4175b030a393f2de161f38fb007.png)

![Pod List](https://i.gyazo.com/2895b67492704d708f7d5e150166a1a2.png)

![Log Viewer](https://i.gyazo.com/40ebe0edecfa32569bd2ef01be1dab9d.png)

![Mobile View 1](https://i.gyazo.com/c13737631c198c80a7c1200c09f497ca.png)

![Mobile View 2](https://i.gyazo.com/3404560ae1697761d00032a6b2243592.png)

## Features

- **Real-time log streaming** - WebSocket-based live tail of pod logs
- **Multi-cluster support** - Switch between different Kubernetes contexts
- **Pod search** - Find pods by name within a namespace
- **SDM integration** - Works with StrongDM for secure cluster access
- **Remote reconnect** - Reconnect SDM from your phone if it disconnects
- **Mobile-optimized UI** - Touch-friendly interface built with Material UI
- **System theme** - Automatically matches your device's light/dark mode
- **Log controls** - Pause, resume, clear, and copy logs

## Requirements

- Mac with kubectl configured
- StrongDM (sdm) for cluster access
- Phone on the same WiFi network
- Node.js 18+ and pnpm

## Quick Start

```bash
pnpm install
pnpm dev
```

Find your Mac's IP address:

```bash
ipconfig getifaddr en0
```

Open `http://<your-mac-ip>:5173` on your phone.