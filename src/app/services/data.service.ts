import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Planet } from '../models/planet';
import { Vehicle } from '../models/vehicles';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getPlanetsData() : Observable<Planet[]>{
    return this.http.get<Planet[]>("https://findfalcone.herokuapp.com/planets");
  }

  getVehiclesData() : Observable<Vehicle[]>{
    return this.http.get<Vehicle[]>("https://findfalcone.herokuapp.com/vehicles");
  }


}
