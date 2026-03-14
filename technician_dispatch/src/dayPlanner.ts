/**
 * CHALLENGE 2: Single Technician — Maximum Boxes in a Working Day
 *
 * A technician has a fixed number of working minutes today. Each box has a
 * GPS location and a repair time. Travelling between locations also burns
 * time. Your goal: choose WHICH boxes to visit and in WHAT ORDER to maximise
 * the number of boxes fixed before time runs out.
 *
 * The key insight — the closest box is NOT always the best choice:
 *   A nearby box with a long fix time can consume all remaining budget,
 *   whereas skipping it might let you fix two or three faster boxes instead.
 *   Your algorithm must weigh travel time against fix time to make the right call.
 *
 * Do NOT modify any interface or the pre-implemented helper methods.
 * Implement every method marked with TODO.
 */

export interface Location {
    latitude: number;
    longitude: number;
}

export interface Box {
    id: string;
    name: string;
    location: Location;
    /** Minutes needed to fully repair this box once the technician arrives. */
    fixTimeMinutes: number;
}

export interface Technician {
    id: string;
    name: string;
    startLocation: Location;
    speedKmh: number;
    workingMinutes: number;
}

export interface DayPlanResult {
    technicianId: string;
    /** Ordered list of box IDs visited today. Every box must be fully completed. */
    plannedRoute: string[];
    /** Total minutes used (travel + all fix times). Must be ≤ workingMinutes. */
    totalTimeUsedMinutes: number;
    /** Equal to plannedRoute.length. */
    boxesFixed: number;
    /** Every box NOT in plannedRoute. */
    skippedBoxIds: string[];
}

export class DayPlanner {

    // ── Pre-implemented helpers — do not modify ───────────────────────────────

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

    /**
     * Returns the travel time in minutes between two locations at a given speed.
     *   travelTimeMinutes = (distanceKm / speedKmh) × 60
     */
    travelTimeMinutes(loc1: Location, loc2: Location, speedKmh: number): number {
        return (this.haversineDistance(loc1, loc2) / speedKmh) * 60;
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

    calculateRouteDuration(
        technician: Technician,
        boxes: Box[],
        routeIds: string[]
    ): number | null {

        const boxMap = this.createBoxMap(boxes);

        let totalDistance: number = 0;
        let curLoc: Location | undefined = technician.startLocation;
        let totalDuration: number = 0;
        let foundUndefined: boolean = false;
        
        routeIds.forEach((routeId: string, index: number) => {

            let nextLoc: Location | undefined = boxMap.get(routeId)?.location;

            if (nextLoc === undefined) {
                foundUndefined = true;
            }

            if (nextLoc !== undefined && curLoc !== undefined) {
                totalDistance += this.haversineDistance(curLoc, nextLoc);
                totalDuration += this.travelTimeMinutes(curLoc, nextLoc, technician.speedKmh);
            }

            curLoc = nextLoc;

            let duration: number | undefined =  boxMap.get(routeId)?.fixTimeMinutes

            if (duration !== undefined) {
                totalDuration += duration
            }
            
        });
        if (foundUndefined) {
            return null;
        }
        return totalDuration;
    }

    calculateShortesDuration(curLoc: Location, boxes: Box[], remainingMinutes: number, speedKmh: number) {
        let minTime: number | null = null;
        let boxIn = null;


        boxes.forEach((box: Box, index: number) => {
            let otherLoc: Location | undefined = box.location;

            if (otherLoc !== undefined && curLoc !== null) {
                let curDis: number = this.haversineDistance(curLoc, otherLoc);
                let curMinutes: number = this.travelTimeMinutes(curLoc, otherLoc, speedKmh) + box.fixTimeMinutes
                if ((minTime === null || curMinutes < minTime) && curMinutes <= remainingMinutes) {
                    minTime = curMinutes;
                    boxIn = index;
                }
            }
        });
        return {boxIn, minTime};
    }

    planDay(technician: Technician, boxes: Box[]): DayPlanResult {
        let routeIds: string[] = [];

        let curLoc = technician.startLocation;

        let boxesCopy = [...boxes];      
        let remainingMinutes = technician.workingMinutes;
        let noMoreBoxes = false;

        while (boxesCopy.length > 0 && !noMoreBoxes) {
            let {boxIn, minTime} = this.calculateShortesDuration(curLoc, boxesCopy, remainingMinutes, technician.speedKmh);
            remainingMinutes -= minTime || 0;

            if (boxIn !== null) {
            
                let bestBox = boxesCopy[boxIn];

                routeIds.push(bestBox.id);

                curLoc = bestBox.location;

                boxesCopy.splice(boxIn, 1);
            }
            else {
                noMoreBoxes = true;
            }
        }

        let time: number | null = this.calculateRouteDuration(technician, boxes, routeIds);

        if (time === null) { time = 0; }

        let skipped: string[] = []

        boxesCopy.forEach((box: Box, index: number) => {
            skipped.push(box.id);
        })

        let result: DayPlanResult = {
            technicianId: technician.id,
            plannedRoute: routeIds,
            totalTimeUsedMinutes: technician.workingMinutes - remainingMinutes,
            boxesFixed: routeIds.length,
            skippedBoxIds: skipped
        }
        return result;
    }


}
