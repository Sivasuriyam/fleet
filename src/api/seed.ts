import { DB } from '../types'
import { isoDate as d } from '../lib/geo'
export const seed: DB = {
  vehicles: [
    { id: 'VH-1001', plate: 'TX-4821', model: 'Volvo FH16', status: 'active', driverId: 'DR-01', fuel: 72, nextService: d(40), location: 'Dallas', history: ['Trip to Denver completed', 'Oil change done'] },
    { id: 'VH-1002', plate: 'IL-9033', model: 'Scania R450', status: 'active', driverId: 'DR-02', fuel: 18, nextService: d(9), location: 'Chicago', history: ['Refuelled 80L', 'Assigned to Mia Chen'] },
    { id: 'VH-1003', plate: 'GA-7710', model: 'Mercedes Actros', status: 'maintenance', driverId: '', fuel: 55, nextService: d(-2), location: 'Atlanta', history: ['Brake inspection started'] },
    { id: 'VH-1004', plate: 'WA-2256', model: 'Isuzu NPR', status: 'idle', driverId: 'DR-04', fuel: 90, nextService: d(70), location: 'Seattle', history: ['Parked at depot'] },
    { id: 'VH-1005', plate: 'NY-6104', model: 'Ford F-650', status: 'active', driverId: 'DR-03', fuel: 63, nextService: d(25), location: 'New York', history: ['Delivery to Miami in progress'] },
  ],
  drivers: [
    { id: 'DR-01', name: 'Liam Carter', phone: '555-0101', status: 'on-trip', vehicleId: 'VH-1001', rating: 4.8, onTime: 96, deliveries: 214, location: 'Dallas' },
    { id: 'DR-02', name: 'Mia Chen', phone: '555-0102', status: 'on-trip', vehicleId: 'VH-1002', rating: 4.5, onTime: 89, deliveries: 163, location: 'Chicago' },
    { id: 'DR-03', name: 'Noah Patel', phone: '555-0103', status: 'on-trip', vehicleId: 'VH-1005', rating: 4.2, onTime: 82, deliveries: 98, location: 'New York' },
    { id: 'DR-04', name: 'Emma Ruiz', phone: '555-0104', status: 'available', vehicleId: 'VH-1004', rating: 4.9, onTime: 98, deliveries: 301, location: 'Seattle' },
    { id: 'DR-05', name: 'Oliver Kim', phone: '555-0105', status: 'off-duty', vehicleId: '', rating: 4.0, onTime: 78, deliveries: 57, location: 'Atlanta' },
  ],
  shipments: [
    { id: 'SH-5001', customer: 'Acme Retail', pickup: 'Dallas', delivery: 'Denver', driverId: 'DR-01', vehicleId: 'VH-1001', status: 'in-transit', date: d(-1), eta: d(1), progress: 0.55 },
    { id: 'SH-5002', customer: 'Northwind Foods', pickup: 'Chicago', delivery: 'Atlanta', driverId: 'DR-02', vehicleId: 'VH-1002', status: 'delayed', date: d(-3), eta: d(0), progress: 0.4 },
    { id: 'SH-5003', customer: 'Globex Parts', pickup: 'New York', delivery: 'Miami', driverId: 'DR-03', vehicleId: 'VH-1005', status: 'in-transit', date: d(-2), eta: d(2), progress: 0.7 },
    { id: 'SH-5004', customer: 'Initech', pickup: 'Seattle', delivery: 'Denver', driverId: '', vehicleId: '', status: 'pending', date: d(1), eta: d(4), progress: 0 },
    { id: 'SH-5005', customer: 'Umbrella Pharma', pickup: 'Atlanta', delivery: 'Dallas', driverId: 'DR-01', vehicleId: 'VH-1001', status: 'delivered', date: d(-8), eta: d(-6), progress: 1 },
    { id: 'SH-5006', customer: 'Stark Supplies', pickup: 'Denver', delivery: 'Seattle', driverId: 'DR-04', vehicleId: 'VH-1004', status: 'delivered', date: d(-6), eta: d(-4), progress: 1 },
    { id: 'SH-5007', customer: 'Wayne Logistics', pickup: 'Chicago', delivery: 'New York', driverId: 'DR-02', vehicleId: 'VH-1002', status: 'delivered', date: d(-5), eta: d(-3), progress: 1 },
  ],
}
