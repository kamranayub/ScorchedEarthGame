/// <reference path="DOM.ts" />

class UI {

    private btnToolbarNewGame: HTMLElement;
    private btnToolbarToggleMusic: HTMLElement;
    private uiNewGame: HTMLElement;
    private uiGame: HTMLElement;
    private btnStartGame: HTMLElement;

    private hudTop: HTMLElement;
    private hudPower: HTMLElement;

    constructor(private game: Game) {
        this.uiGame = DOM.id('game');
        this.uiNewGame = DOM.id('ui-new-game');
        this.btnToolbarNewGame = DOM.id('toolbar-new-game');        
        this.btnToolbarToggleMusic = DOM.id('toolbar-toggle-music');
        this.btnStartGame = DOM.id('btn-start-game');

        // hud
        this.hudTop = DOM.id('game-hud-top');
        this.hudPower = DOM.query('#game-hud-power span');

        // init
        this.init();
    }

    private init(): void {
        
        // add event listeners
        this.btnToolbarNewGame.addEventListener('click', this.showNewGame.bind(this));
        this.btnToolbarToggleMusic.addEventListener('click', this.onToggleMusicClicked.bind(this));
        DOM.query('form', this.uiNewGame).addEventListener('submit', this.onNewGame.bind(this));

        this.showNewGame();
    }

    private showNewGame(): void {
        this.showDialog(this.uiNewGame);
    }

    private onNewGame(e: Event): void {
        e.preventDefault();

        var settings = new GameSettings();

        var mapSizeElement = DOM.idOf<HTMLSelectElement>('mapsize');
        var enemyElement = DOM.idOf<HTMLInputElement>('enemies');
        var enemies = parseInt(enemyElement.value, 10);

        settings.mapSize = parseInt(mapSizeElement.value, 10);

        switch (settings.mapSize) {
            case MapSize.Small:
                settings.enemies = Math.min(2, enemies);
                break;
            case MapSize.Medium:
                settings.enemies = Math.min(5, enemies);
                break;
            case MapSize.Large:
                settings.enemies = Math.min(9, enemies);
                break;
            case MapSize.Huge:
                settings.enemies = Math.min(19, enemies);
                break;
            default:
                alert('Map size is invalid');
                return;
                break;
        } 

        this.btnStartGame.blur();
        this.hideDialog(this.uiNewGame);        
        this.game.newGame(settings);        
    }

    private onToggleMusicClicked(): void {
        var icon = DOM.query('i', this.btnToolbarToggleMusic);

        if (DOM.hasClass(icon, 'fa-volume-up')) {
            DOM.replaceClass(icon, 'fa-volume-up', 'fa-volume-off');
            this.game.stopMusic();
        } else {
            DOM.replaceClass(icon, 'fa-volume-off', 'fa-volume-up');
            this.game.startMusic();
        }
    }

    public showHUD(): void {
        DOM.show(this.hudTop);
    }

    public updateFirepower(power: number): void {
        this.hudPower.innerText = power.toString();
    }

    private showDialog(dialog: HTMLElement): void {
        DOM.show(dialog);
        setTimeout(() => DOM.addClass(dialog, 'show'), 10);
    }

    private hideDialog(dialog: HTMLElement): void {
        DOM.onTransitionEnd(dialog, () => DOM.hide(dialog));
        DOM.removeClass(dialog, 'show');        
    }
}