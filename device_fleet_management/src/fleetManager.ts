import { DeviceManager, Device } from './deviceManager';
import { UserManager, User } from './userManager';

export class FleetManager {
    deviceManager: DeviceManager;
    userManager: UserManager;

    constructor(deviceManager: DeviceManager, userManager: UserManager) {
        this.deviceManager = deviceManager;
        this.userManager = userManager;
    }

    addUser(user: User): void {
        return this.userManager.addUser(user);
    }

    removeUser(id: string): void {
        //when we remove a user, we need to make sure all devices associated with the user are also removed

        try {
            this.userManager.removeUser(id);
            const devicesToRemove = this.deviceManager.getDevicesByUserId(id);
            for (const device of devicesToRemove ?? [] ) {
                this.deviceManager.removeDevice(device.id);
            }
        }
        catch (error) {
            throw new Error(`User with id ${id} not found`);
        }
    }

    getUser(id: string): User | null {
        return this.userManager.getUser(id) ?? null;
    }

    addDevice(device: Device): void {
        // when we add a device, we need to make sure it has a valid user_id

        if (this.deviceManager.deviceValidator(device)) {
            const user = this.userManager.getUser(device.user_id);
            if (user) {
                return this.deviceManager.addDevice(device);
            }
            else {
                throw new Error("Cannot add device: User with id nonexistent not found");
            }
        }
        else {
            throw new Error("Device must have an id");
        }
    }

    removeDevice(id: string): void {
        return this.deviceManager.removeDevice(id);
    }

    getDevice(id: string): Device | null {
        return this.deviceManager.getDevice(id) ?? null;
    }

    getUserDevices(userId: string): Device[] {
        return this.deviceManager.getDevicesByUserId(userId) ?? [];
    }

    getUserCount(): number {
        return this.userManager.getUserCount();
    }

    getDeviceCount(): number {
        return this.deviceManager.getDeviceCount();
    }
}

export { DeviceManager, Device } from './deviceManager';
export { UserManager, User } from './userManager';
