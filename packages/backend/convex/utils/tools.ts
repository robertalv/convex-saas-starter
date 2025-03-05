/**
 * @function getRandomColor
 * @returns {string} - The random color in hex format
 * @description This function will return a random color in hex format
 */
export function getRandomColor(): string {
    // Black, White, Brown in hex format
    const avoidColors = ['#000000', '#FFFFFF', '#8B4513'];

    let randomColor;
    do {
        // Generate random RGB values, with a bias towards brighter colors
        // Random number between 0-255
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        // Convert RGB to hex format
        randomColor = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
    } while (avoidColors.includes(randomColor));

    return randomColor;
}