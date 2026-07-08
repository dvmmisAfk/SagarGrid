'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoatStore } from '@/store/boatStore';
import { useUIStore } from '@/store/uiStore';
import { useWeatherStore } from '@/store/weatherStore';
import { fetchRealVessels } from '@/lib/realTimeVessels';
import { h3IndexToShortCode } from '@/lib/h3utils';
import SplashScreen from '@/components/SplashScreen';
import TopBar from '@/components/controls/TopBar';
import BoatListPanel from '@/components/controls/BoatListPanel';
import FeatureToggles from '@/components/controls/FeatureToggles';
import RadioRangeConfig from '@/components/controls/RadioRangeConfig';
import SOSButton from '@/components/controls/SOSButton';
import DemoController from '@/components/controls/DemoController';
import CellInfoPanel from '@/components/panels/CellInfoPanel';
import SOSReceivedPanel from '@/components/panels/SOSReceivedPanel';
import AlertBanner from '@/components/panels/AlertBanner';
import HazardModal from '@/components/panels/HazardModal';
import DTNPanel from '@/components/panels/DTNPanel';
import MapOverlays from '@/components/panels/MapOverlays';
import LiveDataPanel from '@/components/panels/LiveDataPanel';
import DisclaimerBar from '@/components/DisclaimerBar';
import Narrator from '@/components/tour/Narrator';
import GuidedCursor from '@/components/tour/GuidedCursor';

const SagarMap = dynamic(() => import('@/components/map/SagarMap'), { ssr: false });

export default function Home() {
  const initBoats = useBoatStore((s) => s.initBoats);
  const updateBoatPositions = useBoatStore((s) => s.updateBoatPositions);
  const applyRealVessels = useBoatStore((s) => s.applyRealVessels);
  const boats = useBoatStore((s) => s.boats);
  const networkOnline = useUIStore((s) => s.networkOnline);
  const fetchWeather = useWeatherStore((s) => s.fetchWeather);

  useEffect(() => {
    initBoats();
    fetchWeather();

    fetchRealVessels().then((vessels) => {
      applyRealVessels(vessels);
    });

    const interval = setInterval(() => {
      updateBoatPositions();
    }, 800);
    return () => clearInterval(interval);
  }, [initBoats, updateBoatPositions, applyRealVessels, fetchWeather]);

  return (
    <main className="w-screen h-screen bg-ocean-950 relative overflow-hidden">
      <SplashScreen />
      <TopBar />

      <div className="absolute inset-0 top-14">
        <SagarMap />
      </div>

      {/* Left panel — hidden on mobile, shown on md+ */}
      <div className="hidden md:flex absolute left-4 top-[72px] z-[1000] flex-col gap-3">
        <LiveDataPanel />
        <BoatListPanel />
      </div>

      {/* Mobile: boat list as horizontal scrolling chips */}
      <div className="md:hidden absolute top-[60px] left-0 right-0 z-[1000] px-3 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {boats.map((boat) => (
            <div
              key={boat.id}
              className="glass-cyan rounded-full px-3 py-1.5 flex items-center gap-2 flex-shrink-0"
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: boat.status === 'sos_origin' ? '#FF3B30' : '#00E5FF',
                  boxShadow: '0 0 6px rgba(0,229,255,0.5)',
                }}
              />
              <span className="font-display text-[11px] text-white whitespace-nowrap">
                {boat.name}
              </span>
              <span className="font-mono text-[9px] text-signal-cyan/70 whitespace-nowrap">
                {boat.currentCell ? h3IndexToShortCode(boat.currentCell) : '...'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Map HTML overlays (offline indicator, attributions, border legend) */}
      <MapOverlays />

      {/* Left: delay-tolerant networking panel */}
      <div className="hidden md:block">
        <DTNPanel />
      </div>

      {/* Right panels */}
      <CellInfoPanel />
      <SOSReceivedPanel />

      {/* Bottom right controls */}
      <div className="absolute bottom-8 right-4 z-[1000] flex flex-col gap-3 items-end">
        <RadioRangeConfig />
        <FeatureToggles />
        <SOSButton />
      </div>

      {/* Alert banners */}
      <AlertBanner />

      {/* Persistent advisory disclaimer */}
      <DisclaimerBar />

      {/* Modals */}
      <HazardModal />

      {/* Demo controller */}
      <DemoController />

      {/* AI voice narrator + guided cursor (active in Demo Mode) */}
      <Narrator />
      <GuidedCursor />

      {/* Network offline vignette */}
      <AnimatePresence>
        {!networkOnline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="network-offline-vignette"
          />
        )}
      </AnimatePresence>

      {/* Network offline status overlay — top center */}
      <AnimatePresence>
        {!networkOnline && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-[1002] flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(40, 8, 8, 0.95)',
              border: '1px solid rgba(255, 59, 48, 0.5)',
              boxShadow: '0 0 24px rgba(255, 59, 48, 0.3)',
            }}
          >
            <div className="w-2 h-2 rounded-full bg-alert-red animate-pulse" />
            <span className="font-mono text-xs text-alert-red tracking-widest font-semibold uppercase">
              Signal Lost · Mesh Active
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
