document.addEventListener("DOMContentLoaded", () => {
    
    const electricityForm = document.querySelector("#electricityForm");
    const mcbAmphereInput = document.querySelector("#mcb-Amphere");
    const meterReadingInput = document.querySelector("#meterReading");
    const previousReadingInput = document.querySelector("#previousReading");
    const meterReadingError = document.querySelector("#meterReadingError");
    const previousReadingError = document.querySelector("#previousReadingError");
    const totalUnit = document.querySelector("#totalUnit"); // Assuming you have an element to display total units
    const totalAmount = document.querySelector("#totalAmount"); // Assuming you have an element to display total amount

    let calculatingInterval;
    let isCalculating = false;

    function showCalculatingEffect() {
        if (isCalculating) return;
        isCalculating = true;

        let dots = 0;
        totalUnit.textContent = "Calculating";

        calculatingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            let dotString = ".".repeat(dots);
            totalUnit.textContent = `Calculating${dotString}`;
        }, 50);
    }

    function stopCalculatingEffect() {
        clearInterval(calculatingInterval);
        isCalculating = false; // Reset flag
    }

    function calculateAndDisplayBill() {
        // Reset output divs before starting a new calculation
        totalUnit.textContent = "";
        totalAmount.textContent = "";

        // Get values from input fields
        const mcbAmphere = mcbAmphereInput.value;
        const meterReading = meterReadingInput.value.trim();
        const previousReading = previousReadingInput.value.trim();

        // Reset error messages
        meterReadingError.textContent = "";
        previousReadingError.textContent = "";

        // Validate inputs
        if (meterReading === "") {
            meterReadingError.textContent = "Please enter your meter reading";
            totalUnit.textContent = "Waiting for input...";
            return;
        } else if (/[^0-9]/.test(meterReading)) {
            meterReadingError.textContent = "Enter only numbers for meter reading";
            totalUnit.textContent = "Waiting for input...";
            return;
        }
    
        // Validate previous reading
        if (previousReading === "") {
            previousReadingError.textContent = "Please enter your previous reading";
            totalUnit.textContent = "Waiting for input...";
            return;
        } else if (/[^0-9]/.test(previousReading)) {
            previousReadingError.textContent = "Enter only numbers for previous reading";
            totalUnit.textContent = "Waiting for input...";
            return;
        }
                
        // Show calculating effect
        showCalculatingEffect();

        setTimeout(() => {
            processCalculation(mcbAmphere, meterReading, previousReading);
        }, 300);
    }

    function processCalculation(mcbAmphere, meterReading, previousReading) {
        const consumption = parseInt(meterReading) - parseInt(previousReading);
        if (isNaN(consumption) || consumption < 0) {
            previousReadingError.textContent = "Previous reading must be less than meter reading";
            stopCalculatingEffect();
            totalUnit.textContent = "Error in input!";
            totalAmount.textContent = ""; // Clear total amount
            return;
        }

        // Calculate total amount
        const totalBill = calculateTotalBill(mcbAmphere, consumption);

        // Display total amount
        totalUnit.textContent = `Total Unit consumed: ${consumption} KWh`;
        totalAmount.textContent = `Total Amount in NPR is: Rs ${totalBill.toLocaleString("en-IN")}`;

        // Stop calculating effect after displaying the result
        stopCalculatingEffect();
        console.log("Calculation completed successfully");
    }

    // Attach event listener for automatic calculation
    meterReadingInput.addEventListener("input", () => {
        calculateAndDisplayBill();
    });
    previousReadingInput.addEventListener("input", () => {
        calculateAndDisplayBill();
    });

    // Allow submit button to calculate
    electricityForm.addEventListener("submit", function(event) {
        event.preventDefault();
        calculateAndDisplayBill();
    });
});

function calculateTotalBill(mcbAmphere, consumption) {
    const serviceCharge = getServiceCharge(mcbAmphere, consumption);
    const energyCharge = getEnergyCharge(mcbAmphere, consumption);

    return serviceCharge + (energyCharge * consumption);
}

function getServiceCharge(mcbAmphere, consumption) {
    const serviceChargeRates = {
        "5": [30, 50, 75, 100, 125, 150, 175],
        "15": [50, 75, 100, 125, 150, 175, 200],
        "30": [75, 100, 125, 150, 175, 200, 225],
        "60": [125, 150, 175, 200, 225, 250, 275]
    };

    return determineCharge(serviceChargeRates[mcbAmphere], consumption);
}

function getEnergyCharge(mcbAmphere, consumption) {
    const energyChargeRates = {
        "5": [3, 7, 8.5, 10, 11, 12, 13],
        "15": [4, 7, 8.5, 10, 11, 12, 13],
        "30": [5, 7, 8.5, 10, 11, 12, 13],
        "60": [6, 7, 8.5, 10, 11, 12, 13]
    };

    return determineCharge(energyChargeRates[mcbAmphere], consumption);
}

function determineCharge(rateArray, consumption) {
    if (consumption <= 20) return rateArray[0];
    if (consumption <= 30) return rateArray[1];
    if (consumption <= 50) return rateArray[2];
    if (consumption <= 150) return rateArray[3];
    if (consumption <= 250) return rateArray[4];
    if (consumption <= 400) return rateArray[5];
    return rateArray[6]; // Above 400    
}