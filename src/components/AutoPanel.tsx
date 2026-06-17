"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Car, Wrench, Fuel, Compass, Eye, ShieldAlert,
  Gauge, RefreshCw, BarChart2, Plus, Clock
} from "lucide-react";
import { useFocusStore } from "../store/focusStore";

interface FuelLog {
  date: string;
  gallons: number;
  cost: number;
  mileage: number;
}

interface ServiceReminder {
  task: string;
  dueMileage: number;
  completed: boolean;
}

interface TripLog {
  date: string;
  durationMinutes: number;
  averageSpeed: number;
  maxRpm: number;
}

export default function AutoPanel() {
  const store = useFocusStore();
  const [vehicleName, setVehicleName] = useState("Ferrari Roma");
  const [currentMileage, setCurrentMileage] = useState(12450);
  const [obdConnected, setObdConnected] = useState(false);
  
  // Telemetry states (OBD-II simulated values)
  const [rpm, setRpm] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [coolantTemp, setCoolantTemp] = useState(90);
  const [engineLoad, setEngineLoad] = useState(0);

  // States for logs
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([
    { date: "2026-05-20", gallons: 12.4, cost: 48.5, mileage: 12100 },
    { date: "2026-05-28", gallons: 11.8, cost: 45.2, mileage: 12420 }
  ]);
  const [serviceReminders, setServiceReminders] = useState<ServiceReminder[]>([
    { task: "Synthetic Oil Change", dueMileage: 15000, completed: false },
    { task: "Brake Pad Inspection", dueMileage: 20000, completed: false }
  ]);
  const [trips, setTrips] = useState<TripLog[]>([
    { date: "2026-06-01", durationMinutes: 45, averageSpeed: 68, maxRpm: 4500 }
  ]);

  // Form inputs
  const [inputGallons, setInputGallons] = useState("");
  const [inputCost, setInputCost] = useState("");
  const [newMileage, setNewMileage] = useState("");
  const [inputService, setInputService] = useState("");

  // OBD telemetry pulse loop
  useEffect(() => {
    if (!obdConnected) {
      setRpm(0);
      setSpeed(0);
      setEngineLoad(0);
      return;
    }

    const interval = setInterval(() => {
      // Simulate high-performance HUD dashboard telemetries
      setRpm(Math.round(2000 + Math.random() * 3200));
      setSpeed(Math.round(75 + Math.random() * 25));
      setEngineLoad(Math.round(40 + Math.random() * 35));
      setCoolantTemp(Math.round(88 + Math.random() * 6));
    }, 1000);

    return () => clearInterval(interval);
  }, [obdConnected]);

  const addFuelLog = () => {
    const gallons = parseFloat(inputGallons);
    const cost = parseFloat(inputCost);
    const mileage = parseInt(newMileage);

    if (isNaN(gallons) || isNaN(cost) || isNaN(mileage)) return;

    setFuelLogs(prev => [
      ...prev,
      { date: new Date().toLocaleDateString("en-CA"), gallons, cost, mileage }
    ]);
    setCurrentMileage(mileage);
    setInputGallons("");
    setInputCost("");
    setNewMileage("");
  };

  const addServiceReminder = () => {
    if (!inputService.trim()) return;
    setServiceReminders(prev => [
      ...prev,
      { task: inputService, dueMileage: currentMileage + 5000, completed: false }
    ]);
    setInputService("");
  };

  const calculateMpg = () => {
    if (fuelLogs.length < 2) return "N/A";
    const last = fuelLogs[fuelLogs.length - 1];
    const prev = fuelLogs[fuelLogs.length - 2];
    const diffMiles = last.mileage - prev.mileage;
    return (diffMiles / last.gallons).toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1440px] mx-auto w-full mb-6 select-text">
      
      {/* ── MODULE 1: TELEMETRY HUD ── */}
      <div className="flex flex-col bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-red-500" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">OBD-II HUD Telemetry</span>
          </div>
          <button
            onClick={() => setObdConnected(!obdConnected)}
            className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider transition ${
              obdConnected ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            {obdConnected ? "Disconnect OBD" : "Connect OBD-II"}
          </button>
        </div>

        {/* HUD dials */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/2 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Engine RPM</span>
            <span className="text-lg font-black font-mono text-red-500 animate-pulse">{obdConnected ? rpm : "---"}</span>
            <span className="text-[8px] text-gray-600">LIMIT: 8500</span>
          </div>
          <div className="bg-white/2 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Velocity Speed</span>
            <span className="text-lg font-black font-mono text-white">{obdConnected ? `${speed} MPH` : "---"}</span>
            <span className="text-[8px] text-gray-600">Simulated OBD GPS</span>
          </div>
          <div className="bg-white/2 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Engine Load</span>
            <span className="text-sm font-black font-mono text-gray-300">{obdConnected ? `${engineLoad}%` : "---"}</span>
          </div>
          <div className="bg-white/2 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Coolant Temp</span>
            <span className="text-sm font-black font-mono text-gray-300">{obdConnected ? `${coolantTemp}°C` : "---"}</span>
          </div>
        </div>

        <div className="bg-white/3 border border-white/5 rounded-xl p-3 flex justify-between items-center text-[10px]">
          <span className="text-gray-400">Current Vehicle Profile:</span>
          <span className="font-bold text-white">{vehicleName} ({currentMileage} mi)</span>
        </div>
      </div>

      {/* ── MODULE 2: MAINTENANCE & FUEL REMINDERS ── */}
      <div className="flex flex-col bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-yellow-500" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Maintenance Reminders</span>
          </div>

          <div className="flex flex-col gap-1.5 mb-4">
            {serviceReminders.map((rem, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-white/2 border border-white/5 text-[10px] text-gray-300"
              >
                <span>{rem.task}</span>
                <span className="text-[8.5px] font-mono text-yellow-400">Due at {rem.dueMileage} mi</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputService}
            onChange={(e) => setInputService(e.target.value)}
            placeholder="New service task..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none"
          />
          <button
            onClick={addServiceReminder}
            className="px-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-[10px] uppercase rounded-xl transition"
          >
            Add Rem
          </button>
        </div>
      </div>

      {/* ── MODULE 3: FUEL ANALYTICS ── */}
      <div className="flex flex-col bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-cyan-400" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Fuel Analytics</span>
            </div>
            <span className="text-[10px] font-bold text-cyan-400">MPG: {calculateMpg()}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <input
              type="text"
              value={inputGallons}
              onChange={(e) => setInputGallons(e.target.value)}
              placeholder="Gallons"
              className="bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
            />
            <input
              type="text"
              value={inputCost}
              onChange={(e) => setInputCost(e.target.value)}
              placeholder="Cost $"
              className="bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
            />
            <input
              type="text"
              value={newMileage}
              onChange={(e) => setNewMileage(e.target.value)}
              placeholder="Odometer"
              className="bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={addFuelLog}
          className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition"
        >
          Submit Fuel Log
        </button>
      </div>

    </div>
  );
}
