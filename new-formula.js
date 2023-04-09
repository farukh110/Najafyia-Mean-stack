function round(x, mul) {
    return (Math.ceil(x / mul) * mul);
}
function convertFormula(num) {
    if (num <= 2) {
        Math.round(num);
    }else if (num <= 25) {
        num = round(num, 1);
    }else if (num <= 500) {
        num = round(num, 5);
    }else if (num <= 1000) {
        num = round(num, 10)
    }else if (num <= 10000) {
        num = round(num, 50)
    }else if (num <= 50000) {
        num = round(num, -100)
    }else if (100000 > num) {
        num = round(num, 1000)
    } 
    return num;
}
let dollar = 2000;
console.log("Dollar", convertFormula(dollar));
console.log("GBP", convertFormula(dollar * 0.757362));
console.log("Euro", convertFormula(dollar * 0.901412));