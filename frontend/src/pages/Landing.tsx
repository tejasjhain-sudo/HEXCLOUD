import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  Server, 
  Sparkles, 
  MessageSquare, 
  Headphones, 
  Globe, 
  Percent, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Network,
  Code,
  Lock,
  RefreshCw,
  Mail,
  Check,
  Gift,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Landing: React.FC = () => {
  // Calculator State
  const [calcCpu, setCalcCpu] = useState<number>(4);
  const [calcRam, setCalcRam] = useState<number>(8);
  const [calcStorage, setCalcStorage] = useState<number>(200);

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Email state for newsletter
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterSuccess, setNewsletterSuccess] = useState<boolean>(false);

  // Ping state simulation
  const [pings, setPings] = useState<{ [key: string]: number }>({
    'Silicon Valley, USA (US-West)': 14,
    'Frankfurt, Germany (EU-Central)': 76,
    'Tokyo, Japan (AP-Northeast)': 108,
    'Singapore (AP-Southeast)': 128
  });

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const refreshPings = () => {
    setPings({
      'Silicon Valley, USA (US-West)': Math.floor(Math.random() * 6) + 11,
      'Frankfurt, Germany (EU-Central)': Math.floor(Math.random() * 12) + 71,
      'Tokyo, Japan (AP-Northeast)': Math.floor(Math.random() * 18) + 102,
      'Singapore (AP-Southeast)': Math.floor(Math.random() * 22) + 120
    });
  };

  // Pricing math: CPU ($3.5/core) + RAM ($1.8/GB) + Storage ($0.08/GB)
  const calculatedMonthlyPrice = (calcCpu * 3.5) + (calcRam * 1.8) + (calcStorage * 0.08);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  const faqs = [
    {
      q: "What is HEXCloud VPS Hosting and how fast does it deploy?",
      a: "HEXCloud Virtual Private Servers are high-performance KVM Linux instances running on AMD EPYC processors. Our automated hypervisor orchestrator guarantees provisioning and full root SSH access within 5 seconds of purchase."
    },
    {
      q: "How does the GPU Cloud PC queue system operate?",
      a: "Because high-end NVIDIA RTX 4090 and RTX 3080 GPUs are heavily utilized, we run an automated FIFO queue. When you start a session, if all hardware slots are taken, you are placed in a queue. As soon as a slot is freed, you are automatically logged in with a persistent Parsec or Moonlight link."
    },
    {
      q: "Is there a minimum contract length or setup fee?",
      a: "No, all services are strictly pay-as-you-go or month-to-month. You can scale down, suspend, or terminate your VPS nodes at any point with zero early cancellation fees. GPU Cloud PCs are billed down to the second against your account wallet balance."
    },
    {
      q: "What type of customer support features do you offer?",
      a: "We offer 24/7/365 developer support. Free tier users get access to our community Discord channel, while Basic and Pro plan subscribers unlock ticketed technical support. Enterprise plans feature dedicated Slack integrations and guaranteed 15-minute response times from our senior system administrators."
    },
    {
      q: "How do I add credits to my account wallet?",
      a: "You can load credits securely using credit cards, Apple Pay, or Google Pay via our Stripe checkout form. There is a $5.00 minimum deposit, and credits do not expire as long as your account remains active."
    }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden select-none text-slate-800 font-sans">
      {/* Top Banner Offer Bar */}
      <div className="bg-indigo-600 text-white py-2.5 px-4 text-center text-xs font-bold relative z-20 flex items-center justify-center space-x-2 shadow-sm">
        <Gift className="h-4 w-4 text-emerald-300 shrink-0" />
        <span>Get Your Completely Free 2-Hour VPS Trial!</span>
        <span className="opacity-75 font-normal hidden sm:inline">No credit card or commitment required.</span>
        <Link to="/login" className="bg-white text-indigo-700 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wide hover:bg-slate-100 transition-colors shadow-sm ml-2">
          Claim Now
        </Link>
      </div>

      {/* Background Graphic Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.14),rgba(255,255,255,0))]" />
      
      {/* Soft Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Header / Nav */}
      <header className="relative z-10 mx-auto max-w-7xl px-6 py-6 flex items-center justify-between border-b border-slate-100 bg-white/60 backdrop-blur-md sticky top-0">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold tracking-wider">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">HEX</span>
            <span className="text-slate-800">Cloud</span>
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/login" className="text-xs font-black text-indigo-700 hover:opacity-95 transition-all flex items-center space-x-1 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full animate-pulse shadow-sm">
            <Gift className="h-3 w-3 text-indigo-600 shrink-0" />
            <span>2-Hr Free Trial</span>
          </Link>
          <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors hidden lg:block">Features</a>
          <a href="#specs" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors hidden lg:block">Hardware Specs</a>
          <a href="#calculator" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors hidden lg:block">Pricing Calculator</a>
          <a href="#compare" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors hidden lg:block">Compare Services</a>
          <a href="#network" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors hidden lg:block">Latency Test</a>
          <a href="#support" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors hidden lg:block">Support</a>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
            Sign In
          </Link>
          <Link
            to="/login"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.02]"
          >
            Deploy Now
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Release Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>KVM Hypervisors Live — GPU Cloud PCs in Beta</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-black tracking-tight sm:text-6xl text-slate-900 leading-tight"
            >
              High-Availability <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Linux VPS Hosting
              </span> <br />
              Built For Builders.
            </motion.h1>

            {/* Core product quick specifications info inside Hero */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 shadow-sm"
            >
              {/* VPS spec */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
                  <Server className="h-4 w-4" />
                  <span>KVM Linux VPS Nodes</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Dedicated vCPUs (AMD EPYC), up to 16GB RAM, and 500GB SSD storage. Deploys with root SSH in <strong>&lt; 5 seconds</strong>.
                </p>
                <div className="text-[10px] text-slate-500 font-bold font-mono">Starter Tier from $10/mo</div>
              </div>

              {/* Cloud PC spec — BETA */}
              <div className="space-y-1 relative">
                <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase shadow-sm">Beta</span>
                <div className="flex items-center space-x-2 text-purple-600 font-bold text-sm">
                  <Cpu className="h-4 w-4" />
                  <span>GPU Cloud PCs</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  NVIDIA RTX 4090 / RTX 3080 gaming & compute instances. Sunshine + Moonlight and Parsec streaming at <strong>4K, 120 FPS</strong>.
                </p>
                <div className="text-[10px] text-slate-500 font-bold font-mono">On-Demand from $0.80/hour · Early Access</div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/login"
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.03] transition-all"
              >
                <span>Deploy Instantly</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
              <a
                href="#calculator"
                className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
              >
                <span>Cost Calculator</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Right Visual Details: VPS Server Datacenter Rack Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 relative flex flex-col items-center"
          >
            {/* Ambient background glows */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-3xl opacity-25 blur-3xl -z-10" />

            {/* Premium Datacenter Visual Frame */}
            <div className="w-full bg-white rounded-3xl p-3.5 border border-slate-200 shadow-2xl overflow-hidden hover:scale-[1.01] transition-transform">
              <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 bg-slate-900 group">
                <img
                  src="/assets/vps_server_cluster.png"
                  alt="HEXCloud High-Availability KVM VPS datacenter hardware rack"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Floating Info Overlay to match high-tech vibe */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between text-white shadow-xl">
                  <div className="space-y-1">
                    <span className="bg-indigo-500 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">Active Infrastructure</span>
                    <h5 className="font-extrabold text-sm">Tier IV Datacenter — Noida, India</h5>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-emerald-400 font-bold flex items-center justify-end space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Uptime: 99.99%</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ping: 8ms avg</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION: Solutions Grid & Products (Inspired by User design, styled for Light Theme) */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-white">
        {/* Top Feature Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 pb-12 border-b border-slate-100 text-center md:text-left">
          <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Instant Deployment</h4>
              <p className="text-slate-500 text-xs mt-0.5">Deploy hypervisor server containers in under 5 seconds.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">99.9% Reliable Infrastructure</h4>
              <p className="text-slate-500 text-xs mt-0.5">Highly reliable physical hosting backplanes with redundant uplinks.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">24/7 Human Support</h4>
              <p className="text-slate-500 text-xs mt-0.5">Real system engineers to assist with custom network deployments.</p>
            </div>
          </div>
        </div>

        {/* Heading & Subheading */}
        <div className="text-center space-y-4 mb-16">
          <h3 className="text-3xl font-black text-slate-900">Powerful Solutions for Every Need</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">Choose the perfect plan for your journey</p>
        </div>

        {/* 4 Columns Solution Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 0: 2-Hour Free Trial VPS */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:scale-[1.01] hover:shadow-md transition-all relative overflow-hidden group">
            <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm">Instant</span>
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Gift className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-extrabold text-slate-900">2-Hour VPS Trial</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Fully-featured Linux VPS node with full root access. Zero commitment, no card required.</p>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 text-xs block">Completely Free</span>
                <span className="text-2xl font-black text-indigo-600 font-mono">₹0</span>
                <span className="text-slate-500 text-xs ml-1">/ 2 Hours</span>
              </div>
            </div>
            <Link
              to="/login"
              className="mt-8 flex items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-3 px-6 shadow-md transition-colors"
            >
              <span>Launch Free Trial</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card 1: VPS */}
          <div className="bg-white border-2 border-indigo-600 rounded-3xl p-8 shadow-lg shadow-indigo-50/50 flex flex-col justify-between hover:scale-[1.01] transition-transform relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-55 text-indigo-600">
                <Server className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-extrabold text-slate-900">VPS Hosting</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">High performance virtual servers for your applications.</p>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 text-xs block">Starting from</span>
                <span className="text-2xl font-black text-indigo-600 font-mono">₹199</span>
                <span className="text-slate-500 text-xs ml-1">/ month</span>
              </div>
            </div>
            <Link
              to="/login"
              className="mt-8 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 shadow-md transition-colors"
            >
              <span>Explore VPS</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card 2: Cloud PC */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:scale-[1.01] transition-transform relative overflow-hidden group">
            <span className="absolute top-4 right-4 bg-amber-400 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm">Beta</span>
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Cpu className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-extrabold text-slate-900">Cloud PC</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">GPU powered cloud desktops for gaming and productivity.</p>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 text-xs block">Starting from</span>
                <span className="text-2xl font-black text-purple-600 font-mono">₹99</span>
                <span className="text-slate-500 text-xs ml-1">/ session (4 Hours)</span>
              </div>
            </div>
            <Link
              to="/login"
              className="mt-8 flex items-center justify-center space-x-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 px-6 transition-colors"
            >
              <span>Explore Cloud PC</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card 3: Custom Solutions */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:scale-[1.01] transition-transform relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Shield className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-extrabold text-slate-900">Custom Solutions</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Need something custom? We've got you covered.</p>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 text-xs block">Contact our systems team</span>
                <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider block mt-1">Enterprise Grade</span>
              </div>
            </div>
            <Link
              to="/login"
              className="mt-8 flex items-center justify-center space-x-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 px-6 transition-colors"
            >
              <span>Contact Sales</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 1: How It Works Timeline */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-white">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">WORKFLOW</span>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
            Get Connected in 4 Easy Steps
          </h2>
          <p className="mx-auto max-w-xl text-slate-500 text-sm">
            Deploy secure virtual server nodes or run low-latency GPU desktop streams in under a minute.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="space-y-3 relative z-10 bg-white">
            <div className="text-5xl font-black text-indigo-100">01</div>
            <h4 className="font-bold text-slate-950 text-sm">Create Account</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Verify your email instantly using secure Supabase passwordless authentication links.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 relative z-10 bg-white">
            <div className="text-5xl font-black text-indigo-100">02</div>
            <h4 className="font-bold text-slate-950 text-sm">Load Stripe Credits</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Deposit credits using standard cards. Minimum deposit is $5.00. No contracts.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 relative z-10 bg-white">
            <div className="text-5xl font-black text-indigo-100">03</div>
            <h4 className="font-bold text-slate-950 text-sm">Configure Hardware</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Select CPU, RAM, and SSD storage sizes, or select a pre-installed Windows GPU template.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 relative z-10 bg-white">
            <div className="text-5xl font-black text-indigo-100">04</div>
            <h4 className="font-bold text-slate-950 text-sm">Access Secure Node</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Connect via full root SSH for Linux VPS instances, or Moonlight/Parsec client for Windows.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: GPU Hardware Specs Compare table */}
      <section id="specs" className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-slate-50/50">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">GPU COMPUTING TIERS</span>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
            High-Performance GPU Hardware Specifications
          </h2>
          <p className="mx-auto max-w-xl text-slate-500 text-sm">
            Compare our available bare-metal GPU accelerators optimized for machine learning, gaming, and 3D rendering.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-4 sm:p-5">GPU Type</th>
                <th className="p-4 sm:p-5">Dedicated VRAM</th>
                <th className="p-4 sm:p-5">vCPU Allocation</th>
                <th className="p-4 sm:p-5">CUDA Cores</th>
                <th className="p-4 sm:p-5">Usage Rate</th>
                <th className="p-4 sm:p-5">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 sm:p-5 font-bold text-slate-950">NVIDIA RTX 3080</td>
                <td className="p-4 sm:p-5">10 GB GDDR6X</td>
                <td className="p-4 sm:p-5">8 Cores</td>
                <td className="p-4 sm:p-5">8,704 Cores</td>
                <td className="p-4 sm:p-5 text-indigo-600 font-bold font-mono">$0.80 / hr</td>
                <td className="p-4 sm:p-5">1080p / 1440p gaming, basic video encoding</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 sm:p-5 font-bold text-slate-950">NVIDIA RTX 4090</td>
                <td className="p-4 sm:p-5">24 GB GDDR6X</td>
                <td className="p-4 sm:p-5">16 Cores</td>
                <td className="p-4 sm:p-5">16,384 Cores</td>
                <td className="p-4 sm:p-5 text-indigo-600 font-bold font-mono">$1.20 / hr</td>
                <td className="p-4 sm:p-5">4K Ultra gaming, complex Blender 3D rendering</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 sm:p-5 font-bold text-slate-950">NVIDIA A10G Tensor Core</td>
                <td className="p-4 sm:p-5">24 GB GDDR6</td>
                <td className="p-4 sm:p-5">12 Cores</td>
                <td className="p-4 sm:p-5">9,216 CUDA / 288 Tensor</td>
                <td className="p-4 sm:p-5 text-indigo-600 font-bold font-mono">$1.50 / hr</td>
                <td className="p-4 sm:p-5">AI LLM training, PyTorch pipelines, stable diffusion</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Capabilities: What Can We Do Section */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-white">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">CAPABILITIES</span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-slate-900">
            What Can You Do on HEXCloud?
          </h2>
          <p className="mx-auto max-w-xl text-slate-500">
            A developer-first suite designed to deploy web services, render 3D animation, and orchestrate deep learning pipelines.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:scale-[1.02] transition-transform">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white mb-4">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-950 mb-2">Deploy VPS Nodes</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Launch public-facing virtual machines running Ubuntu or Debian Server. Configure customized limits for CPU cores, RAM capacities, and storage.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:scale-[1.02] transition-transform">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-950 mb-2">GPU Compute & Gaming</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Stream high-performance remote desktop workloads directly in your browser or client using Moonlight/Parsec protocols.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:scale-[1.02] transition-transform">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white mb-4">
              <Terminal className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-950 mb-2">Direct DB Orchestrations</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Sync user states and trigger simulated infrastructure lifecycle modifications natively using Supabase PostgreSQL hooks.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:scale-[1.02] transition-transform">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white mb-4">
              <Network className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-950 mb-2">Edge Routing & CDN</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Deliver low-latency streaming endpoints to users worldwide using optimized static routing pathways.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Supported OS templates list */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-slate-50/50">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">OS TEMPLATE LIBRARY</span>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
            Pre-Configured Operating System Templates
          </h2>
          <p className="mx-auto max-w-xl text-slate-500 text-sm">
            Launch instances with popular Linux distributions and specialized Windows remote-desktop presets.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          {/* Item 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex flex-col items-center space-y-2">
            <span className="text-2xl font-black text-indigo-600">Ubuntu</span>
            <span className="text-[10px] text-slate-400 font-mono">24.04 LTS / 22.04 LTS</span>
          </div>
          {/* Item 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex flex-col items-center space-y-2">
            <span className="text-2xl font-black text-indigo-600">Debian</span>
            <span className="text-[10px] text-slate-400 font-mono">Debian 12 / 11 Bookworm</span>
          </div>
          {/* Item 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex flex-col items-center space-y-2">
            <span className="text-2xl font-black text-indigo-600">Rocky Linux</span>
            <span className="text-[10px] text-slate-400 font-mono">Rocky 9.4 (RHEL compatible)</span>
          </div>
          {/* Item 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex flex-col items-center space-y-2">
            <span className="text-2xl font-black text-purple-600">Windows PC</span>
            <span className="text-[10px] text-slate-400 font-mono">Pre-Configured Sunshine</span>
          </div>
          {/* Item 5 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex flex-col items-center space-y-2">
            <span className="text-2xl font-black text-purple-600">Windows Server</span>
            <span className="text-[10px] text-slate-400 font-mono">2022 Standard R2</span>
          </div>
        </div>
      </section>

      {/* SECTION 4: Developer CLI Mockup */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-white">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-4 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">DEVELOPER TOOLING</span>
            <h2 className="text-3xl font-black text-slate-900">
              Deploy VMs Programmatically via HEXCloud CLI
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Use our curl hooks or download our custom command-line interface tool to spin up server nodes in seconds. Build scripts to scale storage partitions up and down automatically.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Code className="h-4.5 w-4.5 text-indigo-600" />
              <span>Full API keys generated in User Profile.</span>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 text-slate-200 shadow-2xl font-mono text-xs text-left relative overflow-hidden">
            {/* Terminal bar */}
            <div className="flex items-center space-x-1.5 pb-4 border-b border-slate-800 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-500 pl-2">Bash Terminal</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-emerald-400">~/hexcloud</span> $ npm install -g @hexcloud/cli
              </div>
              <div className="text-slate-500">
                + @hexcloud/cli@1.2.0 installed successfully
              </div>
              <div>
                <span className="text-emerald-400">~/hexcloud</span> $ hexcloud authenticate --token hc_sec_99a8b1...
              </div>
              <div className="text-emerald-400">
                ✓ Authentication successful. Connected as developer@company.com
              </div>
              <div>
                <span className="text-emerald-400">~/hexcloud</span> $ hexcloud deploy --cpu 4 --ram 8 --storage 150 --os ubuntu-24.04
              </div>
              <div className="text-slate-300">
                &gt; Allocating hypervisor nodes...<br />
                &gt; Generating unique IPv4 address: <span className="text-indigo-400">185.220.101.44</span><br />
                &gt; Booting Linux container...<br />
                <span className="text-emerald-400">✓ Deployment finished in 4.87s. Run: ssh root@185.220.101.44</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Price Estimator */}
      <section id="calculator" className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-slate-50/40">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Text details */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">COST CALCULATOR</span>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">
              Design Your Perfect Node & Control Your Spending
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Use our interactive resource sliders to customize your virtual machine cores, memory size, and storage allocation. Pricing updates immediately. No hidden system fees, no unexpected billing surprises.
            </p>
            <div className="bg-white p-4 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed flex items-center space-x-3">
              <Percent className="h-5 w-5 text-indigo-600 shrink-0" />
              <span>Need larger GPU clusters or enterprise dedicated instances? Contact our system administrators.</span>
            </div>
          </div>

          {/* Slider Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-4">
              {/* CPU slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>vCPU Cores</span>
                  <span className="text-indigo-600 font-mono">{calcCpu} Cores</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={calcCpu}
                  onChange={(e) => setCalcCpu(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                />
              </div>

              {/* RAM slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Memory RAM</span>
                  <span className="text-indigo-600 font-mono">{calcRam} GB</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="64"
                  value={calcRam}
                  onChange={(e) => setCalcRam(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                />
              </div>

              {/* Disk slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>NVMe SSD Storage</span>
                  <span className="text-indigo-600 font-mono">{calcStorage} GB</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={calcStorage}
                  onChange={(e) => setCalcStorage(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                />
              </div>
            </div>

            {/* Calculations Banner */}
            <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-medium">Estimated Monthly Investment</span>
                <div className="flex items-baseline text-slate-950">
                  <span className="text-3xl font-black text-indigo-600 font-mono">${calculatedMonthlyPrice.toFixed(2)}</span>
                  <span className="text-slate-500 text-xs ml-1">/ month</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Approx. ${(calculatedMonthlyPrice / 730).toFixed(4)} / hour</span>
              </div>

              <Link
                to="/login"
                className="flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 shadow-md shadow-indigo-100 transition-all hover:scale-[1.02]"
              >
                <span>Deploy This Spec</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: Compare HEXCloud vs AWS / DigitalOcean */}
      <section id="compare" className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-white">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">COMPARISON</span>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
            Why Developers Prefer HEXCloud
          </h2>
          <p className="mx-auto max-w-xl text-slate-500 text-sm">
            We built a streamlined alternative to complex, bloated cloud hosts. Pay only for what you run.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-4 sm:p-5">Feature</th>
                <th className="p-4 sm:p-5 text-indigo-600">HEXCloud</th>
                <th className="p-4 sm:p-5">DigitalOcean</th>
                <th className="p-4 sm:p-5">AWS EC2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 sm:p-5 font-bold text-slate-950">4 Core / 8GB RAM VPS</td>
                <td className="p-4 sm:p-5 text-indigo-600 font-bold font-mono">$25 / mo</td>
                <td className="p-4 sm:p-5">$48 / mo</td>
                <td className="p-4 sm:p-5">$62 / mo</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 sm:p-5 font-bold text-slate-950">VM Deployment Time</td>
                <td className="p-4 sm:p-5 text-indigo-600 font-bold flex items-center space-x-1"><Check className="h-4 w-4 text-emerald-500" /> <span>&lt; 5 seconds</span></td>
                <td className="p-4 sm:p-5">~ 55 seconds</td>
                <td className="p-4 sm:p-5">~ 2.5 minutes</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 sm:p-5 font-bold text-slate-950">High-end GPUs (RTX 4090)</td>
                <td className="p-4 sm:p-5 text-indigo-600 font-bold flex items-center space-x-1"><Check className="h-4 w-4 text-emerald-500" /> <span>On-Demand ($1.20/hr)</span></td>
                <td className="p-4 sm:p-5">Not Available</td>
                <td className="p-4 sm:p-5">Quota Request Required ($2.20+/hr)</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 sm:p-5 font-bold text-slate-950">Database Sync</td>
                <td className="p-4 sm:p-5 text-indigo-600 font-bold flex items-center space-x-1"><Check className="h-4 w-4 text-emerald-500" /> <span>Native Supabase client</span></td>
                <td className="p-4 sm:p-5">Custom API Only</td>
                <td className="p-4 sm:p-5">AWS RDS Complex Configuration</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Global Network Section */}
      <section id="network" className="relative z-10 mx-auto max-w-7xl px-6 py-24 border-t border-slate-100 bg-slate-50/40">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Latency card lists */}
          <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5">
                  <Globe className="h-4 w-4 text-indigo-600" />
                  <span>Datacenter Latency Monitor</span>
                </span>
                <button
                  onClick={refreshPings}
                  className="text-[10px] text-indigo-600 font-bold hover:underline"
                >
                  Refresh Pings
                </button>
              </div>

              <div className="space-y-3 font-mono">
                {Object.keys(pings).map((loc) => (
                  <div key={loc} className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-sans">{loc}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-600 font-bold">{pings[loc]} ms</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Network text */}
          <div className="lg:col-span-6 space-y-4 text-left order-1 lg:order-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">LATENCY GATEWAYS</span>
            <h2 className="text-3xl font-black text-slate-900">
              High Bandwidth, Ultra-Low Latency Edges
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              We leverage direct peering connections and custom routing tables to deliver smooth remote desktop video streams. Connect directly to hardware nodes located across USA, Europe, and Asia with sub-50ms latency.
            </p>
            <ul className="text-slate-500 text-xs space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                <span>10 Gbps Uplink interfaces on every hypervisor</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                <span>Automated fallback routing nodes</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* SECTION 6: Security and DDOS compliance features */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-white">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Security description */}
          <div className="lg:col-span-6 space-y-4 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">SECURITY FIRST</span>
            <h2 className="text-3xl font-black text-slate-900">
              Robust Protection and Encrypted Data Volumes
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every virtual private server container is deployed inside an isolated kernel namespace with full end-to-end hardware-level virtualization.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-2 text-xs text-slate-600">
                <Lock className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-950">DDoS Mitigation</span>
                  <p>Up to 10 Gbps scrubbing capacity across all hypervisor backplanes.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 text-xs text-slate-600">
                <RefreshCw className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-950">Auto-Snapshots</span>
                  <p>Nightly filesystem backups with instant state rollback buttons.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security graphics mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-sm space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-bold text-slate-950 text-sm">Security Audit Report</span>
                  <div className="text-[10px] text-emerald-600 font-semibold uppercase">Uptime & Protection Active</div>
                </div>
              </div>
              <div className="space-y-3 font-mono text-[10px] text-slate-500 bg-slate-900 text-slate-200 p-4 rounded-xl">
                <div>[SYSTEM] Isolating container ID: hc_node_719</div>
                <div>[SYSTEM] SSH Key validation: PASSED</div>
                <div>[SYSTEM] Scrubbing network traffic: 0 threats detected</div>
                <div className="text-emerald-400 font-bold">[SECURITY] SLA Standard: 100% compliant</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7: Referral / Affiliate program marketing */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-slate-50/50">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">AFFILIATE PARTNERS</span>
            <h3 className="text-2xl font-black text-slate-950">HEXCloud Referral Program</h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg leading-relaxed">
              Invite your team members or developers to host their instances on HEXCloud. Get **$15.00 free credit** deposited to your wallet for each referral who registers and completes their first deposit.
            </p>
          </div>

          <Link
            to="/login"
            className="rounded-xl bg-white border border-slate-200 text-center py-3.5 px-6 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-sm shrink-0 transition-transform hover:scale-[1.02]"
          >
            Get Referral Link
          </Link>
        </div>
      </section>

      {/* Customer Support Features */}
      <section id="support" className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-white">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">CUSTOMER SUPPORT</span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-slate-900">
            24/7/365 Developer & Enterprise Support
          </h2>
          <p className="mx-auto max-w-xl text-slate-500 text-sm">
            We don't do automated AI chatbots. Get direct assistance from real human systems engineers, whenever you need it.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">15-Min Response Guarantee</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Subscribers on the Developer Pro tier receive ticket prioritizations. Our engineering queue responds to technical infrastructure queries in under 15 minutes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Headphones className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">24/7 Live Discord & Tickets</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Need assistance setting up SSH keys, debugging Parsec clients, or loading Stripe credits? Reach out to support tickets directly through the User Dashboard at any hour.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">99.99% Hardware SLA</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              If our hosting hypervisors suffer unexpected hardware downtime, we automatically refund credits to your wallet according to our Service Level Agreement guidelines.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-slate-50/40">
        <div className="text-center space-y-4 mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">PRICING TIERS</span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-slate-900">
            Straightforward, Predictable Pricing
          </h2>
          <p className="mx-auto max-w-xl text-slate-500">
            Choose a monthly VPS subscription or use pay-as-you-go GPU computing sessions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div className="space-y-4">
              <span className="text-xs text-indigo-600 font-bold tracking-wider uppercase">Starter</span>
              <div className="flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold">$10</span>
                <span className="text-slate-500 text-sm ml-1">/ month</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">VPS Basic Plan</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Perfect for simple APIs, staging sites, or lightweight container deployments.</p>
              <ul className="space-y-3 pt-4 text-sm text-slate-600 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>2 vCPUs / 4GB RAM</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>50GB NVMe storage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>Max 2 VPS active instances</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-8 block w-full rounded-xl border border-slate-200 bg-white text-center py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Plan 2: Pro */}
          <div className="bg-white border-2 border-indigo-600 rounded-2xl p-8 flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-xs font-bold text-white shadow-md">
              Most Popular
            </div>
            <div className="space-y-4">
              <span className="text-xs text-indigo-600 font-bold tracking-wider uppercase">Developer Pro</span>
              <div className="flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold">$25</span>
                <span className="text-slate-500 text-sm ml-1">/ month</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">VPS Pro Plan</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Designed for intensive web applications, compilation steps, or high-traffic backends.</p>
              <ul className="space-y-3 pt-4 text-sm text-slate-600 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>4 vCPUs / 8GB RAM</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>150GB NVMe storage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>Max 5 VPS active instances</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-8 block w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-center py-3 text-sm font-bold text-white hover:opacity-95 transition-all shadow-lg shadow-indigo-200"
            >
              Deploy Pro VPS
            </Link>
          </div>

          {/* Plan 3: Cloud PC — BETA */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative">
            <div className="absolute -top-3 left-6 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black text-amber-950 shadow-sm uppercase">Beta</div>
            <div className="space-y-4">
              <span className="text-xs text-indigo-600 font-bold tracking-wider uppercase">On-Demand GPU</span>
              <div className="flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold">$0.80</span>
                <span className="text-slate-500 text-sm ml-1">/ hour</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">Cloud PC Compute</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Run heavy machine learning models, 3D renders, or play high-end games at 4K. <strong className="text-amber-600">Currently in Beta.</strong></p>
              <ul className="space-y-3 pt-4 text-sm text-slate-600 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>NVIDIA RTX 3080 & RTX 4090</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>Dedicated GPU memory & 16 vCPUs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <span>Pay-as-you-go wallet deduction</span>
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="mt-8 block w-full rounded-xl border border-slate-200 bg-white text-center py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Join Queue
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="relative z-10 mx-auto max-w-4xl px-6 py-20 border-t border-slate-100 bg-slate-50/40">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-mono">FAQ</span>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-xl text-slate-500 text-xs">
            Quick solutions to our most common customer deployment and billing inquiries.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaqIndex === i ? (
                  <ChevronUp className="h-5 w-5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500 shrink-0" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {openFaqIndex === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8: Newsletter Signup */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-20 border-t border-slate-100 bg-white">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Mail className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-950">HEXCloud Systems Newsletter</h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
              Get notified of hypervisor OS releases, NVIDIA cluster provisioning windows, and credit discount events.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your professional email..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-600 font-semibold"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md shadow-indigo-100"
            >
              Subscribe
            </button>
          </form>

          {newsletterSuccess && (
            <span className="text-xs text-emerald-600 font-bold block">
              ✓ Success! Check your inbox for confirmation links.
            </span>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-100 bg-slate-50/30">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 space-y-4 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">REVIEWS</span>
            <h2 className="text-3xl font-black text-slate-900">
              Trusted by Developers Worldwide
            </h2>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Read how developers, machine learning researchers, and remote gamers are utilizing HEXCloud’s resources.
            </p>
          </div>

          <div className="lg:col-span-8 grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 bg-white">
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "We transitioned our backup staging APIs to HEXCloud VPS. The 5-second boot time isn't a marketing gimmick—it actually works. The light mode console is beautiful."
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <span className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">MK</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">Marcus K.</div>
                  <div className="text-[10px] text-slate-500">Senior DevOps, VeloTech</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 bg-white">
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "Running 3D renders on their RTX 4090 GPU nodes saves me thousands in local hardware upgrades. Having customer support that replies in minutes makes a huge difference."
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <span className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">SL</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">Sarah L.</div>
                  <div className="text-[10px] text-slate-500">Freelance 3D Artist</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center mb-12">
        <div className="rounded-3xl p-12 bg-gradient-to-tr from-slate-900 to-indigo-950 flex flex-col items-center space-y-6 text-white shadow-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to deploy your next node?</h2>
          <p className="max-w-xl text-slate-300 text-sm">Create an account, verify your details, load credits, and access your cloud instances under 60 seconds.</p>
          <Link
            to="/login"
            className="flex items-center space-x-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-indigo-950 shadow-lg hover:scale-105 transition-all"
          >
            <span>Create Free Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Expanded Directory Footer */}
      <footer className="relative z-10 border-t border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-xs text-slate-600">
          <div className="space-y-3">
            <h5 className="font-bold text-slate-900">Products</h5>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-indigo-600">Linux VPS Nodes</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600">GPU Cloud PCs <span className="text-[8px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-bold uppercase ml-1">Beta</span></Link></li>
              <li><Link to="/login" className="hover:text-indigo-600">Dedicated Clusters</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h5 className="font-bold text-slate-900">Customer Support</h5>
            <ul className="space-y-2">
              <li><a href="#support" className="hover:text-indigo-600">System Status SLA</a></li>
              <li><a href="#support" className="hover:text-indigo-600">Documentation Guides</a></li>
              <li><a href="#support" className="hover:text-indigo-600">Open Tickets Portal</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h5 className="font-bold text-slate-900">Estimators</h5>
            <ul className="space-y-2">
              <li><a href="#calculator" className="hover:text-indigo-600">Resource Calculator</a></li>
              <li><a href="#network" className="hover:text-indigo-600">Datacenter Latency</a></li>
              <li><a href="#pricing" className="hover:text-indigo-600">Billing Tiers</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h5 className="font-bold text-slate-900">HEXCloud Systems</h5>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Developing high performance, decentralized hypervisor orchestrators and virtual computing endpoints.
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} HEXCloud Systems, Inc. All rights reserved. 99.99% Uptime Guarantee.</p>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
