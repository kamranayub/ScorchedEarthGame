class MapConfigurationFactory {

    public static getMapConfiguration(mapSize: MapSize): IMapConfiguration {
        switch (mapSize) {
            case MapSize.Small:
                return new SmallMapConfiguration();
            case MapSize.Medium:
                return new MediumMapConfiguration();
            case MapSize.Large:
                return new LargeMapConfiguration();
            case MapSize.Huge:
                return new HugeMapConfiguration();
            default:
                throw new Error("Could not find configuration for that map size");
        }
    }

}


interface IMapConfiguration {
    maxPlanets: number;

    planetMinRadius: number;

    planetMaxRadius: number;

    width: number;

    height: number;
}

class SmallMapConfiguration implements IMapConfiguration {

    public maxPlanets: number = 8;

    public planetMinRadius: number = 35;

    public planetMaxRadius: number = 150;

    public width: number = 2048;

    public height: number = 2048;
}

class MediumMapConfiguration implements IMapConfiguration {

    public maxPlanets: number = 15;

    public planetMinRadius: number = 50;

    public planetMaxRadius: number = 200;

    public width: number = 3072;

    public height: number = 3072;
}

class LargeMapConfiguration implements IMapConfiguration {

    public maxPlanets: number = 20;

    public planetMinRadius: number = 50;

    public planetMaxRadius: number = 200;

    public width: number = 4608;

    public height: number = 4608;
}

class HugeMapConfiguration implements IMapConfiguration {

    public maxPlanets: number = 30;

    public planetMinRadius: number = 50;

    public planetMaxRadius: number = 200;

    public width: number = 13824;

    public height: number = 13824;
}