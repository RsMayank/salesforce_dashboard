"use client";

// Dashboard.tsx — full Salesforce Dashboard UI with Login button
// Paste this into: frontend/components/Dashboard.tsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Area,
    AreaChart,
} from "recharts";

interface Opportunity {
    Id: string;
    Name: string;
    StageName: string;
    Amount: number | null;
    CloseDate: string;
    Owner?: {
        Name: string;
    };
}

interface DashboardData {
    totals: {
        totalRecords: number;
        totalPipeline: number;
    };
    byStage: Record<string, number>;
    monthlyTrend: Record<string, number>;
    records: Opportunity[];
    closedWon?: number;
    activeQuotes?: number;
    topProducts?: unknown[];
}

async function fetchOpportunities(): Promise<DashboardData> {
    const res = await fetch("http://localhost:3001/api/opportunities", {
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error: ${res.status} ${text}`);
    }

    return res.json();
}

function KpiCard({ title, value, icon, trend }: { title: string; value: string | number; icon?: React.ReactNode; trend?: string }) {
    return (
        <div className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-3xl p-6 w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</div>
                    <div className="mt-3 text-3xl font-bold text-slate-800">{value}</div>
                </div>
                {icon && <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">{icon}</div>}
            </div>
            {trend && <div className="mt-4 text-xs font-medium text-emerald-600 flex items-center gap-1">
                <span>↑</span> {trend} vs last month
            </div>}
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                <p className="font-semibold mb-1">{label}</p>
                <p>{`${payload[0].name} : ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const { data, error, isLoading, isError } = useQuery({
        queryKey: ["opps"],
        queryFn: fetchOpportunities,
        retry: false, // Don't retry on 401s so we can show login state immediately
    });

    const COLORS = [
        "#6366f1", // Indigo 500
        "#0ea5e9", // Sky 500
        "#10b981", // Emerald 500
        "#f59e0b", // Amber 500
        "#ef4444", // Red 500
        "#8b5cf6", // Violet 500
    ];

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-indigo-500 rounded-full mb-4"></div>
                    <div className="text-slate-400 font-medium">Loading Dashboard...</div>
                </div>
            </div>
        );
    }

    // If error (likely 401), show login screen
    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white shadow-2xl rounded-3xl p-12 max-w-md w-full text-center border border-slate-100">
                    <div className="mb-6 inline-flex p-4 bg-indigo-50 rounded-full text-indigo-600">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h1>
                    <p className="text-slate-500 mb-8">Please connect your Salesforce account to view the analytics dashboard.</p>
                    <button
                        onClick={() => (window.location.href = "http://localhost:3001/auth/login")}
                        className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        Login with Salesforce
                    </button>
                    <p className="mt-6 text-xs text-slate-400">Secure connection via Salesforce OAuth 2.0</p>
                </div>
            </div>
        );
    }

    // Ensure data is defined before accessing properties
    const safeData = data || {
        totals: { totalRecords: 0, totalPipeline: 0 },
        byStage: {},
        monthlyTrend: {},
        records: [],
        closedWon: 0,
        activeQuotes: 0
    };

    const totals = safeData.totals;
    const byStage = safeData.byStage;
    const monthlyTrend = safeData.monthlyTrend;
    const records = safeData.records;

    const pieData = Object.keys(byStage).map((k) => ({
        name: k,
        value: Number(byStage[k]),
    }));

    const lineData = Object.keys(monthlyTrend)
        .sort()
        .map((k) => ({ month: k, value: Number(monthlyTrend[k]) }));

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                            Salesforce Analytics
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Live Data
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                            {/* Placeholder Avatar */}
                            <svg className="w-full h-full text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* KPI CARDS */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard
                        title="Total Pipeline"
                        value={new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                        }).format(totals.totalPipeline || 0)}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        trend="+12.5%"
                    />
                    <KpiCard
                        title="Total Opportunities"
                        value={totals.totalRecords || 0}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                    />
                    <KpiCard
                        title="Closed Won"
                        value={new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                        }).format(safeData.closedWon || 0)}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <KpiCard
                        title="Active Quotes"
                        value={safeData.activeQuotes || 0}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                    />
                </section>

                {/* MAIN CHARTS */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="col-span-2 bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Revenue Trend</h3>
                            <select className="text-xs border-none bg-slate-100 rounded-lg px-2 py-1 text-slate-600 focus:ring-0 cursor-pointer">
                                <option>This Year</option>
                                <option>Last Year</option>
                            </select>
                        </div>
                        <div style={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={lineData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Pipeline by Stage</h3>
                        <div style={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                strokeWidth={0}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {pieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* LATEST OPPORTUNITIES TABLE */}
                <section className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800">Latest Opportunities</h3>
                        <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-50">
                                <tr className="text-slate-500 font-medium">
                                    <th className="px-6 py-4">Opportunity Name</th>
                                    <th className="px-6 py-4">Owner</th>
                                    <th className="px-6 py-4">Stage</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Close Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.map((r) => (
                                    <tr key={r.Id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{r.Name}</td>
                                        <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                {r.Owner?.Name?.charAt(0) || 'U'}
                                            </div>
                                            {r.Owner?.Name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${r.StageName === 'Closed Won' ? 'bg-emerald-100 text-emerald-800' :
                                                    r.StageName === 'Prospecting' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-slate-100 text-slate-800'}`}>
                                                {r.StageName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {r.Amount
                                                ? new Intl.NumberFormat("en-IN", {
                                                    style: "currency",
                                                    currency: "INR",
                                                }).format(r.Amount)
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{r.CloseDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}