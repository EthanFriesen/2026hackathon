export interface Device {
    id: string;
    name: string;
    version: string;
    user_id: string;
    status: 'active' | 'inactive';
    location: {
        latitude: number;
        longitude: number;
    };
}

export class DeviceManager {

    private static readonly EARTH_RADIUS_KM = 6371;

    // constructor, gets called when a new instance of the class is created
    private devices: Map<string, Device>;
    
    constructor() {
      this.devices = new Map<string, Device>();
    }

    addDevice(device: Device): void {
      if(!this.deviceValidator(device)) {
        throw new Error("Device must have an id");
      }
      else if(this.devices.has(device.id)) {
        throw new Error(`Device with id ${device.id} already exists`);
      }
      else {
        this.devices.set(device.id, device);
      }
    }

    removeDevice(id: string): void {
      if (id === "") {
        throw new Error("Device ID cannot be empty");
      }
      else if(!this.devices.has(id)) {
        throw new Error(`Device with id ${id} not found`);
      }
      else {
        this.devices.delete(id);
      }
    }

    getDevice(id: string): Device | null {
      if (id === "") {
        throw new Error("Device ID cannot be empty");
      }
      else if(!this.devices.has(id)) {
        return null;
      }
      else {
        return this.devices.get(id) || null;
      }
    }

    getDevicesByVersion(version: string): Device[] | null {
      if (version === "") {
        return null;
      }
      else {
        const result: Device[] = [];
        for (const device of this.devices.values()) {
          if (device.version === version) {
            result.push(device);
          }
        }
        return result;
      }
    }

    getDevicesByUserId(user_id: string): Device[] | null {
      if (user_id === "") {
        return null;
      }
      else {
        const result: Device[] = [];
        for (const device of this.devices.values()) {
          if (device.user_id === user_id) {
            result.push(device);
          }
        }
        return result;
      }
    }

    getDevicesByStatus(status: 'active' | 'inactive' | 'pending' | 'failed'): Device[] | null {
      const result: Device[] = [];
      for (const device of this.devices.values()) {
        if (device.status === status) {
          result.push(device);
        }
      }
      return result;
    }

    getDevicesInArea(latitude: number, longitude: number, radius_km: number): Device[] | null {
      // returns all devices within a radius of the given latitude and longitude
      // the radius is in kilometers

      if (isNaN(latitude) || isNaN(longitude) || isNaN(radius_km)) {
        throw new Error("Latitude, longitude, and radius must be numbers");
      }
      else {
        const result: Device[] = [];
        for (const device of this.devices.values()) {
          const distance = this.calculateDistance(latitude, longitude, device.location.latitude, device.location.longitude);
          if (distance <= radius_km) {
            result.push(device);
          }
        }
        return result;
      }
    }

    getDevicesNearDevice(device_id: string, radius_km: number): Device[] | null {
      // returns all devices within a radius of the given device (not including the device itself)
      // the radius is in kilometers

      if (device_id == "") {
        throw new Error("Device ID cannot be empty");
      }
      else if(!this.devices.has(device_id)) {
        return null;
      }
      else if (isNaN(radius_km)) {
        throw new Error("Radius must be a number");
      }
      else {
        const device = this.devices.get(device_id);
        const result: Device[] = [];

        for (const otherDevice of this.devices.values()) {
          if (otherDevice.id !== device_id) {
            const distance = this.calculateDistance(device!.location.latitude, device!.location.longitude, otherDevice.location.latitude, otherDevice.location.longitude);
            if (distance <= radius_km) {
              result.push(otherDevice);
            }
          }
        }
        return result;
      }
    }

    getAllDevices(): Device[] {
        return Array.from(this.devices.values());
    }

    getDeviceCount(): number {
        return this.devices.size;
    }

    deviceValidator(device: Device): boolean {
      if (device == null) {
        return false;
      }
      else {
        for (const [key, value] of Object.entries(device)) {
          if (value === null || value === undefined || value === "") {
            return false;
          }
        }
        return true;
      }
    }

    private toRadians(degrees: number): number {
      return degrees * (Math.PI / 180);
    }

    private calculateDistance(lat1: number, long1: number, lat2: number, long2: number): number {
      const R = DeviceManager.EARTH_RADIUS_KM; // Earth's radius in kilometers
      const dLat = this.toRadians(lat2 - lat1);
      const dLon = this.toRadians(long2 - long1);

      const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.toRadians(lat1)) *
          Math.cos(this.toRadians(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in kilometers

    }
}

