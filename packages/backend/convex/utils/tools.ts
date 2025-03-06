/**
 * @function getRandomColor
 * @returns {string} - The random color in hex format
 * @description This function will return a random color in hex format
 */
export function getRandomColor(): string {
    const avoidColors = ['#000000', '#FFFFFF', '#8B4513'];
    let randomColor;
    do {
        const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
        randomColor = `#${r}${g}${b}`;
    } while (avoidColors.includes(randomColor));
    return randomColor;
}