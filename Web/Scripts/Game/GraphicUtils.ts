class GraphicUtils {

    /**
     * Determines whether or not the given color is present
     * in the given pixel array.
     */
    public static isPixelColorOf(pixels: number[], color: Color): boolean {

        // pixel = 4 sets of RGBA
        for (var i = 0; i < pixels.length; i += 4) {
            if (pixels[i] === color.r &&
                pixels[i + 1] === color.g &&
                pixels[i + 2] === color.b &&
                pixels[i + 3] === Math.floor(color.a * 255)) {
                return true;
            }
        }

        return false;
    }

}