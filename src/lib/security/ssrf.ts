import dnsPromises from "dns/promises";
import type { LookupAddress } from "dns";
import net from "net";

/**
 * Checks if an IPv4 address belongs to private, loopback, link-local,
 * metadata, multicast, or reserved ranges.
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // invalid format considered dangerous
  }

  const [a, b, c, d] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (Private)
  if (a === 10) return true;

  // 100.64.0.0/10 (Shared address / CGNAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-local, AWS/GCP metadata)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Private 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0 && c === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && c === 2) return true;

  // 192.88.99.0/24 (6to4 Relay)
  if (a === 192 && b === 88 && c === 99) return true;

  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;

  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && c === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && c === 113) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved)
  if (a >= 240) return true;

  // 255.255.255.255 (Broadcast)
  if (a === 255 && b === 255 && c === 255 && d === 255) return true;

  return false;
}

/**
 * Checks if an IPv6 address belongs to loopback, link-local, unique local,
 * or IPv4-mapped IPv6 private ranges.
 */
export function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback (::1) or Unspecified (::)
  if (normalized === "::1" || normalized === "::") return true;

  // IPv4-mapped IPv6 (::ffff:192.168.1.1)
  if (normalized.startsWith("::ffff:")) {
    const ipv4Part = normalized.substring(7);
    if (net.isIPv4(ipv4Part)) {
      return isPrivateIPv4(ipv4Part);
    }
    return true;
  }

  // Unique local address (fc00::/7 -> starts with fc or fd)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  // Link-local address (fe80::/10 -> starts with fe8, fe9, fea, feb)
  if (
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  ) {
    return true;
  }

  // Multicast (ff00::/8)
  if (normalized.startsWith("ff")) return true;

  return false;
}

/**
 * Checks if any IP address is private/reserved.
 */
export function isPrivateIP(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) {
    return isPrivateIPv4(ip);
  }
  if (version === 6) {
    return isPrivateIPv6(ip);
  }
  return true; // Not a valid IP is treated as unsafe
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "169.254.169.254",
  "metadata.google.internal",
  "instance-data",
  "metadata",
]);

const BLOCKED_EXTENSIONS = [
  ".local",
  ".internal",
  ".localhost",
  ".arpa",
  ".lan",
  ".home",
  ".corp",
];

/**
 * Validates a URL against SSRF vulnerabilities:
 * - Must be HTTPS
 * - Hostname check
 * - DNS resolution to ensure none of the resolved IPs are in private/internal networks
 */
export async function validateSafeUrl(urlStr: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS URLs are permitted for security");
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check against static blocked hosts
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new Error(`Access to hostname '${hostname}' is restricted`);
  }

  for (const ext of BLOCKED_EXTENSIONS) {
    if (hostname.endsWith(ext)) {
      throw new Error(`Access to internal domain '${hostname}' is restricted`);
    }
  }

  // Direct IP address in hostname
  if (net.isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new Error("Access to private/local IP addresses is forbidden");
    }
    return parsed;
  }

  // DNS lookup to inspect resolved IPs
  let resolvedRecords: LookupAddress[];
  try {
    resolvedRecords = await dnsPromises.lookup(hostname, { all: true });
  } catch (err: any) {
    throw new Error(`DNS resolution failed for hostname '${hostname}': ${err.message}`);
  }

  if (!resolvedRecords || resolvedRecords.length === 0) {
    throw new Error(`No DNS records found for host '${hostname}'`);
  }

  for (const record of resolvedRecords) {
    if (isPrivateIP(record.address)) {
      throw new Error(
        `Hostname '${hostname}' resolves to restricted IP address (${record.address})`
      );
    }
  }

  return parsed;
}
