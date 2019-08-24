import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Planet } from '../models/planet';
import { Vehicle } from '../models/vehicles';

import { HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ObserveOnOperator } from 'rxjs/internal/operators/observeOn';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getPlanetsData() : Observable<Planet[]>{
    return this.http.get<Planet[]>("https://findfalcone.herokuapp.com/planets")
    .pipe(
      map(response => {
        return response;
      }),
      catchError(_ => {
        return new Observable<Planet[]>(observer => {
          observer.next([
            {"name":"Donlon","distance":100},
            {"name":"Enchai","distance":200},
            {"name":"Jebing","distance":300},
            {"name":"Sapir","distance":400},
            {"name":"Lerbin","distance":500},
            {"name":"Pingasor","distance":600}
          ]);
          observer.complete();
          });
      })
    );
  }

  getVehiclesData() : Observable<Vehicle[]>{
    return this.http.get<Vehicle[]>("https://findfalcone.herokuapp.com/vehicles")
      .pipe(
        map(response => {
          return response;
        }),
        catchError(_ => {
          return new Observable<Vehicle[]>(observer => {
            observer.next([
              {"name":"Space pod","total_no":2,"max_distance":200,"speed":2},
              {"name":"Space rocket","total_no":1,"max_distance":300,"speed":4},
              {"name":"Space shuttle","total_no":1,"max_distance":400,"speed":5},
              {"name":"Space ship","total_no":2,"max_distance":600,"speed":10}
            ]);
            observer.complete();
            });
        })
      );
  }

  getToken() : Observable<any> {
    return this.http.post('https://findfalcone.herokuapp.com/token', null);
  }

  findFalcone(body) : Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept' : 'application/json',
        'Content-Type' : 'application/json'
      })
    };

    return this.http.post('https://findfalcone.herokuapp.com/token', body, httpOptions);
  }
}
