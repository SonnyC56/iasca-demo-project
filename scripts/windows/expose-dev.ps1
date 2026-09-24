<#
  Exposes the WSL2 Vite dev server (port 5173) to devices on your LAN (e.g. your phone).
  WSL2 NAT networking hides WSL ports from the network, and the WSL IP changes on reboot,
  so re-run this after restarting Windows or running `wsl --shutdown`.

  Usage (elevated PowerShell):  powershell -ExecutionPolicy Bypass -File scripts\windows\expose-dev.ps1
  Remove:                       powershell -ExecutionPolicy Bypass -File scripts\windows\expose-dev.ps1 -Remove
#>
param(
  [int[]]$Ports = @(5173),
  [switch]$Remove
)

$ErrorActionPreference = 'Stop'

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) { throw 'Run this script from an elevated (Administrator) PowerShell.' }

$ruleName = 'IASCA CRM dev server (WSL)'

foreach ($port in $Ports) {
  netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 2>$null | Out-Null
}

if ($Remove) {
  Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue | Remove-NetFirewallRule
  Write-Host 'Removed port proxy and firewall rule.'
  return
}

$wslIp = (wsl.exe hostname -I).Trim().Split(' ')[0]
if (-not $wslIp) { throw 'Could not determine the WSL IP address. Is WSL running?' }

foreach ($port in $Ports) {
  netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIp | Out-Null
}

if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP `
    -LocalPort $Ports -Profile Private | Out-Null
}

$lanIp = (Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq 'Up' } |
  Select-Object -First 1).IPv4Address.IPAddress

Write-Host "Forwarding port(s) $($Ports -join ', ') -> WSL $wslIp"
Write-Host "Open on your phone: http://${lanIp}:5173"
Write-Host 'Note: the firewall rule applies to Private networks; mark your Wi-Fi as Private if needed.'
