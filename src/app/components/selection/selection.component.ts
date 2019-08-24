import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Planet } from 'src/app/models/planet';
import { Vehicle } from 'src/app/models/vehicles';
import { ToastrService } from 'ngx-toastr';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'ff-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss']
})
export class SelectionComponent implements OnInit {

  planets : Array<Planet> = [];
  vehicles : Array<Vehicle> = [];

  planetSelectedCount : number = 0;
  planetAssignedVehicles : number = 0;

  lastDragOperation : boolean = false;

  timeToTravel : number = 0;

  constructor(private dataService : DataService, private toastr: ToastrService,
    private router: Router) { }

  ngOnInit() {

    this.planetSelectedCount = 0;

    this.dataService.getPlanetsData().subscribe(
      (planets : Planet[]) => {
        // console.log(planets);
        this.planets = planets;
      }
    )

    this.dataService.getVehiclesData().subscribe(
      (vehicles : Vehicle[]) => {
        // console.log(vehicles);
        this.vehicles = [];

        // Repeating the vehicle the total_no that is available.
        for(let vehicle of vehicles) {
          for(let i = 1; i <= vehicle.total_no; i++) {
            vehicle.isAvailable = true;
            vehicle.id = vehicle.name + "_" + i;
            this.vehicles.push(JSON.parse(JSON.stringify(vehicle)));
          }
        } // Loop end
      
      });

  }

  selectThisPlanet(planet : Planet) {

    if(!planet.isSelected) {
      if(this.planetSelectedCount == 4) {

        this.toastr.error("Please unselect a previous selection and then select a new Planet.");
        return false;
      }  
    } 

    planet.isSelected = !planet.isSelected;

    // If there has been a deselection, remove the assigned vehicle as well.
    if(!planet.isSelected) {
      
      if(planet.assignedVehicle) {

        this.resetVehicles(planet.assignedVehicle); // Reset the vehicles
        planet.assignedVehicle = null;

        this.recalculateAssignedVehicles();
        this.recalculateTime();

      }
    }

    this.planetSelectedCount = 0;
    this.planets.forEach(planet => {
      this.planetSelectedCount += planet.isSelected ? 1 : 0;
    });
  }


  allowDrop(ev) {
    ev.preventDefault();
  }

  dragVehicle(ev, vehicle) {

    // console.log(vehicle);

    var img = new Image(); 
    img.src = 'assets/' + vehicle.name.toLowerCase() + '.PNG'; 
    img.width = 50;
    img.height = 50;

    ev.dataTransfer.setData("text/plain", JSON.stringify(vehicle));
    ev.dataTransfer.setDragImage(img, 0, 0);
  }


  connectVehicleToPlanet(ev, planet) {

    ev.preventDefault();

    // We have the vehicle and the planet that it is being dropped on. So first we check if the vehicle can cover the distance or not
    // console.log(planet);

    var vehicleData = JSON.parse(ev.dataTransfer.getData("text/plain"));
    if(vehicleData.max_distance < planet.distance) {

      this.toastr.error("The vehicle chosen cannot travel to this planet.");
      this.lastDragOperation = false;
      return false;
    
    } else if(!planet.isSelected) {

      this.toastr.error("This planet has not been chosen for exploration.");
      this.lastDragOperation = false;
      return false;

    } else {

      if(planet.assignedVehicle) {
        this.resetVehicles(planet.assignedVehicle);
      }

      planet.assignedVehicle = vehicleData;
      this.lastDragOperation = true;
      
      this.recalculateAssignedVehicles();
      this.recalculateTime();
      
    }
  }

  markVehicleForSelection(ev, vehicle) {

    if(ev.dataTransfer.dropEffect === 'none' ) {
      return false;
    } else {

      if(this.lastDragOperation) // Since the drag operation might be rejected because of business reasons
        vehicle.isAvailable = false;
    }
  }

  resetVehicles(assignedVehicle) {

    // Need to reset vehicles as well.
    this.vehicles = this.vehicles.map(vehicle => {
      if(vehicle.id === assignedVehicle.id) {
        vehicle.isAvailable = true;
      }
      return vehicle;
    });
  }


  recalculateAssignedVehicles() {

    this.planetAssignedVehicles = 0;
    this.planets.forEach(planet => {
      this.planetAssignedVehicles += planet.assignedVehicle ? 1 : 0;
    });
  }


  recalculateTime() {

    this.timeToTravel = 0;

    let travelTimes = [];
    this.planets.forEach(planet => {
      if(planet.isSelected && planet.assignedVehicle) {
        travelTimes.push(Math.round(planet.distance / planet.assignedVehicle.speed));
      }
    });

    this.timeToTravel = Math.max(...travelTimes);
  }


  findFalcone() {

    let response = {};

    if(this.planetSelectedCount < 4 || this.planetAssignedVehicles < 4) {
      this.toastr.error("Please choose 4 planets & assign appropraite vehicles to them to proceed.");
      return false;
    } else if(this.planetSelectedCount === 4 && this.planetAssignedVehicles === 4) {

      this.dataService.getToken().subscribe(
        token => {

          let body = {};
          body['token'] = token;
          body['planet_names'] = [];
          body['vehicle_names'] = [];

          this.planets.forEach(planet => {
            if(planet.isSelected) {
              body['planet_names'].push(planet.name);
              if(planet.assignedVehicle) {
                body['vehicle_names'].push(planet.assignedVehicle.name);
              }
            }
          });

          this.dataService.findFalcone(body).subscribe(
            response => {
              // console.log(response);
            });
        }, error => {

          console.log('No token available. Mock Implementation kicks in.');

          let randomPlanetIndex = Math.floor(Math.random() * (6 - 0)) + 0; 
          let winnerPlanet = this.planets[randomPlanetIndex];
          console.log(winnerPlanet);

          let planetFound = false;

          this.planets.forEach(planet => {
            if(planet.isSelected) {
              if(planet.name === winnerPlanet.name) {
                planetFound = true;
              }
            }
          });

          if(planetFound) {

            response = {
              "planet_name" : winnerPlanet.name,
              "status" : "success"
            }
          } else {

            response = {
              "status" : "failure"
            }
          }

          let navigationExtras: NavigationExtras = {
              queryParams: {
                  response: JSON.stringify(response)
              }
          }
          this.router.navigate(['result'], navigationExtras);

        });
    }
  }

}
