
// A simple mock reverse geocoding utility to determine country from coordinates.
// In a real-world app, this would be a call to a service like Google Maps Geocoding API.
export const reverseGeocode = (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve) => {
        // Mock coordinates for our supported countries
        const locations: { [key: string]: { lat: number, lng: number } } = {
            NZ: { lat: -41.2865, lng: 174.7762 }, // Wellington
            AU: { lat: -33.8688, lng: 151.2093 }, // Sydney
            US: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
        };

        let closestCountry = 'NZ'; // Default
        let minDistance = Infinity;

        // Find the closest country based on Euclidean distance (simplified)
        for (const [code, coords] of Object.entries(locations)) {
            const distance = Math.sqrt(Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2));
            if (distance < minDistance) {
                minDistance = distance;
                closestCountry = code;
            }
        }
        
        // Simulate network delay
        setTimeout(() => resolve(closestCountry), 700);
    });
};
