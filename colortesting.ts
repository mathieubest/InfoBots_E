const BOLD = "\x1b[1m";
const RED_BOLD = "\x1b[1m\x1b[31m";
const GREEN_BOLD = "\x1b[1m\x1b[32m";
const YELLOW_BOLD = "\x1b[1m\x1b[33m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

const number = 5;

console.log("We are not going to skip lines after this statement ");
// don't skip lines in this part of the code everything should print on the same line
process.stdout.write(`${RED_BOLD}Hello, World!${RESET} ${GREEN_BOLD}${number}${RESET} is the lucky number`);
process.stdout.write(` ${GREEN_BOLD}${number}${RESET} is the lucky number`);

// skip lines again
console.log();

console.log("Hello we are back in business now");