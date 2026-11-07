export interface Coordinate{
    latitude:number;
    longitude:number;
}

export interface RouteOption {
    distanceKm: number;
    durationMinutes:number;
    geometry:Coordinate[];
}

export interface RouteData{
    route:{
        routes:RouteOption[];
    }
}

export interface RouteVariables{
    origin:Coordinate;
    destination:Coordinate;
}
