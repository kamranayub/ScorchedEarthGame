module Resources { 

    export class Global {
        public static musicAmbient1: PreloadedSound = new PreloadedSound("/Music/g33x-space-ambient.mp3");        
    }

    export class Tanks {
        public static dieSound: PreloadedSound = new PreloadedSound("/Sounds/Die.wav");
        public static fireSound: PreloadedSound = new PreloadedSound("/Sounds/Fire.wav");
        public static moveBarrelSound: PreloadedSound = new PreloadedSound("/Sounds/MoveBarrel.wav");        
    }  

    export class Explosions {
        public static smallExplosion: PreloadedSound = new PreloadedSound("/Sounds/Explosion-Small.wav");
    }

    export class Planet {
        public static planet1Image: PreloadedImage = new PreloadedImage('/Textures/planet1.png');
        public static planet2Image: PreloadedImage = new PreloadedImage('/Textures/planet2.png');
        public static planet3Image: PreloadedImage = new PreloadedImage('/Textures/planet3.png');
        public static planet4Image: PreloadedImage = new PreloadedImage('/Textures/planet4.png');        
    }
}