import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  Play, Square, RefreshCw, Terminal, Cpu, ArrowLeft, 
  ShieldAlert, Settings, Check, Copy, 
  Loader2, Server, Network, Shield, HardDrive, File, 
  Plus, Trash, Edit, Lock, Eye, EyeOff, PlusCircle
} from 'lucide-react';
import './VpsManage.theme.css';

export const VpsManage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { vpsList, fetchVps } = useStore();
  const isSandbox = id === 'hex-sandbox-32gb';

  // Core VPS States
  const [vpsName, setVpsName] = useState('HEX-TEST-32GB-NODE');
  const [isEditingName, setIsEditingName] = useState(false);
  const [vpsStatus, setVpsStatus] = useState<'RUNNING' | 'STOPPED' | 'RESTARTING'>('RUNNING');
  const [ipAddress, setIpAddress] = useState('185.190.140.55');
  const [osType, setOsType] = useState('Ubuntu 24.04 LTS');
  const [copiedIp, setCopiedIp] = useState(false);

  // Modals & Action States
  const [reinstallModal, setReinstallModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [storageModal, setStorageModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOs, setSelectedOs] = useState('Ubuntu 24.04 LTS');
  const [reinstallProgress, setReinstallProgress] = useState<number | null>(null);
  const [reinstallLogs, setReinstallLogs] = useState<string[]>([]);
  const [newRootPass, setNewRootPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [hostname, setHostname] = useState('hex-server-node');

  // Resource Monitor States
  const [cpuHistory, setCpuHistory] = useState<number[]>([15, 24, 20, 32, 45, 38, 25, 30, 48, 42, 55, 35, 28, 22, 19]);
  const [ramHistory, setRamHistory] = useState<number[]>([42, 44, 43, 45, 48, 47, 46, 45, 48, 49, 52, 48, 46, 45, 44]);
  const diskUsagePercent = 34;
  const [networkIn, setNetworkIn] = useState(1.4); // MB/s
  const [networkOut, setNetworkOut] = useState(0.6); // MB/s
  const [liveCpu, setLiveCpu] = useState(19);
  const [liveRam, setLiveRam] = useState(10.8); // GB

  // Firewall and Security States
  const [ddosEnabled, setDdosEnabled] = useState(true);
  const [firewallRules, setFirewallRules] = useState([
    { id: 'fw-1', port: 22, protocol: 'TCP', description: 'SSH Traffic' },
    { id: 'fw-2', port: 80, protocol: 'TCP', description: 'HTTP Web Traffic' },
    { id: 'fw-3', port: 443, protocol: 'TCP', description: 'HTTPS Web Traffic' },
  ]);
  const [newFwPort, setNewFwPort] = useState('');
  const [newFwProtocol, setNewFwProtocol] = useState<'TCP' | 'UDP'>('TCP');
  const [newFwDesc, setNewFwDesc] = useState('');
  
  // Whitelist States
  const [whitelistedIps, setWhitelistedIps] = useState<string[]>(['192.168.1.100', '185.110.12.44']);
  const [newWhitelistIp, setNewWhitelistIp] = useState('');

  // File Manager Sandbox States
  const [filesList, setFilesList] = useState([
    { name: 'index.js', size: '4.2 KB', type: 'JavaScript' },
    { name: 'package.json', size: '1.1 KB', type: 'JSON' },
    { name: 'docker-compose.yml', size: '2.5 KB', type: 'YAML' },
    { name: 'nginx.conf', size: '3.4 KB', type: 'Config' },
  ]);
  const [newFileName, setNewFileName] = useState('');

  // Backups Section States
  const [backups, setBackups] = useState([
    { id: 'bk-1', name: 'Auto-Daily Baseline', size: '2.4 GB', date: '2026-05-20 04:00' },
    { id: 'bk-2', name: 'Pre-deployment snapshot', size: '2.8 GB', date: '2026-05-18 16:32' },
  ]);
  const [autoBackupType, setAutoBackupType] = useState<'daily' | 'weekly'>('daily');

  // Terminal States
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'HEXCloud Secure Hypervisor Terminal Connection Established.',
    'Session bound to KVM Kubelet interface.',
    'Type: neofetch, htop, df -h, or clear.',
    ''
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVps();
  }, []);

  // Fetch actual data if available
  useEffect(() => {
    if (!isSandbox) {
      const realVps = vpsList.find((v) => v.id === id);
      if (realVps) {
        setVpsName(realVps.name);
        setIpAddress(realVps.ipAddress);
        setOsType(realVps.osType);
        setVpsStatus(realVps.status === 'RUNNING' ? 'RUNNING' : 'STOPPED');
      }
    }
  }, [id, vpsList]);

  // Telemetry real-time loops
  useEffect(() => {
    const interval = setInterval(() => {
      if (vpsStatus !== 'RUNNING') return;

      // CPU ticker
      setCpuHistory(prev => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const change = Math.floor(Math.random() * 14) - 7;
        const newVal = Math.max(5, Math.min(95, last + change));
        setLiveCpu(newVal);
        return [...next, newVal];
      });

      // RAM ticker
      setRamHistory(prev => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const change = Math.floor(Math.random() * 6) - 3;
        const newVal = Math.max(20, Math.min(90, last + change));
        setLiveRam(Number(((newVal / 100) * (isSandbox ? 32 : 4)).toFixed(1)));
        return [...next, newVal];
      });

      // Network bandwidth I/O
      setNetworkIn(Number((Math.random() * 4.2 + 0.1).toFixed(1)));
      setNetworkOut(Number((Math.random() * 1.8 + 0.05).toFixed(1)));
    }, 2000);

    return () => clearInterval(interval);
  }, [vpsStatus]);

  // Scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const copyIpAddress = () => {
    navigator.clipboard.writeText(ipAddress);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  // Lifecycle Commands with interactive loaders
  const triggerLifecycle = (action: 'START' | 'STOP' | 'RESTART' | 'FORCE_SHUTDOWN') => {
    setActionLoading(action);
    setTerminalHistory(prev => [...prev, `[SYSTEM] Processing ${action} hypervisor state...`]);

    setTimeout(() => {
      setActionLoading(null);
      if (action === 'STOP' || action === 'FORCE_SHUTDOWN') {
        setVpsStatus('STOPPED');
        setTerminalHistory(prev => [...prev, '[SYSTEM] ACPI power cycle shutdown success. Status: STOPPED.', '']);
      } else if (action === 'START') {
        setVpsStatus('RUNNING');
        setTerminalHistory(prev => [...prev, '[SYSTEM] Core hypervisor sockets online. Status: RUNNING.', '']);
      } else if (action === 'RESTART') {
        setVpsStatus('RESTARTING');
        setTerminalHistory(prev => [...prev, '[SYSTEM] Reset signal dispatched. Warm restart initialized...']);
        setTimeout(() => {
          setVpsStatus('RUNNING');
          setTerminalHistory(prev => [...prev, '[SYSTEM] Restart complete. Nodes operational.', '']);
        }, 1500);
      }
    }, 1200);
  };

  const handleReinstallSubmit = () => {
    setReinstallProgress(0);
    setReinstallLogs(['[1/5] Detaching persistent block storage...', '[1/5] Wiping hypervisor disk arrays...']);
    
    const steps = [
      { progress: 20, log: '[2/5] Hard partition clean success. Formatting ext4 partition...' },
      { progress: 50, log: `[3/5] Syncing OS root templates for ${selectedOs}...` },
      { progress: 75, log: '[4/5] Running base container packages and bootstrapping Kubelet SSH daemon...' },
      { progress: 100, log: '[5/5] Re-mapping public network port interface binds...' }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setReinstallProgress(step.progress);
        setReinstallLogs(prev => [...prev, step.log]);
        
        if (step.progress === 100) {
          setTimeout(() => {
            setReinstallProgress(null);
            setReinstallLogs([]);
            setReinstallModal(false);
            setOsType(selectedOs);
            setVpsStatus('RUNNING');
            setTerminalHistory([
              `Welcome to HEXCloud Secure Hypervisor Terminal`,
              `Node successfully re-imaged to ${selectedOs}!`,
              `Type a command to operate...`,
              ''
            ]);
          }, 1000);
        }
      }, (idx + 1) * 1000);
    });
  };

  // Terminal command prompt parser
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    let response: string[] = [];

    if (vpsStatus !== 'RUNNING') {
      response = ['[ERROR] Network target connection refused: Server is powered down.'];
    } else if (cmd === 'neofetch') {
      response = [
        `   /\\_/\\    root@${hostname}`,
        `  ( o.o )   --------------`,
        `   > ^ <    OS: ${osType}`,
        `            Kernel: 6.8.5-hex-virtual`,
        `            Uptime: 1 hour, 44 mins`,
        `            vCPU Cores: ${isSandbox ? 8 : 2}`,
        `            RAM Limit: ${isSandbox ? '32 GB' : '4 GB'}`,
        `            Storage Path: /dev/vda1 [${diskUsagePercent}%]`
      ];
    } else if (cmd === 'df -h') {
      response = [
        'Filesystem      Size  Used Avail Use% Mounted on',
        `/dev/vda1       ${isSandbox ? '250G' : '50G'}   ${Math.round((diskUsagePercent/100) * (isSandbox ? 250 : 50))}G  ${Math.round(((100-diskUsagePercent)/100) * (isSandbox ? 250 : 50))}G  ${diskUsagePercent}% /`,
        'tmpfs            16G     0   16G   0% /dev/shm'
      ];
    } else if (cmd === 'htop' || cmd === 'top') {
      response = [
        `Tasks: 35 total,  1 running, 34 sleeping`,
        `CPU Usage: [|||||||||||||||                 ${liveCpu}%]`,
        `RAM Usage: [||||||||||||||||||||||          ${liveRam} GB / ${isSandbox ? '32 GB' : '4 GB'}]`,
        '',
        '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
        '    1 root      20   0   18.4M   4.2M   2.5M S   0.0   0.0   0:00.15 systemd',
        '  112 root      20   0  145.2M  32.1M  22.4M S   1.2   0.2   0:15.10 python3 app.py'
      ];
    } else if (cmd === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    } else {
      response = [
        `bash: command not found: ${terminalInput}`,
        'Supported: neofetch, df -h, htop, clear'
      ];
    }

    setTerminalHistory(prev => [...prev, `root@${hostname}:~# ${terminalInput}`, ...response, '']);
    setTerminalInput('');
  };

  // Add / Remove Firewall Ports
  const addFirewallRuleHandler = (e: React.FormEvent) => {
    e.preventDefault();
    const portNum = parseInt(newFwPort);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) return;
    
    setFirewallRules(prev => [
      ...prev,
      {
        id: `fw-${Date.now()}`,
        port: portNum,
        protocol: newFwProtocol,
        description: newFwDesc || 'Custom Port Ingress'
      }
    ]);
    setNewFwPort('');
    setNewFwDesc('');
  };

  // Whitelist Allowed IP Handlers
  const addWhitelistIpHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhitelistIp.trim()) return;
    setWhitelistedIps(prev => [...prev, newWhitelistIp.trim()]);
    setNewWhitelistIp('');
  };

  // File Manager Handlers
  const addNewFileHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    setFilesList(prev => [
      ...prev,
      { name: newFileName.trim(), size: '0.5 KB', type: 'Source File' }
    ]);
    setNewFileName('');
  };

  // Create Snapshot Backup
  const triggerCreateBackup = () => {
    setActionLoading('backup');
    setTimeout(() => {
      setActionLoading(null);
      setBackups(prev => [
        {
          id: `bk-${Date.now()}`,
          name: `Manual Snapshot - ${new Date().toLocaleDateString()}`,
          size: `${(Math.random() * 1.5 + 1.5).toFixed(1)} GB`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        },
        ...prev
      ]);
    }, 1500);
  };

  // Expand Storage Simulator
  const handleExpandStorage = () => {
    setActionLoading('storage');
    setTimeout(() => {
      setActionLoading(null);
      setStorageModal(false);
      alert('Persistent NVMe Block Storage successfully expanded!');
    }, 1500);
  };

  // SVG Line Chart points drawer
  const getSvgPoints = (history: number[], max: number) => {
    const width = 500;
    const height = 80;
    return history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - (val / max) * height;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="vps-manage min-h-screen bg-slate-50 text-slate-800 py-10 px-6 font-sans relative overflow-hidden select-none">
      {/* Background neon radial arrays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(99,102,241,0.08),rgba(255,255,255,0))]" />

      <div className="mx-auto max-w-7xl relative z-10 space-y-10">
        {/* Navigation & Editable Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link to="/dashboard" className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-500">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Overview Dashboard</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3.5 mt-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={vpsName}
                  onChange={(e) => setVpsName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingName(false); }}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-1 text-2xl font-black text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">{vpsName}</h1>
                  <button onClick={() => setIsEditingName(true)} className="text-slate-500 hover:text-indigo-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              )}

              <span className={`inline-flex items-center space-x-1.5 rounded-full px-3 py-1 text-[10px] font-bold border uppercase tracking-wider ${
                vpsStatus === 'RUNNING' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                vpsStatus === 'RESTARTING' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 animate-pulse' :
                'bg-rose-500/10 text-rose-700 border-rose-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  vpsStatus === 'RUNNING' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' :
                  vpsStatus === 'RESTARTING' ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]' : 'bg-rose-500'
                }`} />
                <span>{vpsStatus}</span>
              </span>
            </div>
            
            <p className="text-slate-500 text-xs">
              Region: <span className="font-extrabold text-indigo-600">US-EAST (VIRT-VIRGINIA)</span> • Core Engine: QEMU KVM Hypervisor
            </p>
          </div>

          {/* Quick specs / copy IP pill */}
          <div className="flex items-center space-x-2 bg-white border border-slate-200/60 px-4 py-3 rounded-2xl shadow-sm">
            <Server className="h-5 w-5 text-indigo-500 shrink-0" />
            <div className="text-xs">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">IPv4 address</div>
              <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-900">
                <span>{ipAddress}</span>
                <button onClick={copyIpAddress} className="text-indigo-600 hover:text-indigo-500">
                  {copiedIp ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Live Telemetry Resource Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* CPU Stats */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm relative overflow-hidden group space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase">
              <span className="flex items-center space-x-1">
                <Cpu className="h-4 w-4 text-indigo-500" />
                <span>Processor Usage</span>
              </span>
              <span className="text-slate-900 font-mono font-black">{vpsStatus === 'RUNNING' ? `${liveCpu}%` : 'OFFLINE'}</span>
            </div>

            <div className="h-16 flex items-end overflow-hidden relative">
              {vpsStatus !== 'RUNNING' ? (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-200/80 rounded-xl">Node Stopped</div>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 500 80" preserveAspectRatio="none">
                  <path d={`M 0,80 L ${getSvgPoints(cpuHistory, 100)} L 500,80 Z`} fill="rgba(99,102,241,0.06)" />
                  <polyline fill="none" stroke="#6366f1" strokeWidth="2.5" points={getSvgPoints(cpuHistory, 100)} />
                </svg>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-bold">{isSandbox ? '8 Dedicated Cores' : '2 Core Compute Plane'}</div>
          </div>

          {/* RAM Stats */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm relative overflow-hidden group space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase">
              <span className="flex items-center space-x-1">
                <HardDrive className="h-4 w-4 text-purple-500" />
                <span>Memory Allocation</span>
              </span>
              <span className="text-slate-900 font-mono font-black">{vpsStatus === 'RUNNING' ? `${liveRam} GB` : 'OFFLINE'}</span>
            </div>

            <div className="h-16 flex items-end overflow-hidden relative">
              {vpsStatus !== 'RUNNING' ? (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-200/80 rounded-xl">Node Stopped</div>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 500 80" preserveAspectRatio="none">
                  <path d={`M 0,80 L ${getSvgPoints(ramHistory, 100)} L 500,80 Z`} fill="rgba(168,85,247,0.06)" />
                  <polyline fill="none" stroke="#a855f7" strokeWidth="2.5" points={getSvgPoints(ramHistory, 100)} />
                </svg>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-bold">Limit: {isSandbox ? '32768 MB (32 GB)' : '4096 MB'}</div>
          </div>

          {/* Disk Stats */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm relative overflow-hidden group space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase">
              <span className="flex items-center space-x-1">
                <File className="h-4 w-4 text-pink-500" />
                <span>Disk Partition</span>
              </span>
              <span className="text-slate-900 font-mono font-black">{diskUsagePercent}%</span>
            </div>

            {/* Horizontal Bar Visualizer */}
            <div className="h-16 flex flex-col justify-center space-y-2">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-200">
                <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" style={{ width: `${diskUsagePercent}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{Math.round((diskUsagePercent/100) * (isSandbox ? 250 : 50))} GB Used</span>
                <span>{isSandbox ? '250 GB' : '50 GB'} Total</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-bold">Storage Cluster: local-NVMe</div>
          </div>

          {/* Network In/Out */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm relative overflow-hidden group space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase">
              <span className="flex items-center space-x-1">
                <Network className="h-4 w-4 text-emerald-500" />
                <span>Net Outflow</span>
              </span>
              <span className="text-slate-900 font-mono font-black">{vpsStatus === 'RUNNING' ? `${networkIn} Mbps` : 'OFFLINE'}</span>
            </div>

            <div className="h-16 flex flex-col justify-center text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Bandwidth In:</span>
                <span className="font-mono text-slate-900">{vpsStatus === 'RUNNING' ? `${networkIn} MB/s` : '0.0 MB/s'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Bandwidth Out:</span>
                <span className="font-mono text-slate-900">{vpsStatus === 'RUNNING' ? `${networkOut} MB/s` : '0.0 MB/s'}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-bold">1 Gbps Port Speed</div>
          </div>
        </div>

        {/* Core Layout Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Controls, SSH console, Firewall, backups on Left Columns */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 2. Web SSH Terminal Console Access */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4 relative">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-3.5">
                <div className="flex items-center space-x-2">
                  <Terminal className="h-4.5 w-4.5 text-indigo-500" />
                  <span className="text-xs font-bold font-mono text-slate-700">Web Secure SSH Console</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span className="text-[10px] font-mono text-slate-500">TTY: /dev/pts/1</span>
                </div>
              </div>

              {/* TTY logs */}
              <div className="vps-terminal-screen bg-slate-900 border border-slate-700 rounded-2xl p-4.5 h-64 overflow-y-auto font-mono text-xs text-emerald-400 space-y-1.5 select-text">
                {terminalHistory.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap leading-relaxed">{line}</div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              <form onSubmit={handleTerminalSubmit} className="flex items-center space-x-2 pt-1 font-mono text-xs">
                <span className="text-indigo-400 font-bold">root@${hostname}:~#</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Type neofetch, htop, df -h, or clear..."
                  className="vps-terminal-input flex-1 bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-500"
                />
              </form>
            </div>

            {/* 3. Storage & Basic File Manager Sandbox */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <HardDrive className="h-5 w-5 text-indigo-400" />
                  <span>Storage & File Manager Sandbox</span>
                </h2>
                <button
                  onClick={() => setStorageModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Expand Storage
                </button>
              </div>

              {/* Disk Progress Allocator */}
              <div className="p-4 bg-white border border-slate-200/60 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Persistent NVMe Allocation Block</span>
                  <span className="text-indigo-400 font-mono">{diskUsagePercent}% Used</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-200">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${diskUsagePercent}%` }} />
                </div>
              </div>

              {/* Sandbox File Manager */}
              <div className="space-y-3.5">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Sandbox Root Directory: `/app`</span>
                
                {/* Upload simulation bar */}
                <form onSubmit={addNewFileHandler} className="flex gap-2">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Enter file name (e.g. index.css)"
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200/60 rounded-xl text-xs placeholder-gray-500 text-gray-800 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create File</span>
                  </button>
                </form>

                {/* File list */}
                <div className="space-y-2.5">
                  {filesList.map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-3.5 bg-white border border-slate-200/60 rounded-xl text-xs">
                      <div className="flex items-center space-x-2.5">
                        <File className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span className="font-extrabold text-slate-800">{file.name}</span>
                        <span className="text-[10px] text-slate-500 font-bold">({file.type})</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-mono text-slate-500">{file.size}</span>
                        <button
                          onClick={() => setFilesList(prev => prev.filter(f => f.name !== file.name))}
                          className="text-rose-500 hover:text-rose-400"
                        >
                          <Trash className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Network Security & Firewall rules */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-indigo-400" />
                  <span>Ingress Firewall Rules</span>
                </h2>
                
                {/* DDoS Toggle */}
                <div className="flex items-center space-x-2 bg-gray-100 px-3.5 py-1.5 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">DDoS Protection</span>
                  <button
                    onClick={() => setDdosEnabled(!ddosEnabled)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${ddosEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${ddosEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Rules lists */}
                <div className="space-y-3">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Active Port Openings</span>
                  <div className="space-y-2.5">
                    {firewallRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-800">Port {rule.port}</span>
                            <span className="bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-bold">{rule.protocol}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold">{rule.description}</div>
                        </div>
                        <button
                          onClick={() => setFirewallRules(prev => prev.filter(r => r.id !== rule.id))}
                          className="text-rose-500 hover:underline text-[10px] font-bold"
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add rule form */}
                <form onSubmit={addFirewallRuleHandler} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Allow Inbound Traffic</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={newFwPort}
                      onChange={(e) => setNewFwPort(e.target.value)}
                      placeholder="Port (1-65535)"
                      className="w-full px-3 py-2 bg-white border border-slate-200/60 text-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold"
                    />

                    <select
                      value={newFwProtocol}
                      onChange={(e: any) => setNewFwProtocol(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200/60 text-slate-800 rounded-xl text-xs focus:outline-none font-semibold text-slate-700"
                    >
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={newFwDesc}
                    onChange={(e) => setNewFwDesc(e.target.value)}
                    placeholder="Description (e.g. Node API)"
                    className="w-full px-3 py-2 bg-white border border-slate-200/60 text-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold"
                  />

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    Add Firewall Rule
                  </button>
                </form>
              </div>
            </div>

            {/* 5. Backups & Snapshots Section */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 backdrop-blur-md shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <ShieldAlert className="h-5 w-5 text-indigo-400" />
                  <span>Snapshots & Automated Backups</span>
                </h2>
                
                <button
                  onClick={triggerCreateBackup}
                  disabled={actionLoading === 'backup'}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm"
                >
                  {actionLoading === 'backup' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="h-4 w-4" />
                  )}
                  <span>Create Backup Snapshot</span>
                </button>
              </div>

              {/* Auto Backup Toggle */}
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-800">Scheduled Incremental Backups</span>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    HEXCloud automatically takes periodic snapshots of your SSD partition block.
                  </p>
                </div>

                <div className="flex items-center space-x-2 bg-white border border-slate-200/60 text-slate-800 px-2.5 py-1.5 rounded-xl shrink-0">
                  {['daily', 'weekly'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAutoBackupType(type as any)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        autoBackupType === type 
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Backups List */}
              <div className="space-y-3.5">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Historical Recovery Points</span>
                
                <div className="space-y-2.5">
                  {backups.map((bk) => (
                    <div key={bk.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs gap-3">
                      <div className="space-y-1">
                        <span className="font-extrabold text-slate-800">{bk.name}</span>
                        <div className="text-[10px] text-slate-500 font-mono font-semibold">Created: {bk.date} • Partition Size: {bk.size}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            alert(`Restoring instance state from backup point ${bk.name}...`);
                            triggerLifecycle('RESTART');
                          }}
                          className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] font-bold rounded-lg transition-all"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => setBackups(prev => prev.filter(b => b.id !== bk.id))}
                          className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-[10px] font-bold rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Controls, whitelist, hostname on Right Column */}
          <div className="space-y-6">
            
            {/* 6. VPS Controls Panel */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-200/60 pb-2 flex items-center space-x-2">
                <Settings className="h-4 w-4 text-indigo-400" />
                <span>Hypervisor Controls</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => triggerLifecycle('START')}
                  disabled={vpsStatus === 'RUNNING' || actionLoading !== null}
                  className="flex items-center justify-center space-x-1 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl transition-all disabled:opacity-30"
                >
                  {actionLoading === 'START' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 fill-emerald-400" />
                  )}
                  <span>Start</span>
                </button>

                <button
                  onClick={() => triggerLifecycle('STOP')}
                  disabled={vpsStatus === 'STOPPED' || actionLoading !== null}
                  className="flex items-center justify-center space-x-1 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl transition-all disabled:opacity-30"
                >
                  {actionLoading === 'STOP' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="h-4 w-4 fill-rose-400" />
                  )}
                  <span>Stop</span>
                </button>

                <button
                  onClick={() => triggerLifecycle('RESTART')}
                  disabled={vpsStatus === 'STOPPED' || actionLoading !== null}
                  className="flex items-center justify-center space-x-1 py-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-slate-700 rounded-xl transition-all disabled:opacity-30"
                >
                  {actionLoading === 'RESTART' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 text-indigo-400" />
                  )}
                  <span>Restart</span>
                </button>

                <button
                  onClick={() => triggerLifecycle('FORCE_SHUTDOWN')}
                  disabled={vpsStatus === 'STOPPED' || actionLoading !== null}
                  className="flex items-center justify-center space-x-1 py-3.5 bg-red-650/20 hover:bg-red-650/30 border border-red-500/30 text-red-400 rounded-xl transition-all disabled:opacity-30"
                >
                  <span>Force Kill</span>
                </button>
              </div>

              <button
                onClick={() => setReinstallModal(true)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Reinstall Operating System
              </button>
            </div>

            {/* Whitelisted Allowed IPs */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 backdrop-blur-md shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-200/60 pb-2 flex items-center space-x-2">
                <Shield className="h-4 w-4 text-indigo-400" />
                <span>Security Access Whitelist</span>
              </h3>

              <form onSubmit={addWhitelistIpHandler} className="flex gap-2">
                <input
                  type="text"
                  value={newWhitelistIp}
                  onChange={(e) => setNewWhitelistIp(e.target.value)}
                  placeholder="e.g. 192.168.1.1"
                  className="flex-1 px-3 py-2 bg-white border border-slate-200/60 text-slate-800 rounded-xl text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                >
                  Allow
                </button>
              </form>

              <div className="space-y-1.5 font-mono text-[11px] text-slate-400">
                {whitelistedIps.map((ip) => (
                  <div key={ip} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg">
                    <span>{ip}</span>
                    <button
                      onClick={() => setWhitelistedIps(prev => prev.filter(item => item !== ip))}
                      className="text-rose-500 hover:text-rose-400"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hostname & Host Settings */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 backdrop-blur-md shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-200/60 pb-2 flex items-center space-x-2">
                <Settings className="h-4 w-4 text-indigo-400" />
                <span>Node Configurations</span>
              </h3>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">VM Hostname</label>
                  <input
                    type="text"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200/60 text-slate-800 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <button
                  onClick={() => setPasswordModal(true)}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 hover:border-indigo-500 text-indigo-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5"
                >
                  <Lock className="h-4 w-4" />
                  <span>Update Root Password</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OS Reinstall Modal */}
      {reinstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="vps-modal-panel bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-black text-slate-900">Re-image OS Disk Partition</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Warning: Re-imaging completely sweeps clean your NVMe virtual sectors. This action is final.
            </p>

            {reinstallProgress === null ? (
              <div className="space-y-4">
                <select
                  value={selectedOs}
                  onChange={(e) => setSelectedOs(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200/60 text-slate-800 rounded-xl text-xs font-semibold focus:outline-none text-slate-600"
                >
                  <option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS</option>
                  <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS (Recommended)</option>
                  <option value="Debian 12 Bookworm">Debian 12 Bookworm</option>
                  <option value="CentOS Stream 9">CentOS Stream 9</option>
                  <option value="Windows Server 2022">Windows Server 2022</option>
                </select>

                <div className="flex justify-end space-x-3">
                  <button onClick={() => setReinstallModal(false)} className="text-xs font-bold text-slate-400">Cancel</button>
                  <button onClick={handleReinstallSubmit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl">Confirm Image OS</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Downloading Image files...</span>
                  <span className="font-mono text-indigo-400">{reinstallProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden border border-slate-200/60">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${reinstallProgress}%` }} />
                </div>
                <div className="vps-modal-log h-28 border border-slate-700 rounded-xl p-3 font-mono text-[9px] text-emerald-400 overflow-y-auto space-y-1">
                  {reinstallLogs.map((log, idx) => <div key={idx}>{log}</div>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Root Password Update Modal */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newRootPass.length < 8) {
                alert('Password must be at least 8 characters long.');
                return;
              }
              alert('Root administrator password successfully updated!');
              setPasswordModal(false);
              setNewRootPass('');
            }}
            className="vps-modal-panel bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
          >
            <h3 className="text-lg font-black text-slate-900">Reset VM Root Password</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Update SSH credential keys and lock/unlock system user level access.
            </p>

            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={newRootPass}
                onChange={(e) => setNewRootPass(e.target.value)}
                placeholder="Enter secure password (8 char min)"
                className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200/60 text-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => { setPasswordModal(false); setNewRootPass(''); }} className="text-xs font-bold text-slate-400">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm">Save Credentials</button>
            </div>
          </form>
        </div>
      )}

      {/* Expand Storage Modal */}
      {storageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="vps-modal-panel bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-black text-slate-900">Expand Block Storage Partition</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Upgrade disk limits from your pool instantly. Added charges will apply to your billing subscription.
            </p>

            <div className="p-4 bg-slate-100 border border-slate-200/60 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>Current Capacity:</span>
                <span className="font-mono text-slate-900">{isSandbox ? '250 GB' : '50 GB'}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>New Target Capacity:</span>
                <span className="font-mono text-indigo-400 font-black">{isSandbox ? '500 GB (Max)' : '150 GB'}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={() => setStorageModal(false)} className="text-xs font-bold text-slate-400">Cancel</button>
              <button
                onClick={handleExpandStorage}
                disabled={actionLoading === 'storage'}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm"
              >
                {actionLoading === 'storage' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Expand Block Disk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
