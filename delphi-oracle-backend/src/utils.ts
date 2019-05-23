import { networkInterfaces, NetworkInterfaceInfo } from 'os'

export function getInterfaces() {
  const ifaces: any = networkInterfaces()
  const resultIfaces: any = {}
  Object.keys(ifaces).map((ifname: string) => {
    let alias = 0
    const w = ifaces[ifname].map((iface: NetworkInterfaceInfo) => {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        return
      }
      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        resultIfaces[`${ifname}:${alias}`] = iface.address
      } else {
        // this interface has only one ipv4 adress
        resultIfaces[ifname] = iface.address
      }
    })
  })
  return resultIfaces
}
