// Function to convert currency
async function convertCurrency() {
    const fromCurrency = document.getElementById('fromcurrency').value;
    const toCurrency = document.getElementById('tocurrency').value;
    const amount = parseFloat(document.getElementById('amount_input').value);
    const conversionPaths = document.getElementById("conversionPaths");

    async function exchangeArbitrage(interAmount, object){
        const url2 = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${object.currency}`;
        const response = await fetch(url2);
        const data = await response.json();
        const rate = data.conversion_rates[toCurrency];
        object.indirect = (interAmount * rate).toFixed(3);
    }

    async function calculateBestPaths(fromCurrency, toCurrency, amount) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            const rates = data.conversion_rates;
    
            let paths = [];
            const intermediateCurrencies = Object.keys(rates).filter((currency) => currency !== fromCurrency && currency !== toCurrency);
            
            //convertiing from currency to intermediate
            intermediateCurrencies.forEach((intermediate) => {
                const convertInter = amount*(rates[intermediate] / rates[fromCurrency]);
                   
                paths.push({
                    path: `${fromCurrency} to ${intermediate} to ${toCurrency}`,
                    indirect: (convertInter).toFixed(5),
                    currency: intermediate
                });
            });

            async function processPaths() {
                for (let object of paths) {
                    await exchangeArbitrage(parseFloat(object.indirect), object);  
                }
            }


            processPaths().then(()=>{
                paths = paths.sort((a, b) => parseFloat(b.indirect) - parseFloat(a.indirect));
    
            const bestPaths = paths.slice(0, 3);
            conversionPaths.innerHTML = bestPaths.map((path) => {
                return `
                    <li id="paths-displayed">
                        <strong>${path.path}:</strong> 
                        Indirect Conversion: ${path.indirect}
                    </li>
                `;
            }).join('');
            });    
        } catch (error) {
            console.error("Error calculating best paths:", error);
            alert ("Failed to calculate best paths.");
        }
    }  

    if (!fromCurrency || !toCurrency || isNaN(amount)) {
        alert('Please enter valid currencies and amount.');
        return;
    }

    const apiKey = 'd2839356a10f22b605a9de2a'; 
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch exchange rates');

        const data = await response.json();
        const rate = data.conversion_rates[toCurrency];

        if (!rate) {
            alert(`Conversion rate for ${toCurrency} not available.`);
            return;
        }

        const convertedAmount = (amount * rate).toFixed(2);
        document.getElementById('result').innerText = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
        
        document.getElementById('output').style.display="block";

        calculateBestPaths(fromCurrency, toCurrency, amount);
    } catch (error) {
        console.error(error);
        alert('An error occurred. Please try again.');
    }
}

// Event listener for the convert button
document.getElementById('btn').addEventListener('click', convertCurrency);
