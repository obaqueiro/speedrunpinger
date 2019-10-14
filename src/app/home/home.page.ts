import { Component } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {
  isStarted:boolean = false;
  buttonLabel:string = 'Start';
  timeoutHandler:any;
  speed: string = '7.2';
  currentSpeed: number=0;
  presets = {
    'preset1': "Preset 1",
    'preset2': "Preset 2"
  }
  
  intervalSeconds:number = 15;
  geoLocationIntervalHandler: any;

  pressStart:number;
  

  speedsArray:number[] = [];

  constructor(private geolocation: Geolocation, private storage: Storage) {
    console.log('starting')
    this.geoLocationIntervalHandler = setInterval(()=>{this.updateCurrentSpeed()},700);
    Object.keys(this.presets).forEach(key=>{
        storage.get(key).then(item => { this.presets[key] = item}).catch(()=>{
          this.presets[key] = 'Preset';
        });
    });
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
      if(!isNaN(this.presets[preset])) {
        this.speed = this.presets[preset];
      }
  }

  holdCount(preset: string){
    console.log(this.pressStart);
    if (!this.pressStart) {
      this.pressStart = Date.now();
    }
    setTimeout(() => {
        if(!this.pressStart) return;
        this.presets[preset] = this.speed;
        this.storage.set(preset, this.speed);
        
    }, 2000);
    
  
  
 }

 endCount(){
   console.log('button up');
   this.pressStart = undefined;
 }


 updateCurrentSpeed(){
   //Dummy one, which will result in a working next statement.
  this.geolocation.getCurrentPosition().then(()=>{});
  this.geolocation.getCurrentPosition({ maximumAge: 0, enableHighAccuracy: true }
    ).then(position => {
    this.speedsArray.push(position.coords.speed);
    if(this.speedsArray.length > 5) {this.speedsArray.shift();}
    let avgSpeed = this.speedsArray.reduce( ( p, c ) => p + c, 0 ) / this.speedsArray.length;
    this.currentSpeed = avgSpeed ? avgSpeed * 3.6: 0;
  });
 }
 
exitApp() {
  navigator['app'].exitApp();
}



}
