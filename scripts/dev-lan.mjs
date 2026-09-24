// Prints the URL (and a QR code) for opening the dev server on a phone on the same network.
import { execFileSync } from 'node:child_process'
import { networkInterfaces, release } from 'node:os'
import qrcode from 'qrcode-terminal'

const PORT = 5173
const isWsl = /microsoft/i.test(release())

function windowsLanIp() {
  try {
    const cmd =
      "(Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq 'Up' } | Select-Object -First 1).IPv4Address.IPAddress"
    return execFileSync('powershell.exe', ['-NoProfile', '-Command', cmd], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return undefined
  }
}

function localLanIp() {
  for (const addrs of Object.values(networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) return addr.address
    }
  }
  return undefined
}

const ip = (isWsl && windowsLanIp()) || localLanIp()
const scheme = process.env.DEV_HTTPS === '1' ? 'https' : 'http'

if (!ip) {
  console.warn('Could not detect a LAN IP address. Open the Network URL Vite prints instead.')
} else {
  const url = `${scheme}://${ip}:${PORT}`
  console.log(`\n📱 Open on your phone (same Wi-Fi): ${url}\n`)
  qrcode.generate(url, { small: true })
  if (isWsl) {
    console.log(
      '\nWSL2 detected: run scripts/windows/expose-dev.ps1 in an elevated PowerShell once per boot\n' +
        'so Windows forwards port 5173 to WSL.\n',
    )
  }
}
