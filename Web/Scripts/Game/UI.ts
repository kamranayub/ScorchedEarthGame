/// <reference path="DOM.ts" />

class UI {

    private toggleMusicBtn: HTMLElement;

    constructor(private game: Game) {

        this.toggleMusicBtn = DOM.id('toggle-music');
        this.toggleMusicBtn.addEventListener('click', this.onToggleMusicClicked.bind(this));
    }

    private onToggleMusicClicked(): void {
        var icon = DOM.query('i', this.toggleMusicBtn);

        if (DOM.hasClass(icon, 'fa-volume-up')) {
            DOM.replaceClass(icon, 'fa-volume-up', 'fa-volume-off');
            this.game.stopMusic();
        } else {
            DOM.replaceClass(icon, 'fa-volume-off', 'fa-volume-up');
            this.game.startMusic();
        }
    }
}