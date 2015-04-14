class DOM {

    /**
     * Gets a DOM element by ID
     * @param id The ID to search by
     */
    public static id(id: string): HTMLElement {
        return document.getElementById(id);
    }

    /**
     * Gets a DOM element by ID
     * @param id The ID to search by
     */
    public static idOf<T extends HTMLElement>(id: string): T {
        return <T>document.getElementById(id);
    }

    /**
     * Gets a single DOM element by a selector
     * @param selector The selector
     * @param ctx A context to search from (default: null)
     */
    public static query(selector: string, ctx: HTMLElement = null): HTMLElement {
        ctx = ctx || document.body;

        return <HTMLElement>ctx.querySelector(selector);
    }

    /**
     * Hides a DOM element
     */
    public static hide(element: HTMLElement): void {
        element.style.display = 'none';
    }

    /**
     * Shows a DOM element
     */
    public static show(element: HTMLElement): void {
        element.style.display = 'block';
    }

    /**
     * Toggles a CSS class on an element
     * @param element The DOM element to manipulate
     * @param cls The CSS class to toggle
     * @returns True if the class existed and false if not
     */
    public static toggleClass(element: HTMLElement, cls: string): boolean {

        if (this.hasClass(element, cls)) {
            this.removeClass(element, cls);
            return true;
        } else {
            this.addClass(element, cls);
            return false;
        }

    }

    /**
     * Replaces a CSS class on an element
     * @param element The DOM element to manipulate
     * @param search The CSS class to find
     * @param replace The CSS class to replace with
     */
    public static replaceClass(element: HTMLElement, search: string, replace: string): void {

        if (this.hasClass(element, search)) {
            this.removeClass(element, search);
            this.addClass(element, replace);
        }

    }

    /**
     * Whether or not an element has a CSS class present
     * @param element The DOM element to check
     * @param cls The CSS class to check for
     * @returns True if the class exists and false if not
     */
    public static hasClass(element: HTMLElement, cls: string): boolean {
        return element.classList.contains(cls);
    }

    /**
     * Adds a CSS class to a DOM element
     * @param element The DOM element to manipulate
     * @param cls The CSS class to add
     */
    public static addClass(element: HTMLElement, cls: string): void {
        element.classList.add(cls);
    }

    /**
     * Removes a CSS class to a DOM element
     * @param element The DOM element to manipulate
     * @param cls The CSS class to remove
     */
    public static removeClass(element: HTMLElement, cls: string): void {
        element.classList.remove(cls);
    }

    public static onAnimationEnd(element: HTMLElement, done: () => void): void {
        var animationEndEvent = typeof AnimationEvent === 'undefined' ?
            'webkitAnimationEnd' : 'animationend';

        var handler = () => {
            element.removeEventListener(animationEndEvent, handler);

            done();
        };

        element.addEventListener(animationEndEvent, handler);
    }

    public static onTransitionEnd(element: HTMLElement, done: () => void): void {
        var transitionEndEvent = typeof AnimationEvent === 'undefined' ?
            'webkitTransitionEnd' : 'transitionend';

        var handler = () => {
            element.removeEventListener(transitionEndEvent, handler);

            done();
        };

        element.addEventListener(transitionEndEvent, handler);
    }
}