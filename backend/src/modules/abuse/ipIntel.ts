/** Basic VPN/proxy/Tor heuristics via ip-api.com (free tier, non-commercial). */
export async function checkIpRisk(ip: string): Promise<{
  risky: boolean;
  reasons: string[];
}> {
  if (!ip || ip === '127.0.0.1' || ip.startsWith('::')) {
    return { risky: false, reasons: [] };
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,proxy,hosting,mobile`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return { risky: false, reasons: [] };
    const data = (await res.json()) as {
      status?: string;
      proxy?: boolean;
      hosting?: boolean;
    };
    if (data.status !== 'success') return { risky: false, reasons: [] };

    const reasons: string[] = [];
    if (data.proxy) reasons.push('proxy_or_tor');
    if (data.hosting) reasons.push('datacenter_ip');

    return { risky: reasons.length > 0, reasons };
  } catch {
    return { risky: false, reasons: [] };
  }
}
