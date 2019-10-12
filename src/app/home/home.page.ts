import { Component } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {
  isStarted:boolean = false;
  buttonLabel:string = 'Start';
  timeoutHandler:any;
  count: number=0;
  speed: string = '7.2';
  currentSpeed: number=0;
  preset1:string = 'Preset 1';
  preset2:string = 'Preset 2';
  intervalSeconds:number = 15;
  geoLocationIntervalHandler: any;

  speedsArray:number[] = [];

  constructor(private geolocation: Geolocation) {
   console.log('starting')
    this.geoLocationIntervalHandler = setInterval(()=>{this.updateCurrentSpeed()},500)
  }

  public startStop(){
    if(this.buttonLabel == 'Start') {
      this.buttonLabel = 'Stop';
         // start recording location
       
      this.timeoutHandler = setInterval(() => {      
      let speedDiff =  this.currentSpeed - Number(this.speed);
      console.log(speedDiff);
        // one context per document
      var context = new AudioContext();
      var osc = context.createOscillator(); // instantiate an oscillator
      osc.type = 'sine'; // this is the default - also square, sawtooth, triangle
      osc.frequency.value = 440; // Hz
      osc.connect(context.destination); // connect it to the destination
      osc.start(); // start the oscillator
      
      setTimeout(()=>{        
        osc.stop();
        setTimeout(()=>{
          osc =  context.createOscillator(); // instantiate an oscillator
          osc.frequency.value = 440 + speedDiff*10;
          osc.connect(context.destination); // connect it to the destination
          osc.start();
          setTimeout(()=>{osc.stop()},300);
        }, Math.abs(speedDiff*500)
        );
        
      },300);
      

      }, this.intervalSeconds*1000);
    } else {      
      this.buttonLabel = 'Start';
      clearTimeout(this.timeoutHandler);
    }
  }

  presetClick(preset) {
      switch (preset) {
        case 'preset1': {
           if(this.preset1 !='Preset 1') {
             this.speed = this.preset1;
           }
           break;
        }
        case 'preset2': {
          if(this.preset2 !='Preset 2') {
            this.speed = this.preset2;
          }
            break;
        }
      }
  }

  holdCount(preset){
    if (this.count < 2)
    {
     setInterval(() => {
      this.count++;
      if ( this.count>= 2) {
          switch (preset) {
            case 'preset1': {
               this.preset1 = this.speed;
               break;
            }
            case 'preset2': {
                this.preset2 = this.speed;
                break;
            }
          } 
          this.count = 0 ;
      }
    }, 200);
  }
 }

 endCount(){
   if (this.timeoutHandler) {
    this.timeoutHandler = null;
  }
 }


 updateCurrentSpeed(){
  this.geolocation.getCurrentPosition({ maximumAge: 0, enableHighAccuracy: true }
    ).then(position => {
    this.speedsArray.push(position.coords.speed);
    if(this.speedsArray.length > 10) {this.speedsArray.shift();}
    let avgSpeed = this.speedsArray.reduce( ( p, c ) => p + c, 0 ) / this.speedsArray.length;
    this.currentSpeed = avgSpeed ? avgSpeed * 3.6: 0;
  });
 }



 
exitApp() {
  navigator['app'].exitApp();
}



}
