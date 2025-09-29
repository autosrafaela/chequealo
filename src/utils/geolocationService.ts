export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export class GeolocationService {
  static async getCurrentPosition(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocalización no soportada por el navegador'
        });
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutos
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Error desconocido';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permisos de ubicación denegados';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Ubicación no disponible';
              break;
            case error.TIMEOUT:
              message = 'Tiempo de espera agotado';
              break;
          }
          reject({
            code: error.code,
            message
          });
        },
        options
      );
    });
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Simple reverse geocoding using browser API
    // En producción se podría usar Google Maps Geocoding API
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`
      );
      
      if (!response.ok) {
        throw new Error('Error en geocodificación inversa');
      }
      
      const data = await response.json();
      return data.locality || data.city || data.principalSubdivision || 'Ubicación desconocida';
    } catch (error) {
      console.error('Error en reverse geocoding:', error);
      return 'Ubicación desconocida';
    }
  }
}