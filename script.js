tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Whitney', 'Inter', 'sans-serif']
            },
            colors: {
                'dark-blue': '#002359',
                'blue': '#002D72',
                'cyan-40': '#99D9F2',
                'cyan-20': '#CCECF9',
                'light-grey': '#F5F3F3',
                'white': '#FFFFFF',
                'coal': '#333333',
                'blue-60': '#627CA5',
                'blue-15': '#D1D5E0',
                'coral': '#F66380',
                'cyan': '#009FDF',
                'stop-red': '#D9576F',
                'caution-yellow': '#F2C248',
                'go-green': '#52CC7B',
                // New chart colors from provided image
                'chart-dark-blue': '#002359',
                'chart-yale-blue': '#12337E',
                'chart-violet-blue': '#1E4B8B',
                'chart-crayola-blue': '#447DF7',
                'chart-jordy-blue': '#9BBEFA',
                'chart-lavender': '#D8E4FD',
            }
        }
    }
}

// Data and elements
let elements = {};

// Chart contexts

// Initial assets, liabilities and income with unique IDs
let assets = [
    { id: 'asset-1', name: 'Likvider', value: 2000000, max: 10000000, color: '#002359' },
    { id: 'asset-2', name: 'Fast eiendom', value: 15000000, max: 50000000, color: '#12337E' },
    { id: 'asset-3', name: 'Investeringer', value: 8000000, max: 30000000, color: '#1E4B8B' }
];

// Add 'Likvider fra finansiering' as a new asset type
const cashFromFinancing = {
    id: 'asset-fin-cash',
    name: 'Likvider fra Gjeld',
    value: 0,
    max: 5000000,
    color: '#447DF7'
};
assets.push(cashFromFinancing);


let liabilities = [
    { id: 'liability-1', name: 'Boliglån', value: 10000000, max: 20000000, color: '#D9576F' },
    { id: 'liability-2', name: 'Likvider fra Gjeld', value: 1000000, max: 5000000, color: '#F66380' }
];

let income = [
    { id: 'income-1', name: 'Lønnsinntekt', value: 1500000, max: 5000000, color: '#52CC7B' },
    { id: 'income-2', name: 'Utbytter', value: 0, max: 1000000, color: '#83C48E' },
    { id: 'income-3', name: 'Andre inntekter', value: 0, max: 1000000, color: '#A5D6A7' }
];

// Function to format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(value);
};
const formatPercentage = (value) => {
    return (value * 100).toFixed(1) + '%';
};

// Function to calculate loan payment based on type
const calculateLoanPayment = (principal, rate, years, loanType) => {
    if (principal === 0 || years === 0) {
        return { monthly: 0, annual: 0, interest: 0, principal: 0 };
    }
    
    const annualRate = rate;
    const monthlyRate = annualRate / 12;
    const numberOfPayments = years * 12;

    if (loanType === 'annuity') {
        if (annualRate === 0) {
            const annualPrincipal = principal / years;
            return { monthly: annualPrincipal / 12, annual: annualPrincipal, interest: 0, principal: annualPrincipal };
        }
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        const annualPayment = monthlyPayment * 12;
        
        // First year's interest and principal payment
        const firstYearInterest = principal * annualRate;
        const firstYearPrincipal = annualPayment - firstYearInterest;

        return { monthly: monthlyPayment, annual: annualPayment, interest: firstYearInterest, principal: firstYearPrincipal };
    } else if (loanType === 'serial') {
        const annualPrincipal = principal / years;
        const firstYearInterest = principal * annualRate;
        const firstYearTotal = annualPrincipal + firstYearInterest;
        
        return { monthly: firstYearTotal / 12, annual: firstYearTotal, interest: firstYearInterest, principal: annualPrincipal };
    }

    return { monthly: 0, annual: 0, interest: 0, principal: 0 };
};

// Function to update the T-Account chart
const updateTAccountChart = (totalAssets, totalLiabilities, netWorth) => {
    const assetsContainer = document.getElementById('assets-bar-container');
    const financingContainer = document.getElementById('financing-bar-container');

    // Clear previous elements
    assetsContainer.innerHTML = '';
    financingContainer.innerHTML = '';

    const total = totalAssets;
    const gapHeight = 16; // Height of the gap in pixels for better spacing
    // Use container gap so there's no extra space at the bottom/top
    assetsContainer.style.gap = `${gapHeight}px`;
    financingContainer.style.gap = `${gapHeight}px`;
    const minHeightPx = 72; // Minimum height for each bar to keep small values readable

    // Render assets
    const assetValues = assets.map(asset => asset.value);
    const totalAssetValues = assetValues.reduce((sum, value) => sum + value, 0);

    assets.forEach((asset, index) => {
        if (asset.value > 0) {
            const heightPercentage = totalAssetValues > 0 ? (asset.value / totalAssetValues) * 100 : 0;
            const assetDiv = document.createElement('div');
            assetDiv.className = `w-full relative flex items-center justify-center text-center transition-all duration-300 rounded-md`;
            assetDiv.style.backgroundColor = asset.color;
            assetDiv.style.height = `max(${heightPercentage}%, ${minHeightPx}px)`; // Use max to ensure minimum height
            assetDiv.innerHTML = `<span class="text-white text-sm font-bold p-2">${asset.name}<br>${formatCurrency(asset.value)}</span>`;
            assetsContainer.appendChild(assetDiv);
        }
    });
    
    // Render financing (liabilities and equity)
    const financingValues = [totalLiabilities, netWorth];
    const totalFinancingValues = financingValues.reduce((sum, value) => sum + value, 0);

    if (totalLiabilities > 0) {
        const liabilitiesDiv = document.createElement('div');
        const liabilityHeightPercentage = totalFinancingValues > 0 ? (totalLiabilities / totalFinancingValues) * 100 : 0;
        liabilitiesDiv.className = `w-full relative flex items-center justify-center text-center transition-all duration-300 rounded-md`;
        liabilitiesDiv.style.height = `max(${liabilityHeightPercentage}%, ${minHeightPx}px)`;
        liabilitiesDiv.style.backgroundColor = '#D9576F';
        liabilitiesDiv.innerHTML = `<span class="text-white text-sm font-bold p-2">Gjeld<br>${formatCurrency(totalLiabilities)}</span>`;
        financingContainer.appendChild(liabilitiesDiv);
    }

    if (netWorth > 0) {
        const equityDiv = document.createElement('div');
        const equityHeightPercentage = totalFinancingValues > 0 ? (netWorth / totalFinancingValues) * 100 : 0;
        equityDiv.className = `w-full relative flex items-center justify-center text-center transition-all duration-300 rounded-md`;
        equityDiv.style.height = `max(${equityHeightPercentage}%, ${minHeightPx}px)`;
        equityDiv.style.backgroundColor = '#52CC7B';
        equityDiv.innerHTML = `<span class="text-white text-sm font-bold p-2">Egenkapital<br>${formatCurrency(netWorth)}</span>`;
        financingContainer.appendChild(equityDiv);
    }
};

// Calculate and apply a scale so the whole dashboard fits within the viewport at 100% browser zoom
const fitDashboardToViewport = () => {
    const root = document.getElementById('dashboard-root');
    if (!root) return;

    // Reset scale to measure natural size
    root.style.transform = 'scale(1)';
    root.style.width = '';
    root.style.height = '';

    // Available viewport size minus body padding to leave some whitespace
    const computed = window.getComputedStyle(document.body);
    const padLeft = parseFloat(computed.paddingLeft) || 0;
    const padRight = parseFloat(computed.paddingRight) || 0;
    const padTop = parseFloat(computed.paddingTop) || 0;
    const padBottom = parseFloat(computed.paddingBottom) || 0;
    const viewportWidth = window.innerWidth - padLeft - padRight;
    const viewportHeight = window.innerHeight - padTop - padBottom;

    const rect = root.getBoundingClientRect();
    const contentWidth = rect.width;
    const contentHeight = rect.height;

    // Scale to fit both width and height so alt innhold er synlig.
    const scaleX = viewportWidth / (contentWidth + 2);
    const scaleY = viewportHeight / (contentHeight + 2);
    // Add a small safety margin so vi får litt luft nederst/øverst
    const scale = Math.min(scaleX, scaleY) * 0.98;

    // Apply scale centered with equal frame on all sides
    const scaledWidth = contentWidth * scale;
    const scaledHeight = contentHeight * scale;
    const offsetX = Math.max(0, (viewportWidth - scaledWidth) / 2);
    const offsetY = Math.max(0, (viewportHeight - scaledHeight) / 2);
    root.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
};

// Function to update the background fill of the range input
function updateRangeFill(input, value, max, fillColor) {
    const percentage = (value / max) * 100;
    input.style.setProperty('background', `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${percentage}%, var(--track-unfilled) ${percentage}%, var(--track-unfilled) 100%)`);
}

// Main update function
const updateDashboard = () => {
    const mortgageValue = liabilities.find(l => l.id === 'liability-1')?.value || 0;
    const annualInterestRate = parseFloat(document.getElementById('interest-rate-range').value) / 100;
    const loanTerm = parseInt(document.getElementById('loan-term-range').value);
    const loanType = document.getElementById('loan-type').value;
    const liquidityLiability = liabilities.find(l => l.id === 'liability-2');
    const annenGjeldValue = liquidityLiability?.value || 0;
    const annualCosts = parseInt(document.getElementById('annual-costs-range')?.value || '0');
    const annualTax = parseInt(document.getElementById('annual-tax-range')?.value || '0');

    // Update display values and range fill for fixed elements
    document.getElementById('loan-term-value').textContent = `${loanTerm} år`;
    updateRangeFill(document.getElementById('loan-term-range'), loanTerm, document.getElementById('loan-term-range').max, '#F66380');
    document.getElementById('interest-rate-value').textContent = `${parseFloat(document.getElementById('interest-rate-range').value).toFixed(1)} %`;
    updateRangeFill(document.getElementById('interest-rate-range'), parseFloat(document.getElementById('interest-rate-range').value), document.getElementById('interest-rate-range').max, '#D9576F');
    
    // Update "Likvider fra finansiering" based on "Annen gjeld" and mirror slider UI
    const cashFromFinancingAsset = assets.find(a => a.id === 'asset-fin-cash');
    if (cashFromFinancingAsset) {
        cashFromFinancingAsset.value = annenGjeldValue;
        const cashInput = document.getElementById(cashFromFinancingAsset.id);
        if (cashInput) {
            // Set slider value and label, and update fill color
            cashInput.value = annenGjeldValue;
            const display = cashInput.parentElement?.querySelector('.asset-value-display');
            if (display) {
                display.textContent = formatCurrency(annenGjeldValue);
            }
            updateRangeFill(cashInput, annenGjeldValue, cashInput.max, cashFromFinancingAsset.color);
        }
    }


    // Calculate totals from dynamic assets
    let totalAssets = 0;
    const assetLabels = [];
    const assetData = [];
    assets.forEach(asset => {
        totalAssets += asset.value;
        assetLabels.push(asset.name);
        assetData.push(asset.value);
    });

    // Update the dynamic asset sliders
    const assetInputs = document.getElementById('assets-container').querySelectorAll('input[type="range"]');
    const assetDisplays = document.getElementById('assets-container').querySelectorAll('.asset-value-display');
    assetInputs.forEach((input, index) => {
        updateRangeFill(input, input.value, input.max, assets[index].color);
        assetDisplays[index].textContent = formatCurrency(parseInt(input.value));
    });

    // Calculate totals from dynamic liabilities
    let totalLiabilities = 0;
    liabilities.forEach(liability => {
        totalLiabilities += liability.value;
    });
    
    // Update the dynamic liability sliders
    const liabilityInputs = document.getElementById('liabilities-container').querySelectorAll('input[type="range"]');
    const liabilityDisplays = document.getElementById('liabilities-container').querySelectorAll('.liability-value-display');
    liabilityInputs.forEach((input, index) => {
        const liability = liabilities[index]; // Corrected
        updateRangeFill(input, input.value, input.max, liability.color);
        liabilityDisplays[index].textContent = formatCurrency(parseInt(input.value));
    });

    // Calculate totals from dynamic income
    let totalAnnualIncome = 0;
    income.forEach(inc => {
        totalAnnualIncome += inc.value;
    });

    // Costs do not affect KPI ratios; keep gross income for calculations

    const incomeInputs = document.getElementById('income-container').querySelectorAll('input[type="range"]');
    const incomeDisplays = document.getElementById('income-container').querySelectorAll('.income-value-display');
    incomeInputs.forEach((input, index) => {
        updateRangeFill(input, input.value, input.max, income[index].color);
        incomeDisplays[index].textContent = formatCurrency(parseInt(input.value));
    });


    const netWorth = totalAssets - totalLiabilities;
    const equity = totalAssets - totalLiabilities;
    const annualPayment = calculateLoanPayment(mortgageValue, annualInterestRate, loanTerm, loanType);
    // Interest-only payments for all other liabilities (e.g., Ny gjeld, Likvider fra Gjeld)
    const interestOnlyForOtherDebts = liabilities
        .filter(l => l.id !== 'liability-1')
        .reduce((sum, l) => sum + (l.value * annualInterestRate), 0);

    // Update summary
    document.getElementById('total-assets').textContent = formatCurrency(totalAssets);
    document.getElementById('total-liabilities').textContent = formatCurrency(totalLiabilities);
    document.getElementById('net-worth').textContent = formatCurrency(netWorth);
    // Update percentage badges for liabilities and equity
    const equityPercent = totalAssets > 0 ? (netWorth / totalAssets) * 100 : 0;
    const liabilitiesPercent = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const equityPercentEl = document.getElementById('equity-percent');
    const liabilitiesPercentEl = document.getElementById('liabilities-percent');
    if (equityPercentEl) equityPercentEl.textContent = `(${equityPercent.toFixed(0)}%)`;
    if (liabilitiesPercentEl) liabilitiesPercentEl.textContent = `(${liabilitiesPercent.toFixed(0)}%)`;
    if (netWorth < 0) {
        document.getElementById('net-worth').classList.remove('text-go-green');
        document.getElementById('net-worth').classList.add('text-stop-red');
    } else {
        document.getElementById('net-worth').classList.remove('text-stop-red');
        document.getElementById('net-worth').classList.add('text-go-green');
    }

    // Update T-account
    updateTAccountChart(totalAssets, totalLiabilities, netWorth);

    // Update tables
    
    document.getElementById('ratios-table-body').innerHTML = '';
    const totalAnnualPayment = annualPayment.annual + interestOnlyForOtherDebts;
    const loanToIncomeRatio = totalAnnualIncome > 0 ? totalLiabilities / totalAnnualIncome : 0;
    const debtToEquityRatio = equity > 0 ? totalLiabilities / equity : 0;
    const annualPaymentToIncomeRatio = totalAnnualIncome > 0 ? totalAnnualPayment / totalAnnualIncome : 0;
    const totalAnnualCosts = annualCosts + annualTax;
    const annualCashFlow = totalAnnualIncome - totalAnnualCosts - totalAnnualPayment;
    const recommendedLiquidityBuffer = (totalAnnualIncome / 12) * 2;

    const incomeToDebtRec = 0.2; // Minst 20%
    const statusIncomeToDebt = totalLiabilities > 0 && totalAnnualIncome / totalLiabilities >= incomeToDebtRec;
    const checkIncomeToDebt = statusIncomeToDebt ? '<i class="fa-solid fa-check check-icon"></i>' : '<i class="fa-solid fa-xmark cross-icon"></i>';
    
    const paymentToIncomeRec = 0.3; // Maks 30%
    const statusPaymentToIncome = totalAnnualIncome > 0 && annualPaymentToIncomeRatio <= paymentToIncomeRec;
    const checkPaymentToIncome = statusPaymentToIncome ? '<i class="fa-solid fa-check check-icon"></i>' : '<i class="fa-solid fa-xmark cross-icon"></i>';

    const loanToIncomeRec = 5; // Maks 5
    const statusLoanToIncome = totalAnnualIncome > 0 && loanToIncomeRatio <= loanToIncomeRec;
    const checkLoanToIncome = statusLoanToIncome ? '<i class="fa-solid fa-check check-icon"></i>' : '<i class="fa-solid fa-xmark cross-icon"></i>';
    
    const debtToEquityRec = 2.5; // Maks 2.5
    const statusDebtToEquity = equity > 0 && debtToEquityRatio <= debtToEquityRec;
    const checkDebtToEquity = statusDebtToEquity ? '<i class="fa-solid fa-check check-icon"></i>' : '<i class="fa-solid fa-xmark cross-icon"></i>';

    
    const ratios = [
        { label: 'Sum inntekter', value: totalAnnualIncome, format: formatCurrency, recommended: '-', status: null },
        { label: 'Årlige kostnader', value: totalAnnualCosts, format: formatCurrency, recommended: '-', status: null },
        { label: 'Renter og avdrag per år', value: totalAnnualPayment, format: formatCurrency, recommended: '-', status: null },
        { label: 'Kontantstrøm per år', value: annualCashFlow, format: formatCurrency, recommended: '-', status: null },
        { label: 'Anbefalt bufferkonto / Likviditetsfond', value: 0, format: formatCurrency, recommended: formatCurrency(recommendedLiquidityBuffer), status: null },
        { label: 'Sum Inntekter / Gjeld', value: totalLiabilities > 0 ? totalAnnualIncome / totalLiabilities : 0, format: (val) => `${val.toFixed(2)}x`, recommended: `> 20%`, status: checkIncomeToDebt },
        { label: 'Renter og avdrag / Sum inntekter', value: annualPaymentToIncomeRatio, format: formatPercentage, recommended: `< 30%`, status: checkPaymentToIncome },
        { label: 'Gjeld / Sum inntekter', value: loanToIncomeRatio, format: (val) => `${val.toFixed(2)}x`, recommended: `< 5x`, status: checkLoanToIncome },
        { label: 'Gjeldsgrad (gjeld / egenkapital)', value: debtToEquityRatio, format: (val) => `${val.toFixed(2)}x`, recommended: `< 2.5x`, status: checkDebtToEquity },
    ];
    
    ratios.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200';
        const formattedValue = item.format(item.value);
        row.innerHTML = `
            <td class="py-2 px-4">${item.label}</td>
            <td class="py-2 px-4 font-semibold text-right">${formattedValue}</td>
            <td class="py-2 px-4 font-semibold text-right">${item.recommended} ${item.status ? item.status : ''}</td>
        `;
        document.getElementById('ratios-table-body').appendChild(row);
    });

    // Ensure the layout still fits the screen after content changes
    fitDashboardToViewport();
};

// Function to create a new asset input
const createAssetInput = (asset) => {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'w-full';
    
    let innerHtml = ``;

    if (asset.id === 'asset-fin-cash') {
        // Render with the exact same slider row design as other assets, but make it read-only
        innerHtml = `
            <div class="slider-row w-full">
                <input type="text" value="${asset.name}" class="asset-name-input p-2 border border-blue-15 rounded-md text-sm bg-white text-coal" readonly>
                <div class="range-container">
                    <input type="range" id="${asset.id}" min="0" max="${asset.max}" step="100000" value="${asset.value}" class="asset-value-input rounded-lg appearance-none cursor-not-allowed" disabled>
                    <span class="asset-value-display value-label text-sm font-semibold">${formatCurrency(asset.value)}</span>
                </div>
                <button class="remove-asset-btn text-blue-60 hover:text-dark-blue transition-colors duration-200 p-2">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
    } else {
        innerHtml = `
            <div class="slider-row w-full">
                <input type="text" value="${asset.name}" class="asset-name-input p-2 border border-blue-15 rounded-md text-sm bg-white text-coal" placeholder="Navn på eiendel">
                <div class="range-container">
                    <input type="range" id="${asset.id}" min="0" max="${asset.max}" step="100000" value="${asset.value}" class="asset-value-input rounded-lg appearance-none cursor-pointer">
                    <span class="asset-value-display value-label text-sm font-semibold">${formatCurrency(asset.value)}</span>
                </div>
                <button class="remove-asset-btn text-blue-60 hover:text-dark-blue transition-colors duration-200 p-2">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
    }
    
    inputGroup.innerHTML = innerHtml;

    // Add event listeners for dynamic assets
    if (asset.id !== 'asset-fin-cash') {
        const valueInput = inputGroup.querySelector('.asset-value-input');
        const nameInput = inputGroup.querySelector('.asset-name-input');
        const removeBtn = inputGroup.querySelector('.remove-asset-btn');

        const updateAsset = () => {
            const index = assets.findIndex(a => a.id === asset.id);
            if (index > -1) {
                assets[index].value = parseInt(valueInput.value);
                assets[index].name = nameInput.value;
                updateDashboard();
            }
        };

        valueInput.addEventListener('input', updateAsset);
        nameInput.addEventListener('input', updateAsset);
        removeBtn.addEventListener('click', () => {
            assets = assets.filter(a => a.id !== asset.id);
            inputGroup.remove();
            updateDashboard();
        });
    }
    return inputGroup;
};

// Function to create a new liability input
const createLiabilityInput = (liability) => {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'w-full';
    inputGroup.innerHTML = `
        <div class="slider-row w-full">
            <input type="text" value="${liability.name}" class="liability-name-input p-2 border border-blue-15 rounded-md text-sm bg-white text-coal" placeholder="Navn på gjeld">
            <div class="range-container">
                <input type="range" id="${liability.id}" min="0" max="${liability.max}" step="100000" value="${liability.value}" class="liability-value-input rounded-lg appearance-none cursor-pointer">
                <span class="liability-value-display value-label text-sm font-semibold">${formatCurrency(liability.value)}</span>
            </div>
            <button class="remove-liability-btn text-blue-60 hover:text-dark-blue transition-colors duration-200 p-2">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `;
    const valueInput = inputGroup.querySelector('.liability-value-input');
    const nameInput = inputGroup.querySelector('.liability-name-input');
    const valueDisplay = inputGroup.querySelector('.liability-value-display');
    const removeBtn = inputGroup.querySelector('.remove-liability-btn');

    const updateLiability = () => {
        const index = liabilities.findIndex(l => l.id === liability.id);
        if (index > -1) {
            const newValue = parseInt(valueInput.value);
            liabilities[index].value = newValue;
            liabilities[index].name = nameInput.value;
            updateDashboard();
        }
    };
    
    valueInput.addEventListener('input', updateLiability);
    nameInput.addEventListener('input', updateLiability);
    removeBtn.addEventListener('click', () => {
        liabilities = liabilities.filter(l => l.id !== liability.id);
        inputGroup.remove();
        updateDashboard();
    });
    return inputGroup;
};

// Function to create a new income input
const createIncomeInput = (incomeItem) => {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'w-full';
    inputGroup.innerHTML = `
        <div class="slider-row w-full">
            <input type="text" value="${incomeItem.name}" class="income-name-input p-2 border border-blue-15 rounded-md text-sm bg-white text-coal" placeholder="Navn på inntekt">
            <div class="range-container">
                <input type="range" id="${incomeItem.id}" min="0" max="${incomeItem.max}" step="100000" value="${incomeItem.value}" class="income-value-input rounded-lg appearance-none cursor-pointer">
                <span class="income-value-display value-label text-sm font-semibold">${formatCurrency(incomeItem.value)}</span>
            </div>
            <button class="remove-income-btn text-blue-60 hover:text-dark-blue transition-colors duration-200 p-2">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `;
    const valueInput = inputGroup.querySelector('.income-value-input');
    const nameInput = inputGroup.querySelector('.income-name-input');
    const valueDisplay = inputGroup.querySelector('.income-value-display');
    const removeBtn = inputGroup.querySelector('.remove-income-btn');
    
    const updateIncome = () => {
        const index = income.findIndex(i => i.id === incomeItem.id);
        if (index > -1) {
            income[index].value = parseInt(valueInput.value);
            income[index].name = nameInput.value;
            valueDisplay.textContent = formatCurrency(parseInt(valueInput.value));
            updateDashboard();
        }
    };

    valueInput.addEventListener('input', updateIncome);
    nameInput.addEventListener('input', updateIncome);
    removeBtn.addEventListener('click', () => {
        income = income.filter(i => i.id !== incomeItem.id);
        inputGroup.remove();
        updateDashboard();
    });

    return inputGroup;
};

// Function to render all assets, liabilities and income
const renderAssets = () => {
    elements.assetsContainer.innerHTML = '';
    assets.forEach(asset => {
        elements.assetsContainer.appendChild(createAssetInput(asset));
    });
};

const renderLiabilities = () => {
    elements.liabilitiesContainer.innerHTML = '';
    liabilities.forEach(liability => {
        elements.liabilitiesContainer.appendChild(createLiabilityInput(liability));
    });
};

const renderIncome = () => {
    elements.incomeContainer.innerHTML = '';
    income.forEach(incomeItem => {
        elements.incomeContainer.appendChild(createIncomeInput(incomeItem));
    });
};


// Initial render
window.onload = () => {
    elements = {
        assetsContainer: document.getElementById('assets-container'),
        addAssetBtn: document.getElementById('add-asset-btn'),
        liabilitiesContainer: document.getElementById('liabilities-container'),
        addLiabilityBtn: document.getElementById('add-liability-btn'),
        incomeContainer: document.getElementById('income-container'),
        addIncomeBtn: document.getElementById('add-income-btn'),
        loanTerm: document.getElementById('loan-term-range'),
        interestRate: document.getElementById('interest-rate-range'),
        loanType: document.getElementById('loan-type'),
        loanTermValue: document.getElementById('loan-term-value'),
        interestRateValue: document.getElementById('interest-rate-value'),
        totalAssets: document.getElementById('total-assets'),
        totalLiabilities: document.getElementById('total-liabilities'),
        netWorth: document.getElementById('net-worth'),
        ratiosTableBody: document.getElementById('ratios-table-body')
    };
    
    // Add 'Likvider fra finansiering' as a new asset type
    const cashFromFinancing = {
        id: 'asset-fin-cash',
        name: 'Likvider fra Gjeld',
        value: 0,
        max: 5000000,
        color: '#447DF7'
    };
    
    // Ensure cashFromFinancing is in assets if it's not a dynamic asset
    if (!assets.find(a => a.id === cashFromFinancing.id)) {
         assets.push(cashFromFinancing);
    }
    
    renderAssets();
    renderLiabilities();
    renderIncome();
    
    // Add listeners after elements and charts are initialized
    elements.addAssetBtn.addEventListener('click', () => {
        const newId = `asset-${Date.now()}`;
        // Match color with "Likvider fra Gjeld" and set default value/range
        const newAsset = { id: newId, name: 'Ny eiendel', value: 1000000, max: 10000000, color: '#447DF7' };
        assets.push(newAsset);
        elements.assetsContainer.appendChild(createAssetInput(newAsset));
        updateDashboard();
    });

    elements.addLiabilityBtn.addEventListener('click', () => {
        const newId = `liability-${Date.now()}`;
        const newLiability = { id: newId, name: 'Ny gjeld', value: 100000, max: 1000000, color: '#F66380' };
        liabilities.push(newLiability);
        elements.liabilitiesContainer.appendChild(createLiabilityInput(newLiability));
        updateDashboard();
    });

    elements.addIncomeBtn.addEventListener('click', () => {
        const newId = `income-${Date.now()}`;
        const newIncome = { id: newId, name: 'Ny inntekt', value: 0, max: 1000000, color: '#A5D6A7' };
        income.push(newIncome);
        elements.incomeContainer.appendChild(createIncomeInput(newIncome));
        updateDashboard();
    });

    elements.loanTerm.addEventListener('input', updateDashboard);
    elements.interestRate.addEventListener('input', updateDashboard);
    elements.loanType.addEventListener('change', updateDashboard);
    
    // Add event listener for dynamic liability input to update cash from financing
    document.getElementById('liabilities-container').addEventListener('input', (event) => {
        const target = event.target;
        if (target.classList.contains('liability-value-input') || target.classList.contains('liability-name-input')) {
            const liquidityLiability = liabilities.find(l => l.id === 'liability-2');
            const cashFromFinancingAsset = assets.find(a => a.id === 'asset-fin-cash');
            if (liquidityLiability && cashFromFinancingAsset) {
                const liqElement = document.getElementById(liquidityLiability.id);
                if (liqElement) {
                    const liqValue = parseInt(liqElement.value);
                    cashFromFinancingAsset.value = liqValue;
                    updateDashboard();
                }
            }
        }
    });

    updateDashboard();
    // Initial fit after first render
    fitDashboardToViewport();

    // Toggle KPI visibility and expand chart
    const kpiCard = document.getElementById('kpi-card');
    const tAccountCard = document.getElementById('taccount-card');
    const toggleBtn = document.getElementById('toggle-kpi-btn');
    const kpiRail = document.getElementById('kpi-rail');
    const annualCostsRange = document.getElementById('annual-costs-range');
    const annualCostsValue = document.getElementById('annual-costs-value');
    const removeAnnualCostsBtn = document.getElementById('remove-annual-costs-btn');
    const annualTaxRange = document.getElementById('annual-tax-range');
    const annualTaxValue = document.getElementById('annual-tax-value');
    const removeAnnualTaxBtn = document.getElementById('remove-annual-tax-btn');
    if (toggleBtn && kpiCard && tAccountCard) {
        toggleBtn.addEventListener('click', () => {
            const hidden = kpiCard.classList.toggle('hidden');
            if (hidden) {
                toggleBtn.innerHTML = '<i class="fa-solid fa-eye"></i> Vis';
                toggleBtn.setAttribute('aria-pressed', 'true');
                // On large screens, expand T-account to take KPI column as well
                tAccountCard.classList.add('lg:col-span-2');
            } else {
                toggleBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Skjul';
                toggleBtn.setAttribute('aria-pressed', 'false');
                tAccountCard.classList.remove('lg:col-span-2');
            }
            // Recalculate fit after layout change
            setTimeout(fitDashboardToViewport, 0);
        });
    }

    // Wire up annual costs slider
    if (annualCostsRange && annualCostsValue) {
        const updateCosts = () => {
            const value = parseInt(annualCostsRange.value);
            annualCostsValue.textContent = formatCurrency(value);
            updateRangeFill(annualCostsRange, value, annualCostsRange.max, '#F2C248');
            updateDashboard();
        };
        annualCostsRange.addEventListener('input', updateCosts);
        updateCosts();
    }

    // Remove annual costs row
    if (removeAnnualCostsBtn) {
        removeAnnualCostsBtn.addEventListener('click', () => {
            const group = document.getElementById('annual-costs-group');
            if (group) {
                const range = document.getElementById('annual-costs-range');
                if (range) range.value = 0;
                updateDashboard();
                group.remove();
            }
        });
    }

    // Wire up annual tax slider
    if (annualTaxRange && annualTaxValue) {
        const updateTax = () => {
            const value = parseInt(annualTaxRange.value);
            annualTaxValue.textContent = formatCurrency(value);
            updateRangeFill(annualTaxRange, value, annualTaxRange.max, '#F2C248');
            updateDashboard();
        };
        annualTaxRange.addEventListener('input', updateTax);
        updateTax();
    }

    // Remove annual tax row
    if (removeAnnualTaxBtn) {
        removeAnnualTaxBtn.addEventListener('click', () => {
            const group = document.getElementById('annual-tax-group');
            if (group) {
                const range = document.getElementById('annual-tax-range');
                if (range) range.value = 0;
                updateDashboard();
                group.remove();
            }
        });
    }

    // Disclaimer modal functionality
    const disclaimerBtn = document.getElementById('disclaimer-btn');
    const disclaimerModal = document.getElementById('disclaimer-modal');
    const closeDisclaimerBtn = document.getElementById('close-disclaimer');

    if (disclaimerBtn && disclaimerModal && closeDisclaimerBtn) {
        // Show disclaimer modal
        disclaimerBtn.addEventListener('click', () => {
            disclaimerModal.classList.remove('hidden');
        });

        // Close disclaimer modal
        const closeModal = () => {
            disclaimerModal.classList.add('hidden');
        };

        closeDisclaimerBtn.addEventListener('click', closeModal);

        // Close modal when clicking outside of it
        disclaimerModal.addEventListener('click', (event) => {
            if (event.target === disclaimerModal) {
                closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !disclaimerModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }
};




// Re-fit on resize and orientation changes
window.addEventListener('resize', () => {
    fitDashboardToViewport();
});

