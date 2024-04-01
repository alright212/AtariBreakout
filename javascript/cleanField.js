export let bricks = [];
export let balls = [];
export let paddle = {};

export function cleanField() {
    for (let i = 0; i < balls.length; i++) {
        balls[i].node.remove();
    }
    balls.splice(0, balls.length);
    paddle.node.remove();
    paddle = {};
    removeBricks();
    bricks.splice(0, bricks.length);
}

export const ROWS = 6;
export const COLUMNS = 8;

export function createBricks() {
    for (let r = 0; r < ROWS; r++) {
        bricks[r] = [];
        for (let c = 0; c < COLUMNS; c++) {
            bricks[r][c] = {w: 0, h: 0, x: 0, y: 0, hit: false};
        }
    }
}

export function removeBricks() {
    for (let r = 0; r < bricks.length; r++) {
        for (let c = 0; c < bricks[r].length; c++) {
            if (!bricks[r][c].hit) {
                bricks[r][c].node.remove();
            }
        }
    }
}