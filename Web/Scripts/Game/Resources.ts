module Resources { 

    export class Global {
        public static musicAmbient1 = new ex.Sound("/Music/g33x-space-ambient.mp3");        
    }

    export class Tanks {
        public static dieSound = new ex.Sound("/Sounds/Die.wav");
        public static fireSound = new ex.Sound("/Sounds/Fire.wav");
        public static moveBarrelSound = new ex.Sound("/Sounds/MoveBarrel.wav");        
    }  

    export class Explosions {
        public static smallExplosion = new ex.Sound("/Sounds/Explosion-Small.wav");
    }

    export class Planet {
        public static planet1Image = new ex.Texture('/Textures/planet1.png');
        public static planet2Image = new ex.Texture('/Textures/planet2.png');
        public static planet3Image = new ex.Texture('/Textures/planet3.png');
        public static planet4Image = new ex.Texture('/Textures/planet4.png');        
    }
}