import React, { useState, useRef, useEffect, FC } from 'react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import { FaTimes } from 'react-icons/fa';

const libraries = ['places'] as ('places')[];
const mapContainerStyle = { width: '100%', height: '400px' };
const center = { lat: 51.5074, lng: -0.1278 }; 

interface GoogleMapModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (location: { lat: number; lng: number; address: string }) => void;
}

export const GoogleMapModal: FC<GoogleMapModalProps> = ({ open, onClose, onSelect }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });
  const [marker, setMarker] = useState<{ lat: number; lng: number }>(center);
  const [address, setAddress] = useState<string>('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: marker }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress('Address not found');
      }
    });
  }, [marker, isLoaded]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        setMarker({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ background: '#fff', padding: 20, maxWidth: 600, width: '90%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer' }} title="Close">
          <FaTimes size={20} />
        </button>
        <Autocomplete
          onLoad={ref => (autocompleteRef.current = ref)}
          onPlaceChanged={handlePlaceChanged}
        >
          <input type="text" placeholder="Search address..." style={{ width: '100%', marginBottom: 10 }} />
        </Autocomplete>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={marker}
          zoom={12}
          onClick={handleMapClick}
        >
          <Marker position={marker} draggable onDragEnd={e => {
            if (e.latLng) {
              setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
          }} />
        </GoogleMap>
        <div style={{ marginTop: 16, marginBottom: 8, background: '#F5F5F5', padding: 10, borderRadius: 8 }}>
          <strong>Selected Address:</strong>
          <div style={{ fontSize: 14, color: '#333', marginTop: 4 }}>{address}</div>
        </div>
        <button
          onClick={() => { onSelect({ ...marker, address }); }}
          style={{ width: '100%', background: '#C3EAE7', color: '#000', border: 'none', borderRadius: 8, padding: 12, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
        >
          Save Location
        </button>
      </div>
    </div>
  );
}
