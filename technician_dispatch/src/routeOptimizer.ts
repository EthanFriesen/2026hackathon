/**
 * CHALLENGE 1: Single Technician — Shortest Route
 *
 * A technician starts at a known GPS location and must visit every broken
 * box exactly once. Your goal is to find the shortest possible total travel
 * distance.
 *
 * Scoring:
 *   - Correctness  — every box visited exactly once, distance is accurate.
 *   - Route quality — your total distance is compared against other teams;
 *                     shorter routes score higher on the load tests.
 *
 * Do NOT modify any interface or the pre-implemented helper methods.
 * Implement every method marked with TODO.
 */

export interface Location {
    latitude: number;   // decimal degrees
    longitude: number;  // decimal degrees
}

export interface Box {
    id: string;
    name: string;
    location: Location;
}

export interface Technician {
    id: string;
    name: string;
    startLocation: Location;
}

export interface RouteResult {
    technicianId: string;
    /** Ordered list of box IDs. Every box must appear exactly once. */
    route: string[];
    /** Total travel distance in km. Does NOT include a return leg to start. */
    totalDistanceKm: number;
}

export class RouteOptimizer {

    // ── Pre-implemented helper — do not modify ────────────────────────────────

    /**
     * Returns the great-circle distance in kilometres between two GPS
     * coordinates using the Haversine formula (Earth radius = 6 371 km).
     */
    haversineDistance(loc1: Location, loc2: Location): number {
        const R = 6371;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const dLat = toRad(loc2.latitude  - loc1.latitude);
        const dLng = toRad(loc2.longitude - loc1.longitude);
        const lat1 = toRad(loc1.latitude);
        const lat2 = toRad(loc2.latitude);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // ── Your implementation below ─────────────────────────────────────────────

    createBoxMap(boxes: Box[]): Map<string, Box> {
        const boxMap = new Map<string, Box>();

        boxes.forEach((box: Box, index: number) => {
            if (box !== null) {
                boxMap.set(box.id, box);
            }
        });
        return boxMap;
    }

    calculateRouteDistance(
        technician: Technician,
        boxes: Box[],
        routeIds: string[]
    ): number | null {

        const boxMap = this.createBoxMap(boxes);

        let totalDistance: number = 0;
        let curLoc: Location | undefined = technician.startLocation;
        let foundUndefined: boolean = false;
        
        routeIds.forEach((routeId: string, index: number) => {

            let nextLoc: Location | undefined = boxMap.get(routeId)?.location;

            if (nextLoc === undefined) {
                foundUndefined = true;
            }

            if (nextLoc !== undefined && curLoc !== undefined) {
                totalDistance += this.haversineDistance(curLoc, nextLoc);
            }

            curLoc = nextLoc;
        });
        if (foundUndefined) {
            return null;
        }
        return totalDistance;
    }

    calculateShortestDistance(curLoc: Location, boxes: Box[]) {
        let minDis: number | null = null;
        let boxIn = 0;

        boxes.forEach((box: Box, index: number) => {
            let otherLoc: Location | undefined = box.location;

            if (otherLoc !== undefined && curLoc !== null) {
                let curDis: number = this.haversineDistance(curLoc, otherLoc);
                if (minDis === null || curDis < minDis) {
                    minDis = curDis;
                    boxIn = index;
                }
            }
        });
        return boxIn;
    }

    findShortestRoute(technician: Technician, boxes: Box[]): RouteResult {

        let routeIds: string[] = [];

        let curLoc = technician.startLocation;

        let boxesCopy = [...boxes];      

        while (boxesCopy.length > 0) {
            let boxIn = this.calculateShortestDistance(curLoc, boxesCopy);

            let bestBox = boxesCopy[boxIn];

            routeIds.push(bestBox.id);

            curLoc = bestBox.location;

            boxesCopy.splice(boxIn, 1);
        }

        let distance: number | null = this.calculateRouteDistance(technician, boxes, routeIds);

        if (distance === null) { distance = 0; }

        let result: RouteResult = {
            technicianId: technician.id,
            route: routeIds,
            totalDistanceKm: distance
        }
        return result;
    }
}
