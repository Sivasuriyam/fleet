export type VStatus = 'active' | 'idle' | 'maintenance'
export type DStatus = 'available' | 'on-trip' | 'off-duty'
export type SStatus = 'pending' | 'in-transit' | 'delivered' | 'delayed'
export interface Vehicle { id: string; plate: string; model: string; status: VStatus; driverId: string; fuel: number; nextService: string; location: string; history: string[] }
export interface Driver { id: string; name: string; phone: string; status: DStatus; vehicleId: string; rating: number; onTime: number; deliveries: number; location: string }
export interface Shipment { id: string; customer: string; pickup: string; delivery: string; driverId: string; vehicleId: string; status: SStatus; date: string; eta: string; progress: number }
export interface DB { vehicles: Vehicle[]; drivers: Driver[]; shipments: Shipment[] }
export type Kind = keyof DB
export interface Alert { id: string; type: 'Delay' | 'Maintenance' | 'Delivery' | 'Driver'; level: 'high' | 'info'; msg: string }
