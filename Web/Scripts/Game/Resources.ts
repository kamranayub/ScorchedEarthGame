module Resources { 

    export class Global {
        public static sprintFont: Drawing.SpriteFont = new Drawing.SpriteFont("/Spritesheets/SpriteFont.png", '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ', true, 16, 3, 16, 16);
    }

    export class Tanks {
        public static fireSound: Media.ISound = new Media.Sound("/Sounds/Fire.wav");
        public static moveBarrelSound: Media.ISound = new Media.Sound("/Sounds/MoveBarrel.wav");
    }  
}