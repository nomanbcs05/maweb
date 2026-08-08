import React, { useState, useEffect } from 'react';
import { Navigation, ChevronLeft, Check } from 'lucide-react';
import { API } from '../services/api';
import { branchesData } from '../config/branches';

interface Branch {
  id: string;
  name: string;
  address: string;
}

interface OrderTypeLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (orderType: 'delivery' | 'pickup', location: string | Branch) => void;
}

export const OrderTypeLocationModal: React.FC<OrderTypeLocationModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryStep, setDeliveryStep] = useState<'branch' | 'location'>('branch');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let realAddress = `Location Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                realAddress = data.display_name;
              }
            }
          } catch (err) {
            console.warn('Could not reverse geocode address:', err);
          }

          const userLoc = { lat: latitude, lng: longitude, name: realAddress };
          setUserLocation(userLoc);
          setSelectedLocation(realAddress);

          if (!selectedBranch && branchesData.length > 0) {
            setSelectedBranch(branchesData[0].id);
          }
          setDeliveryStep('location');

          // Open Google Maps centered on the user's location
          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          window.open(mapsUrl, '_blank');
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not detect your exact location. Please enable GPS/Location in your browser settings or select manually.');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsLocating(false);
    }
  };

  useEffect(() => {
    const fetchBranches = async () => {
      const branchData = await API.getBranches();
      setBranches(branchData);
    };
    if (isOpen) {
      fetchBranches();
      // Reset state when modal opens
      setDeliveryStep('branch');
      setSelectedBranch('');
      setSelectedLocation('');
    }
  }, [isOpen]);

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranch(branchId);
    setDeliveryStep('location');
  };

  const handleBackToBranches = () => {
    setDeliveryStep('branch');
    setSelectedLocation('');
  };

  const handleSelect = () => {
    if (
      (orderType === 'pickup' && !selectedLocation) || 
      (orderType === 'delivery' && (!selectedBranch || !selectedLocation))
    ) {
      return;
    }
    // Save user location to localStorage if available
    if (userLocation) {
      localStorage.setItem('userLocation', JSON.stringify(userLocation));
    }
    onSelect(
      orderType,
      orderType === 'pickup' 
        ? branches.find(b => b.id === selectedLocation) || branches[0] 
        : `${selectedBranch}: ${selectedLocation}`
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl bg-white flex flex-col">
        <div className="p-4 text-center flex-1">
          {/* Logo */}
          <div className="mb-1 flex justify-center">
            <img 
              src="/logo.png" 
              alt="M.A Bakers" 
              className="h-36 sm:h-42 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <h2 className="text-base font-bold mb-2 text-[#1f2937]" style={{ fontFamily: 'serif' }}>
            Select your order type
          </h2>

          {/* Order Type Buttons */}
          <div className="flex gap-0 mb-3 justify-center bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-200">
            <button
              onClick={() => setOrderType('delivery')}
              className={`flex-1 py-1.5 px-4 text-xs font-bold uppercase transition-all cursor-pointer rounded-full ${
                orderType === 'delivery'
                  ? 'bg-white text-[#9B2226] border border-[#9B2226] shadow-sm'
                  : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              DELIVERY
            </button>

            <button
              onClick={() => setOrderType('pickup')}
              className={`flex-1 py-1.5 px-4 text-xs font-bold uppercase transition-all cursor-pointer rounded-full ${
                orderType === 'pickup'
                  ? 'bg-white text-[#9B2226] border border-[#9B2226] shadow-sm'
                  : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              PICK-UP
            </button>
          </div>

          {/* Location Section */}
          <div className="mb-2">
            {orderType === 'delivery' ? (
              <>
                {/* Use Current Location Button */}
                <button 
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="flex items-center justify-center gap-1.5 mx-auto mb-3 px-4 py-2 bg-[#9B2226] text-white rounded-full text-xs font-medium hover:bg-[#7F1D1D] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLocating ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Navigation size={14} />
                  )}
                  Use Current Location
                </button>

                {deliveryStep === 'branch' ? (
                  <>
                    <p className="text-xs text-[#1f2937] mb-2 font-semibold tracking-wide text-center uppercase">
                      STEP 1 — SELECT BRANCH
                    </p>
                    <div className="space-y-2">
                      {branchesData.map(branch => (
                        <button
                          key={branch.id}
                          onClick={() => handleSelectBranch(branch.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                            selectedBranch === branch.id
                              ? 'border-[#9B2226] bg-[#9B2226]/5'
                              : 'border-gray-200 hover:border-[#9B2226]/50'
                          }`}
                        >
                          <span className="font-medium text-[#1f2937] text-left text-xs sm:text-sm">{branch.name}</span>
                          {selectedBranch === branch.id && <Check size={18} className="text-[#9B2226] flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={handleBackToBranches}
                        className="flex items-center gap-1 text-xs text-[#9B2226] hover:text-[#7F1D1D] font-medium transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                        Back
                      </button>
                      <p className="text-xs text-[#1f2937] font-semibold uppercase">
                        STEP 2 — SELECT LOCATION
                      </p>
                      <div className="w-8"></div>
                    </div>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {branchesData
                        .find(b => b.id === selectedBranch)!
                        .locations.map(location => (
                          <button
                            key={location}
                            onClick={() => setSelectedLocation(location)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                              selectedLocation === location
                                ? 'border-[#9B2226] bg-[#9B2226]/5'
                                : 'border-gray-200 hover:border-[#9B2226]/50'
                            }`}
                          >
                            <span className="text-xs text-[#1f2937] text-left">{location}</span>
                            {selectedLocation === location && <Check size={16} className="text-[#9B2226] flex-shrink-0" />}
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-[#1f2937] mb-2 font-medium">
                  Please select your location
                </p>

                {/* Use Current Location Button */}
                <button 
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="flex items-center justify-center gap-1.5 mx-auto mb-3 px-4 py-2 bg-[#9B2226] text-white rounded-full text-xs font-medium hover:bg-[#7F1D1D] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLocating ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Navigation size={14} />
                  )}
                  Use Current Location
                </button>

                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-[#1f2937] outline-none focus:border-[#9B2226] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                    {branches.length === 0 && (
                      <>
                        <option value="branch-1">M.A Bakers 2 — Jam Sahib Road</option>
                        <option value="branch-2">M.A Bakers 1 — Dhamra Road</option>
                      </>
                    )}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1f2937]/40 pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Select Button */}
        <div className="px-4 pb-4 pt-0">
          <button
            onClick={handleSelect}
            disabled={
              (orderType === 'pickup' && !selectedLocation) ||
              (orderType === 'delivery' && (
                (deliveryStep === 'branch' && !selectedBranch) ||
                (deliveryStep === 'location' && !selectedLocation)
              ))
            }
            className={`w-full py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all cursor-pointer ${
              (orderType === 'pickup' && !selectedLocation) ||
              (orderType === 'delivery' && (
                (deliveryStep === 'branch' && !selectedBranch) ||
                (deliveryStep === 'location' && !selectedLocation)
              ))
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#9B2226] text-white hover:bg-[#7F1D1D] hover:shadow-md'
            }`}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};