// assets/js/common.js
// Funciones y utilidades comunes para todos los métodos numéricos

// Utilidades para validación
const Validators = {
    isValidFunction: (funcStr, testValue = 1) => {
        try {
            const func = new Function('x', `return ${funcStr};`);
            const result = func(testValue);
            return !isNaN(result) && isFinite(result);
        } catch (e) {
            return false;
        }
    },

    isPositiveNumber: (value) => {
        return !isNaN(value) && parseFloat(value) > 0;
    },

    isValidNumber: (value) => {
        return !isNaN(value) && isFinite(value);
    }
};

// Utilidades para mostrar mensajes
const UI = {
    showAlert: (message, type = 'info', duration = 5000) => {
        // Remover alertas previas
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        
        // Agregar iconos según el tipo
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        alert.innerHTML = `${icons[type] || ''} ${message}`;

        const targetElement = document.querySelector('.form-section') || document.querySelector('.page-container');
        targetElement.appendChild(alert);

        // Animación de entrada
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-10px)';
        requestAnimationFrame(() => {
            alert.style.transition = 'all 0.3s ease';
            alert.style.opacity = '1';
            alert.style.transform = 'translateY(0)';
        });

        // Auto-remove
        if (duration > 0) {
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.style.opacity = '0';
                    alert.style.transform = 'translateY(-10px)';
                    setTimeout(() => alert.remove(), 300);
                }
            }, duration);
        }

        return alert;
    },

    showResults: (containerId, content) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = content;
            container.style.display = 'block';
            
            // Smooth scroll to results
            container.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    },

    hideResults: (containerId) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }
    }
};

// Utilidades matemáticas
const MathUtils = {
    evaluateFunction: (funcStr, x) => {
        try {
            // Preparar la función con reemplazos seguros
            let safeFuncStr = funcStr
                .replace(/\^/g, '**')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/exp\(/g, 'Math.exp(')
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/abs\(/g, 'Math.abs(')
                .replace(/pow\(/g, 'Math.pow(');

            const func = new Function('x', `return ${safeFuncStr};`);
            const result = func(x);
            
            if (!isFinite(result)) {
                throw new Error(`La función produce un valor no finito en x = ${x}`);
            }
            
            return result;
        } catch (e) {
            throw new Error(`Error al evaluar f(${x}): ${e.message}`);
        }
    },

    derivative: (func, x, h = 1e-8) => {
        try {
            return (func(x + h) - func(x - h)) / (2 * h);
        } catch (e) {
            throw new Error(`Error al calcular la derivada en x = ${x}: ${e.message}`);
        }
    },

    formatNumber: (num, decimals = 9) => {
        if (!isFinite(num)) return 'N/A';
        return parseFloat(num.toFixed(decimals)).toString();
    },

    calculateError: (current, previous) => {
        if (previous === 0) return 0;
        return Math.abs((current - previous) / current) * 100;
    },

    findInterval: (funcStr, searchRange = 1000, maxAttempts = 10000) => {
        let attempts = 0;
        while (attempts < maxAttempts) {
            const xa = (Math.random() - 0.5) * 2 * searchRange;
            const xb = (Math.random() - 0.5) * 2 * searchRange;
            const [xMin, xMax] = xa < xb ? [xa, xb] : [xb, xa];
            
            try {
                const fxa = MathUtils.evaluateFunction(funcStr, xMin);
                const fxb = MathUtils.evaluateFunction(funcStr, xMax);
                
                if (fxa * fxb < 0) {
                    return [xMin, xMax];
                }
            } catch (e) {
                // Continuar buscando si hay error
            }
            attempts++;
        }
        throw new Error('No se pudo encontrar un intervalo que encierre una raíz automáticamente.');
    }
};

// Generador de tablas para resultados
const TableGenerator = {
    create: (headers, data, options = {}) => {
        const { 
            tableClass = '',
            rowFormatter = null,
            cellFormatter = (value) => MathUtils.formatNumber(value)
        } = options;

        let html = `<div class="table-container">
            <table class="${tableClass}">
                <thead><tr>`;
        
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        
        html += `</tr></thead><tbody>`;
        
        data.forEach((row, index) => {
            const formattedRow = rowFormatter ? rowFormatter(row, index) : row;
            html += `<tr>`;
            
            Object.values(formattedRow).forEach(cell => {
                const formattedCell = typeof cell === 'number' ? cellFormatter(cell) : cell;
                html += `<td>${formattedCell}</td>`;
            });
            
            html += `</tr>`;
        });
        
        html += `</tbody></table></div>`;
        return html;
    }
};

// Validación de formularios en tiempo real
const FormValidation = {
    setupFunctionValidation: (inputId) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('input', function() {
            const value = this.value.trim();
            if (!value) {
                this.style.borderColor = 'var(--border-color)';
                return;
            }

            if (Validators.isValidFunction(value)) {
                this.style.borderColor = 'var(--success-color)';
                this.title = 'Función válida';
            } else {
                this.style.borderColor = 'var(--accent-color)';
                this.title = 'Función inválida - revise la sintaxis';
            }
        });
    },

    setupNumericValidation: (inputId, options = {}) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        const { min, max, required = false, positive = false } = options;

        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            let isValid = true;
            let message = '';

            if (required && (this.value.trim() === '' || isNaN(value))) {
                isValid = false;
                message = 'Campo requerido';
            } else if (this.value.trim() !== '' && isNaN(value)) {
                isValid = false;
                message = 'Debe ser un número válido';
            } else if (!isNaN(value)) {
                if (positive && value <= 0) {
                    isValid = false;
                    message = 'Debe ser un número positivo';
                } else if (min !== undefined && value < min) {
                    isValid = false;
                    message = `Debe ser mayor o igual a ${min}`;
                } else if (max !== undefined && value > max) {
                    isValid = false;
                    message = `Debe ser menor o igual a ${max}`;
                }
            }

            this.style.borderColor = isValid ? 'var(--success-color)' : 'var(--accent-color)';
            this.title = message;
        });
    }
};

// Utilidades para animaciones y efectos
const Effects = {
    highlightElement: (element, duration = 1000) => {
        if (!element) return;
        
        element.style.transition = 'background-color 0.3s ease';
        const originalBg = element.style.backgroundColor;
        element.style.backgroundColor = '#fff3cd';
        
        setTimeout(() => {
            element.style.backgroundColor = originalBg;
        }, duration);
    },

    smoothScrollTo: (elementId, offset = 0) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
};

// Configuración global cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Auto-setup para validación de campos comunes
    FormValidation.setupFunctionValidation('funcion');
    FormValidation.setupFunctionValidation('function');
    FormValidation.setupFunctionValidation('functionF');
    FormValidation.setupFunctionValidation('functionG');
    
    // Auto-setup para campos numéricos
    FormValidation.setupNumericValidation('N', { min: 1, required: true });
    FormValidation.setupNumericValidation('error_F', { min: 0, positive: true, required: true });
    FormValidation.setupNumericValidation('tolerance', { min: 0, positive: true, required: true });
    FormValidation.setupNumericValidation('maxIterations', { min: 1, required: true });
    
    // Mejorar accesibilidad
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });
});

// Exportar para uso global
window.Validators = Validators;
window.UI = UI;
window.MathUtils = MathUtils;
window.TableGenerator = TableGenerator;
window.FormValidation = FormValidation;
window.Effects = Effects;