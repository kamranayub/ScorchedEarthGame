module Resources { 

    export class Global {
        public static sprintFont: Drawing.SpriteFont = new Drawing.SpriteFont("/Spritesheets/SpriteFont.png", '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ', true, 16, 3, 16, 16);
    }

    export class Tanks {
        public static dieSound: Media.ISound = new Media.Sound("/Sounds/Die.wav");
        public static fireSound: Media.ISound = new Media.Sound("/Sounds/Fire.wav");
        public static moveBarrelSound: Media.ISound = new Media.Sound("/Sounds/MoveBarrel.wav");
    }  

    export class Planet {
        public static planet1Image: HTMLImageElement;
        public static planet2Image: HTMLImageElement;
        public static planet3Image: HTMLImageElement;
        public static planet4Image: HTMLImageElement;

        constructor() {
            Planet.planet1Image = new Image();      
            Planet.planet1Image.src = '/Textures/planet1.png';    
            Planet.planet2Image = new Image();
            Planet.planet2Image.src = '/Textures/planet2.png';    
            Planet.planet3Image = new Image();
            Planet.planet3Image.src = '/Textures/planet3.png';    
            Planet.planet4Image = new Image();
            Planet.planet4Image.src = '/Textures/planet4.png';            
        }
    }
}