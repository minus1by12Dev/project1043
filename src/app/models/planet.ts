import { Vehicle } from './vehicles';

export class Planet {
    name : string;
    distance : number;
    isSelected? : boolean;
    assignedVehicle? : Vehicle
}