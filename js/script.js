const buttons = document.querySelectorAll('.buttons');
const memoryButtons = document.querySelectorAll('.memory-btn');
const display = document.getElementById('result');
const history = document.getElementById('history');
let equation = "", left_part = "", right_part = "", operation = "", all_history = [];
let memoryValue = 0;
let shouldResetInput = false;
let clipboard = '';
let currentValue = 0;
let currentFormat = "decimal";
let lastResult = "0";

function get_operation() {
    let counter = 0;

    if (equation.at(0) === "-") counter = 1;
    
    if (equation.includes('ⁿ')) {
        const parts = equation.split('ⁿ');
        if (parts.length === 2) {
            const exponentPart = parts[1];
            const operationMatch = exponentPart.match(/[+\-÷×%]/);
            
            if (operationMatch) {
                return operationMatch[0];
            }
            return 'ⁿ';
        }
    }
    
    if (equation.startsWith("-")) counter = 1;
    
    const operationRegex = /(?<=[0-9])[+\-÷×%]/;
    const match = equation.substring(counter).match(operationRegex);
    
    if (match) {
        return match[0];
    }

    while (counter < equation.length && (!isNaN(Number(equation.at(counter))) || equation.at(counter) === '.'))
        counter++;

    return equation.at(counter);
}

function outputResult() {
    if (equation.includes("ⁿ")) {
        let displayHTML = "";
        let currentIndex = 0;
        
        const powerIndices = [];

        for (let i = 0; i < equation.length; i++) {
            if (equation[i] === "ⁿ") {
                powerIndices.push(i);
            }
        }
        
        for (let i = 0; i < powerIndices.length; i++) {
            const powerIndex = powerIndices[i];
            
            displayHTML += equation.substring(currentIndex, powerIndex);
            
            let baseStart = powerIndex - 1;
            
            while (baseStart >= 0 && (!isNaN(Number(equation[baseStart])) || equation[baseStart] === '.')) {
                baseStart--;
            }
            baseStart++;
            
            let exponentEnd = powerIndex + 1;
            while (exponentEnd < equation.length && (!isNaN(Number(equation[exponentEnd])) || equation[exponentEnd] === '.')) {
                exponentEnd++;
            }
            
            const base = equation.substring(baseStart, powerIndex);
            const exponent = equation.substring(powerIndex + 1, exponentEnd);
            
            displayHTML = displayHTML.substring(0, displayHTML.length - base.length) + base + "<sup>" + exponent + "</sup>";
            
            currentIndex = exponentEnd;
        }
        
        if (currentIndex < equation.length) {
            displayHTML += equation.substring(currentIndex);
        }
        
        display.innerHTML = displayHTML;
        return;
    }
    
        display.textContent = equation;
}

function calculate(button) {
    if (button === "=") {
        if (equation.includes('÷') && equation.includes('√')) {
            const parts = equation.split('÷');
            if (parts.length === 2) {
                let leftValue, rightValue;
                
                if (parts[0].startsWith('√')) {
                    const numUnderRoot = Number(parts[0].substring(1));
                    if (numUnderRoot < 0) {
                        equation = "Error";
                        return;
                    }
                    leftValue = Math.sqrt(numUnderRoot);
                } else {
                    leftValue = Number(parts[0]);
                }
                
                if (parts[1].startsWith('√')) {
                    const numUnderRoot = Number(parts[1].substring(1));
                    if (numUnderRoot < 0) {
                        equation = "Error";
                        return;
                    }
                    rightValue = Math.sqrt(numUnderRoot);
                } else {
                    rightValue = Number(parts[1]);
                }
                
                if (rightValue === 0) {
                    equation = "Error";
                    return;
                }
                
                const result = leftValue / rightValue;
                
                history.style.visibility = 'visible';
                history.textContent = equation;
                equation = String(result);
                
                all_history.push(history.textContent + '=' + equation);
                
                if (equation === "Infinity" || equation === "-Infinity" || equation === "NaN") {
                    equation = "Error";
                    return;
                }
                
                shouldResetInput = true;
                outputResult();
                return;
            }
        }
        
        if (equation.startsWith('√') && equation.includes('÷') && equation.includes('ⁿ')) {
            try {
                const sqrtMatch = equation.match(/√(\d+\.?\d*)/);
                let sqrtValue = 0;
                
                if (sqrtMatch && sqrtMatch[1]) {
                    const numUnderRoot = Number(sqrtMatch[1]);
                    if (numUnderRoot < 0) {
                        equation = "Error";
                        return;
                    }
                    sqrtValue = Math.sqrt(numUnderRoot);
                }
                
                const divIndex = equation.indexOf('÷');
                if (divIndex > 0) {
                    const afterDivision = equation.substring(divIndex + 1);
                    let rightValue = 0;
                    
                    if (afterDivision.includes('ⁿ')) {
                        const powerParts = afterDivision.split('ⁿ');
                        if (powerParts.length === 2) {
                            const base = Number(powerParts[0]);
                            const exponent = Number(powerParts[1]);
                            rightValue = Math.pow(base, exponent);
                        }
                    } else {
                        rightValue = Number(afterDivision);
                    }
                    
                    if (rightValue === 0) {
                        equation = "Error";
                        return;
                    }
                    
                    const result = sqrtValue / rightValue;
                    
                    history.style.visibility = 'visible';
                    history.textContent = equation;
                    equation = String(result);
                    
                    all_history.push(history.textContent + '=' + equation);
                    
                    if (equation === "Infinity" || equation === "-Infinity" || equation === "NaN") {
                        equation = "Error";
                        return;
                    }
                    
                    shouldResetInput = true;
                    outputResult();
                    return;
                }
            } catch (e) {
                console.error("Error calculating complex expression:", e);
                equation = "Error";
                return;
            }
        }
        
        if (equation.includes('÷') && equation.includes('ⁿ')) {
            try {
                const parts = equation.split('÷');
                if (parts.length === 2) {
                    const leftValue = Number(parts[0]);
                    
                    let rightValue = 0;
                    const rightPart = parts[1];
                    
                    if (rightPart.includes('ⁿ')) {
                        const powerParts = rightPart.split('ⁿ');
                        if (powerParts.length === 2) {
                            const base = Number(powerParts[0]);
                            const exponent = Number(powerParts[1]);
                            rightValue = Math.pow(base, exponent);
                        }
                    } else {
                        rightValue = Number(rightPart);
                    }
                    
                    if (rightValue === 0) {
                        equation = "Error";
                        return;
                    }
                    
                    const result = leftValue / rightValue;
                    
                    history.style.visibility = 'visible';
                    history.textContent = equation;
                    equation = String(result);
                    
                    all_history.push(history.textContent + '=' + equation);
                    
                    if (equation === "Infinity" || equation === "-Infinity" || equation === "NaN") {
                        equation = "Error";
                        return;
                    }
                    
                    shouldResetInput = true;
                    outputResult();
                    return;
                }
            } catch (e) {
                console.error("Error calculating division with power:", e);
                equation = "Error";
                return;
            }
        }
        
        if (equation.startsWith('√') && /[+\-×÷%]/.test(equation.substring(1))) {
            try {
                const operatorMatch = equation.substring(1).match(/[+\-×÷%]/);
                
                if (operatorMatch) {
                    const operator = operatorMatch[0];
                    const operatorIndex = equation.indexOf(operator);
                    
                    const sqrtPart = equation.substring(0, operatorIndex);
                    const rightPart = equation.substring(operatorIndex + 1);
                    
                    let sqrtValue = 0;
                    
                    if (sqrtPart.startsWith('√')) {
                        const numUnderRoot = Number(sqrtPart.substring(1));
                        if (numUnderRoot < 0) {
                            equation = "Error";
                            return;
                        }
                        sqrtValue = Math.sqrt(numUnderRoot);
                    }
                    
                    let rightValue = 0;
                    
                    if (rightPart.includes('ⁿ')) {
                        const powerParts = rightPart.split('ⁿ');
                        if (powerParts.length === 2) {
                            const base = Number(powerParts[0]);
                            const exponent = Number(powerParts[1]);
                            rightValue = Math.pow(base, exponent);
                        }
                    } else {
                        rightValue = Number(rightPart);
                    }
                    
                    let result;
                    switch(operator) {
                        case "+":
                            result = sqrtValue + rightValue;
                            break;
                        case "-":
                            result = sqrtValue - rightValue;
                            break;
                        case "×":
                            result = sqrtValue * rightValue;
                            break;
                        case "÷":
                            if (rightValue === 0) {
                                equation = "Error";
                                return;
                            }
                            result = sqrtValue / rightValue;
                            break;
                        case "%":
                            if (rightValue === 0) {
                                equation = "Error";
                                return;
                            }
                            result = Math.floor(sqrtValue % rightValue);
                            break;
                    }
                    
                    history.style.visibility = 'visible';
                    history.textContent = equation;
                    equation = String(result);
                    
                    all_history.push(history.textContent + '=' + equation);
                    
                    if (equation === "Infinity" || equation === "-Infinity" || equation === "NaN") {
                        equation = "Error";
                        return;
                    }
                    
                    shouldResetInput = true;
                    outputResult();
                    return;
                }
            } catch (e) {
                console.error("Error calculating with square root:", e);
                equation = "Error";
                return;
            }
        }
        
        if (equation.startsWith("-") && equation.substring(1).includes("-")) {
            const firstDigitIndex = 1;
            let operationIndex = -1;
            
            for (let i = firstDigitIndex + 1; i < equation.length; i++) {
                if (equation[i] === '-' && !isNaN(Number(equation[i-1]))) {
                    operationIndex = i;
                    break;
                }
            }
            
            if (operationIndex > 0) {
                const leftPart = equation.substring(0, operationIndex);
                const rightPart = equation.substring(operationIndex + 1);
                
                if (rightPart !== "") {
                    const result = Number(leftPart) - Number(rightPart);
                    
                    history.style.visibility = 'visible';
                    history.textContent = equation;
                    equation = String(result);
                    
                    all_history.push(history.textContent + '=' + equation);
                    
                    if (equation === "Infinity" || equation === "-Infinity" || equation === "NaN") {
                        equation = "Error";
                        return;
                    }
                    
                    shouldResetInput = true;
                    outputResult();
                    return;
                }
            }
        }

        if (equation.includes("√") && /[+\-×÷%]/.test(equation)) {

            const operatorMatch = equation.match(/[+\-×÷%]/);
            
            if (operatorMatch) {
                const operator = operatorMatch[0];
                const operatorIndex = equation.indexOf(operator);
                
                let leftPart = equation.substring(0, operatorIndex);
                let rightPart = equation.substring(operatorIndex + 1);
                
                let leftValue, rightValue;
                
                if (leftPart.startsWith("√")) {
                    const numUnderRoot = Number(leftPart.substring(1));
                    if (numUnderRoot < 0) {
                        equation = "Error";
                        return;
                    }
                    leftValue = Math.sqrt(numUnderRoot);
                } else {
                    leftValue = Number(leftPart);
                }
                
                if (rightPart.startsWith("√")) {
                    const numUnderRoot = Number(rightPart.substring(1));
                    if (numUnderRoot < 0) {
                        equation = "Error";
                        return;
                    }
                    rightValue = Math.sqrt(numUnderRoot);
                } else {
                    rightValue = Number(rightPart);
                }
                
                let result;
                switch(operator) {
                    case "+":
                        result = leftValue + rightValue;
                        break;
                    case "-":
                        result = leftValue - rightValue;
                        break;
                    case "×":
                        result = leftValue * rightValue;
                        break;
                    case "÷":
                        if (rightValue === 0) {
                            equation = "Error";
                            return;
                        }
                        result = leftValue / rightValue;
                        break;
                    case "%":
                        if (rightValue === 0) {
                            equation = "Error";
                            return;
                        }
                        result = Math.floor(leftValue % rightValue);
                        break;
                }
                
                history.style.visibility = 'visible';
                history.textContent = equation;
                equation = String(result);
                
                all_history.push(history.textContent + '=' + equation);
                
                if (equation === "Infinity" || equation === "-Infinity" || equation === "NaN") {
                    equation = "Error";
                    return;
                }
                
                shouldResetInput = true;
                outputResult();
                return;
            }
        }

        if (equation.includes('ln')) {
            const lnRegex = /ln(\d+\.?\d*)/;
            const operationRegex = /[+\-×÷%]/;
            
            const equationCopy = equation;
            
            const lnMatch = equation.match(lnRegex);
            if (lnMatch && lnMatch[1]) {
                const base = Number(lnMatch[1]);
                
                const lnResult = Math.log(base);
                
                const operationMatch = equation.match(/ln\d+\.?\d*([+\-×÷%])/);
                
                if (operationMatch && operationMatch[1]) {
                    const operation = operationMatch[1];
                    const rightPartMatch = equation.match(new RegExp(`ln\\d+\\.?\\d*\\${operation}(\\d+\\.?\\d*)`));
                    
                    if (rightPartMatch && rightPartMatch[1]) {
                        const rightValue = Number(rightPartMatch[1]);
                        let result;
                        
                        switch(operation) {
                            case "+":
                                result = lnResult + rightValue;
                                break;
                            case "-":
                                result = lnResult - rightValue;
                                break;
                            case "×":
                                result = lnResult * rightValue;
                                break;
                            case "÷":
                                if (rightValue === 0) {
                                    equation = "Error";
                                    return;
                                }
                                result = lnResult / rightValue;
                                break;
                            case "%":
                                if (rightValue === 0) {
                                    equation = "Error";
                                    return;
                                }
                                result = Math.floor(lnResult % rightValue);
                                break;
                        }
                        
                        history.style.visibility = 'visible';
                        history.textContent = equationCopy;
                        equation = String(result);
                        
                        all_history.push(equationCopy + '=' + equation);
                        
                        if (equation === "Infinity" || equation === "-Infinity" || equation === "NaN") {
                            equation = "Error";
                        }
                        
                        shouldResetInput = true;
                        outputResult();
                        return;
                    }
                } else {
                    history.style.visibility = 'visible';
                    history.textContent = equationCopy;
                    equation = String(lnResult);
                    
                    all_history.push(equationCopy + '=' + equation);
                    
                    if (equation === "Infinity" || equation === "-Infinity" || equation === "NaN") {
                        equation = "Error";
                    }
                    
                    shouldResetInput = true;
                    outputResult();
                    return;
                }
            }
        }

        if (equation.startsWith("√") && equation.includes("ⁿ")) {
            const expressionUnderRoot = equation.slice(1);
            
            const parts = expressionUnderRoot.split("ⁿ");
            if (parts.length === 2) {
                const base = Number(parts[0]);
                const exponent = Number(parts[1]);
                
                const powerResult = Math.pow(base, exponent);
                const sqrtResult = Math.sqrt(powerResult);
                
                history.style.visibility = 'visible';
                history.textContent = equation;
                equation = String(sqrtResult);
                
                all_history.push(history.textContent + '=' + equation);
                
                if (equation === "Infinity" || equation === "-Infinity" || equation === "NaN") {
                    equation = "Error";
                    return;
                }
                
                shouldResetInput = true;
                outputResult();
                return;
            }
        }
        
        if (equation.includes("ⁿ")) {
            let processedEquation = equation;
            const powerRegex = /(\d+)ⁿ(\d+)/g;
            
            processedEquation = processedEquation.replace(powerRegex, (match, base, exponent) => {
                return Math.pow(Number(base), Number(exponent));
            });
            
            if (/[+\-×÷%]/.test(processedEquation)) {
                const opMatch = processedEquation.match(/[+\-×÷%]/);
                if (opMatch) {
                    const op = opMatch[0];
                    const parts = processedEquation.split(op);
                    
                    if (parts.length >= 2) {
                        let left = Number(parts[0]);
                        let right = Number(parts[1]);
                        
                        let result;
                        switch(op) {
                            case "+":
                                result = left + right;
                                break;
                            case "-":
                                result = left - right;
                                break;
                            case "×":
                                result = left * right;
                                break;
                            case "÷":
                                if (right === 0) {
                                    equation = "Error";
                                    return;
                                }
                                result = left / right;
                                break;
                            case "%":
                                if (right === 0) {
                                    equation = "Error";
                                    return;
                                }
                                result = Math.floor(left % right);
                                break;
                        }
                        
                        history.style.visibility = 'visible';
                        history.textContent = equation;
                        equation = String(result);
                        
                        all_history.push(processedEquation + '=' + equation);
                        console.log(all_history);
                        
                        if (equation === "Infinity" || equation === "-Infinity" || equation === "NaN") {
                            equation = "Error";
                        }
                        
                        outputResult();
                        return;
                    }
                }
            }
        }

        operation = get_operation();

        if (!operation) return;

        if (equation.includes("ⁿ") && (equation.includes("+") || equation.includes("-") || 
            equation.includes("×") || equation.includes("÷") || equation.includes("%"))) {
                
            const parts = equation.split("ⁿ");
            if (parts.length === 2) {
                const exponentPart = parts[1];
                const operationIndex = exponentPart.search(/[+\-÷×%]/);
                
                if (operationIndex >= 0) {
                    const base = parts[0];
                    const exponent = exponentPart.substring(0, operationIndex);
                    const powerResult = Math.pow(Number(base), Number(exponent));
                    
                    const op = exponentPart.charAt(operationIndex);
                    const rightSide = exponentPart.substring(operationIndex + 1);
                    
                    switch(op) {
                        case "+":
                            equation = String(powerResult + Number(rightSide));
                            break;
                        case "-":
                            equation = String(powerResult - Number(rightSide));
                            break;
                        case "×":
                            equation = String(powerResult * Number(rightSide));
                            break;
                        case "÷":
                            if (Number(rightSide) === 0) {
                                equation = "Error";
                                return;
                            }
                            equation = String(powerResult / Number(rightSide));
                            break;
                        case "%":
                            if (Number(rightSide) === 0) {
                                equation = "Error";
                                return;
                            }
                            equation = String(Math.floor(powerResult % Number(rightSide)));
                            break;
                    }
                    
                    history.style.visibility = 'visible';
                    history.textContent = equation;
                    outputResult();
                    return;
                }
            }
        }

        left_part = equation.slice(0, equation.indexOf(operation));
        right_part = equation.slice(equation.indexOf(operation) + 1);

        if (left_part === "") left_part = "0";
        if (right_part === "") right_part = "0";

        history.style.visibility = 'visible';
        history.textContent = equation;

        const equation_copy = equation;

        switch (operation) {
            case "+":
                equation = String(Number(left_part) + Number(right_part));
                break;
            case "-":
                equation = String(Number(left_part) - Number(right_part));
                break;
            case "×":
                equation = String(Number(left_part) * Number(right_part));
                break;
            case "÷":
                if (Number(right_part) === 0) {
                    equation = "Error";
                    return;
                }
                equation = String(Number(left_part) / Number(right_part));
                break;
            case "%":
                if (Number(right_part) === 0) {
                    equation = "Error";
                    return;
                }
                equation = String(Math.floor(Number(left_part) % Number(right_part)));
                break;
            case "!":
                const number = Math.floor(Number(equation.slice(0, equation.indexOf("!"))));
                if (number < 0) {
                    equation = "Error";
                    return;
                }
                let sum = 1;
                for (let i = 1; i <= number; i++)
                    sum *= i;
                equation = String(sum);
                break;
            case "√":
                equation = equation.replace(equation.at(0), "");
                const num = Number(equation);
                if (num < 0) {
                    equation = "Error";
                    return;
                }
                equation = String(Math.sqrt(num));
                break;
            case "ⁿ":
                equation = String(Math.pow(Number(left_part), Number(right_part)));
                break;

        }

        all_history.push(equation_copy + '=' + equation);
        console.log(all_history);

        if (equation === "Infinity" || equation === "-Infinity" || equation === "NaN") {
            equation = "Error";
            return;
        }
        
        shouldResetInput = true;
    }

    outputResult();
}

buttons.forEach(button => {
    button.addEventListener('click', () => {
        if (equation === "Error") {
            equation = "";
            currentValue = 0;
            currentFormat = "decimal";
        }

        const isDigit = !isNaN(Number(button.textContent));
        const isSqrt = button.textContent === "√";
        
        if (shouldResetInput && (isDigit || isSqrt)) {
            equation = "";
            currentValue = 0;
            currentFormat = "decimal";
            shouldResetInput = false;
        }

        if (equation.at(0) === "0" && equation.length === 1)
            equation = "";

        const hasOperation = equation.slice(1).match(/[+\-÷×%]/);
        const isOperation = button.textContent === "+" || button.textContent === "-" ||
                      button.textContent === "×" || button.textContent === "÷" ||
                      button.textContent === "%";

        if (button.textContent === "⧉") {
            if (equation !== "" && equation !== "Error") {
                copyToClipboard(equation);
            }
            return;
        }
        
        if (button.textContent === "i") {
            pasteFromClipboard();
            return;
        }

        if (button.textContent === "=") {
            calculate("=");
            return;
        }

        if (shouldResetInput && isOperation) {
            shouldResetInput = false;
        }

        if (equation.includes("ⁿ") && isOperation) {
            const powerParts = equation.split("ⁿ");
            if (powerParts.length === 2 && !powerParts[1].match(/[+\-÷×%]/)) {
                equation += button.textContent;
                outputResult();
                return;
            }
        }

        if (isOperation && button.textContent === "-" && equation === "") {
            equation = "-";
            outputResult();
            return;
        }

        if (hasOperation && isOperation) {
            calculate("=");
            if (equation !== "Error") {
                equation += button.textContent;
            }
        }
        else {
            if (button.textContent === ".") {
                if (hasOperation) {
                    const rightPart = equation.slice(equation.indexOf(hasOperation[0]) + 1);
                    if (rightPart.includes(".")) {
                        return;
                    }
                } else {
                    if (equation.includes(".")) {
                        return;
                    }
                }
            }

            if (button.textContent !== "±" && button.textContent !== "xⁿ")
                equation += button.textContent;

            if (button.textContent === "xⁿ") {
                const lastChar = equation.slice(-1);
                if (!isNaN(Number(lastChar))) {
                    equation += "ⁿ";
                    outputResult();
                }
                return;
            }

            if (equation.includes("C")) {
                equation = "0";
                currentValue = 0;
                currentFormat = "decimal";
                history.style.visibility = "hidden";
            }

            if (equation.includes("←")) {
                equation = equation.replace(equation.at(-2), "");
                equation = equation.replace(equation.at(-1), "");

                if (equation.length === 0) {
                    equation = "0";
                    currentValue = 0;
                    currentFormat = "decimal";
                    history.style.visibility = "hidden";
                }
            }

            if (button.textContent === "±") {
                if (equation === "" || equation === "0") return;

                if (hasOperation) {
                    const opIndex = equation.search(/[+\-÷×%]/);
                    const operator = equation.charAt(opIndex);
                    const leftPart = equation.substring(0, opIndex);
                    let rightPart = equation.substring(opIndex + 1);

                    if (rightPart === "") return;

                    if (rightPart.startsWith("-")) {
                        rightPart = rightPart.slice(1);
                    }
                    else {
                        rightPart = "-" + rightPart;
                    }

                    equation = leftPart + operator + rightPart;
                }
                else {
                    if (equation.startsWith("-")) {
                        equation = equation.slice(1);
                    }
                    else {
                        equation = "-" + equation;
                    }
                }
            }

            if (button.textContent === "m" || button.textContent === "km" || button.textContent === "cm") {
                if (equation.includes("²") || equation.includes("h")) {
                    equation = "Error";
                }
                else {
                    if (button.textContent === "m") {
                        button.textContent = "km";
                        equation = equation.replace('m', '');
                        if (!equation.includes("c")) {
                            equation = equation.replace('m', '');
                            equation = `${Number(equation)}m`
                        }
                        else {
                            equation = equation.replace('cm', '');
                            equation = `${Number(equation) / 100}m`;
                        }
                    }
                    else if (button.textContent === "km") {
                        button.textContent = "cm";
                        equation = equation.replace('km', '');
                        equation = equation.replace('m', '');
                        equation = `${Number(equation / 1000)}km`
                    }
                    else if (button.textContent === "cm") {
                        button.textContent = "m";
                        equation = equation.replace('cm', '');
                        equation = equation.replace('km', '');
                        equation = `${Number(equation * 100000)}cm`
                    }
                }
            }

            if (button.textContent === "m²" || button.textContent === "km²" || button.textContent === "cm²" || button.textContent === "h") {
                if (button.textContent === "m²") {
                    button.textContent = "km²";
                    equation = equation.replace('cm²', '');
                    equation = equation.replace('m²', '');
                    equation = `${Number(equation / 10000)}m²`
                }
                else if (button.textContent === "km²") {
                    button.textContent = "h";
                    equation = equation.replace('km²', '');
                    equation = equation.replace('m²', '');
                    equation = `${Number(equation / 1000000)}m²`
                }
                else if (button.textContent === "h") {
                    button.textContent = "cm²";
                    equation = equation.replace('h', '');
                    if (!equation.includes("m²")) {
                        equation = equation.replace('h', '');
                        equation = `${Number(equation)}h`
                    }
                    else {
                        equation = equation.replace('m²', '');
                        equation = `${Number(equation) * 100}h`;
                    }
                }
                else if (button.textContent === "cm²") {
                    button.textContent = "m²";
                    equation = equation.replace('h', '');
                    equation = equation.replace('cm²', '');
                    equation = `${Number(equation * 100000000)}cm²`
                }
            }

            if (button.textContent === "kg" || button.textContent === "gr" || button.textContent === "t") {
                if (equation.includes("m") || equation.includes("h")) {
                    equation = "Error";
                }
                else {
                    if (button.textContent === "kg") {
                        button.textContent = "t";
                        equation = equation.replace('kg', '');
                        if (!equation.includes("r")) {
                            equation = equation.replace('kg', '');
                            equation = `${Number(equation)}kg`
                        }
                        else {
                            equation = equation.replace('gr', '');
                            equation = `${Number(equation) / 1000}kg`;
                        }
                    }
                    else if (button.textContent === "t") {
                        button.textContent = "gr";
                        equation = equation.replace('kg', '');
                        equation = equation.replace('t', '');
                        equation = `${Number(equation / 1000)}t`
                    }
                    else if (button.textContent === "gr") {
                        button.textContent = "kg";
                        equation = equation.replace('gr', '');
                        equation = equation.replace('t', '');
                        equation = `${Number(equation * 1000000)}gr`
                    }
                }
            }

            if (button.textContent === "b" || button.textContent === "d" || button.textContent === "x") {
                if (equation.includes("m") || equation.includes("kg") || (equation.includes("h") && button.textContent !== "h")) {
                    equation = "Error";
                    currentValue = 0;
                    currentFormat = "decimal";
                } else {
                    try {
                        function decimalToBinary(decString) {
                            if (decString === "0") return "0";
                            const decimal = parseInt(decString, 10);
                            if (isNaN(decimal)) return "0";
                            return decimal.toString(2);
                        }
                        
                        function binaryToDecimal(binString) {
                            if (binString === "0") return "0";
                            return parseInt(binString, 2).toString(10);
                        }
                        
                        function decimalToHex(decString) {
                            if (decString === "0") return "0";
                            const decimal = parseInt(decString, 10);
                            if (isNaN(decimal)) return "0";
                            return "0x" + decimal.toString(16).toUpperCase();
                        }
                        
                        function hexToDecimal(hexString) {
                            if (hexString === "0") return "0";
                            const cleanHex = hexString.replace(/^0x/i, '');
                            if (cleanHex === "0") return "0";
                            return parseInt(cleanHex, 16).toString(10);
                        }
                        
                        function hexToBinary(hexString) {
                            if (hexString === "0") return "0";
                            const cleanHex = hexString.replace(/^0x/i, '');
                            
                            if (cleanHex === "0") return "0";
                            
                            if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
                                return "0";
                            }
                            
                            const hexTable = {
                                '0': '0000', '1': '0001', '2': '0010', '3': '0011',
                                '4': '0100', '5': '0101', '6': '0110', '7': '0111',
                                '8': '1000', '9': '1001', 'A': '1010', 'B': '1011',
                                'C': '1100', 'D': '1101', 'E': '1110', 'F': '1111',
                                'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
                                'e': '1110', 'f': '1111'
                            };
                            
                            let binaryResult = '';
                            
                            for (let i = 0; i < cleanHex.length; i++) {
                                const hexDigit = cleanHex[i];
                                binaryResult += hexTable[hexDigit];
                            }
                            
                            if (binaryResult.length > 4) {
                                binaryResult = binaryResult.slice(0, -4);
                            }
                            
                            return binaryResult;
                        }
                        
                        if (button.textContent === "b") {
                            if (equation === "0") {
                                equation = "0";
                            } else if (currentFormat === "decimal") {
                                equation = decimalToBinary(equation);
                            } else if (currentFormat === "hex") {
                                equation = hexToBinary(equation);
                            }
                            currentFormat = "binary";
                            button.textContent = "d";
                        } else if (button.textContent === "d") {
                            if (equation === "0") {
                                equation = "0";
                            } else if (currentFormat === "binary") {
                                equation = binaryToDecimal(equation);
                            } else if (currentFormat === "hex") {
                                equation = hexToDecimal(equation);
                            }
                            currentFormat = "decimal";
                            button.textContent = "x";
                        } else if (button.textContent === "x") {
                            if (equation === "0") {
                                equation = "0";
                            } else if (currentFormat === "binary") {
                                const decimalValue = binaryToDecimal(equation);
                                equation = decimalToHex(decimalValue);
                            } else if (currentFormat === "decimal") {
                                equation = decimalToHex(equation);
                            }
                            currentFormat = "hex";
                            button.textContent = "b";
                        }
                        
                        currentValue = 0;
                        shouldResetInput = false;
                    } catch (e) {
                        console.error("Conversion error:", e);
                        equation = "0";
                        currentValue = 0;
                        currentFormat = "decimal";
                    }
                    outputResult();
                }
                return;
            }

            calculate(button.textContent);
        }
    })
})

memoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        switch(button.textContent) {
            case "MC":
                memoryValue = 0;
                break;
            case "MR":
                if (equation !== "Error" && equation !== "") {
                    if (equation.indexOf('+') > 0 || equation.indexOf('-') > 0 || 
                        equation.indexOf('×') > 0 || equation.indexOf('÷') > 0 || 
                        equation.indexOf('%') > 0 || equation.indexOf('ⁿ') >= 0) {
                        calculate("=");
                    }
                    
                    memoryValue = Number(equation);
                    
                    let oldEquation = equation;
                    equation = "M: " + String(memoryValue);
                    outputResult();
                    
                    shouldResetInput = true;
                    
                    setTimeout(function() {
                        equation = oldEquation;
                        outputResult();
                    }, 500);
                }
                break;
            case "M+":
                if (equation !== "Error" && equation !== "") {
                    if (equation.indexOf('+') > 0 || equation.indexOf('-') > 0 || 
                        equation.indexOf('×') > 0 || equation.indexOf('÷') > 0 || 
                        equation.indexOf('%') > 0 || equation.indexOf('ⁿ') >= 0) {
                        calculate("=");
                    }
                    
                    let displayValue = equation;
                    
                    memoryValue += Number(equation);
                    
                    equation = String(memoryValue);
                    outputResult();
                    
                    shouldResetInput = true;
                    
                    setTimeout(function() {
                        if (display.textContent === equation) {
                            equation = "";
                        }
                    }, 100);
                }
                break;
            case "M-":
                if (equation !== "Error" && equation !== "") {
                    if (equation.indexOf('+') > 0 || equation.indexOf('-') > 0 || 
                        equation.indexOf('×') > 0 || equation.indexOf('÷') > 0 || 
                        equation.indexOf('%') > 0 || equation.indexOf('ⁿ') >= 0) {
                        calculate("=");
                    }
                    
                    let displayValue = equation;
                    
                    memoryValue -= Number(equation);
                    
                    equation = String(memoryValue);
                    outputResult();
                    
                    shouldResetInput = true;
                    
                    setTimeout(function() {
                        if (display.textContent === equation) {
                            equation = "";
                        }
                    }, 100);
                }
                break;
            case "𝞹":
                const hasOperation = equation.match(/[+\-÷×%]/);
                const piValue = Math.PI.toFixed(4);

                if (hasOperation) {
                    const operationIndex = equation.search(/[+\-÷×%]/);
                    const operationType = equation[operationIndex];
                    const leftPart = equation.substring(0, operationIndex);
                    
                    const rightPart = equation.substring(operationIndex + 1);
                    
                    if (rightPart === "") {
                        equation = leftPart + operationType + piValue;
                    } else {
                        const leftValue = Number(leftPart);
                        let result;
                        
                        switch(operationType) {
                            case "+":
                                result = leftValue + Number(piValue);
                                break;
                            case "-":
                                result = leftValue - Number(piValue);
                                break;
                            case "×":
                                result = leftValue * Number(piValue);
                                break;
                            case "÷":
                                result = leftValue / Number(piValue);
                                break;
                            case "%":
                                result = Math.floor(leftValue % Number(piValue));
                                break;
                        }
                        
                        equation = String(result);
                    }
                } else if (equation === "" || equation === "0" || shouldResetInput) {
                    equation = piValue;
                    shouldResetInput = false;
                } else {
                    equation = String((Number(equation) + Number(piValue)).toFixed(4));
                }
                
                outputResult();
                break;
        }
    });
});

document.getElementById("result").addEventListener("click", () => {
    if (all_history.length > 0) {
        if (display.textContent.includes("\n") && display.textContent.includes("=")) {
            const lines = all_history[all_history.length - 1].split('=');
            if (lines.length >= 2) {
                equation = lines[lines.length - 1].trim();
            } else {
                equation = lastResult;
            }
            history.style.visibility = "hidden";
            outputResult();
        } else {
            lastResult = equation;
            
            history.style.visibility = "hidden";
            equation = '';
            
            for (let i = 0; i < all_history.length; i++) {
                equation += all_history[i] + '\n';
            }
            outputResult();
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && display.textContent.includes("\n") && display.textContent.includes("=")) {

        equation = lastResult;
        history.style.visibility = "hidden";
        outputResult();
    }
});

function copyToClipboard(text) {
    const isViewingHistory = display.textContent.includes("\n") && display.textContent.includes("=");
    
    if (isViewingHistory) {
        let historyText = '';
        for (let i = 0; i < all_history.length; i++) {
            historyText += all_history[i] + '\n';
        }
        clipboard = historyText;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(historyText).then(() => {
                const oldEquation = equation;
                equation = "H:";
                outputResult();
                
                setTimeout(() => {
                    equation = oldEquation;
                    outputResult();
                }, 700);
            }).catch(error => {
                oldSchoolCopy(historyText);
            });
        } else {
            oldSchoolCopy(historyText);
        }
    } else {
        clipboard = text;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                const oldEquation = equation;
                equation = "Copied!";
                outputResult();
                
                setTimeout(() => {
                    equation = oldEquation;
                    outputResult();
                }, 700);
            }).catch(error => {
                oldSchoolCopy(text);
            });
        } else {
            oldSchoolCopy(text);
        }
    }
    
    function oldSchoolCopy(copyText) {
        const tempText = document.createElement('textarea');
        tempText.value = copyText;
        tempText.style.position = 'absolute';
        tempText.style.left = '-9999px';
        document.body.appendChild(tempText);
        
        tempText.select();
        document.execCommand('copy');
        
        const oldEquation = equation;
        equation = copyText.includes("\n") ? "H:" : "Copied!";
        outputResult();
        
        setTimeout(() => {
            equation = oldEquation;
            outputResult();
        }, 700);
        
        document.body.removeChild(tempText);
    }
}

function pasteFromClipboard() {
    if (navigator.clipboard) {
        navigator.clipboard.readText().then(function(clipText) {
            if (clipText && clipText.length > 0) {
                processClipboardText(clipText);
            } else if (clipboard && clipboard.length > 0) {
                processClipboardText(clipboard);
            }
        }).catch(function(err) {
            oldWayPaste();
        });
    } else {
        oldWayPaste();
    }

    function processClipboardText(text) {
        const calculationRegex = /(.+)=(.+)/;
        
        if (text.includes('=') && (text.includes('\n') || calculationRegex.test(text))) {
            history.style.visibility = "hidden";
            
            const lines = text.split('\n').filter(line => line.trim() !== '');
            all_history = [];
            
            let validHistory = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line && line.includes('=')) {
                    all_history.push(line);
                    validHistory = true;
                }
            }
            
            if (validHistory) {
                equation = '';
                for (let i = 0; i < all_history.length; i++) {
                    equation += all_history[i] + '\n';
                }
                
                const lastHistoryItem = all_history[all_history.length - 1];
                const lastResultMatch = lastHistoryItem.match(calculationRegex);
                if (lastResultMatch && lastResultMatch[2]) {
                    lastResult = lastResultMatch[2].trim();
                }
                
                outputResult();
                shouldResetInput = true;
                return;
            }
        }

        if (text.toLowerCase().startsWith("0x")) {
            currentFormat = "hex";
        } else if (/^[01]+$/.test(text)) {
            currentFormat = "binary";
        } else {
            text = text.replace(/[^0-9.\-]/g, '');
            currentFormat = "decimal";
        }
        
        const hasOperation = equation.match(/[+\-÷×%]/);
        
        if (hasOperation && hasOperation.index === equation.length - 1) {
            if (!isNaN(Number(text))) {
                equation += text;
            } else if (!isNaN(Number(text.replace(',', '.')))) {
                equation += text.replace(',', '.');
            } else {
                equation += text;
            }
        } else if (equation === "0" || equation === "" || equation === "Error" || shouldResetInput) {
            if (!isNaN(Number(text))) {
                equation = String(Number(text));
            } else if (!isNaN(Number(text.replace(',', '.')))) {
                equation = String(Number(text.replace(',', '.')));
            } else {
                equation = text;
            }
            shouldResetInput = false;
        } else {
            if (!isNaN(Number(text))) {
                equation += text;
            } else if (!isNaN(Number(text.replace(',', '.')))) {
                equation += text.replace(',', '.');
            } else {
                equation += text;
            }
        }
        
        outputResult();
    }

    function oldWayPaste() {
        let tempInput = document.createElement('input');
        tempInput.style.position = 'absolute';
        tempInput.style.left = '-1000px';
        tempInput.style.top = '-1000px';
        document.body.appendChild(tempInput);
        
        tempInput.focus();
        let success = false;
        
        try {
            success = document.execCommand('paste');
        } catch(err) { }
        
        if (success) {
            const pastedText = tempInput.value;
            
            if (pastedText && pastedText.length > 0) {
                processClipboardText(pastedText);
            } else if (clipboard && clipboard.length > 0) {
                processClipboardText(clipboard);
            }
        } else if (clipboard && clipboard.length > 0) {
            processClipboardText(clipboard);
        }
        
        document.body.removeChild(tempInput);
    }
}