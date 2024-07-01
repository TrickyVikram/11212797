const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 9876;

// Middleware to parse JSON bodies
app.use(express.json());

// Global variables
let storedNumbers = [];
const windowSize = 10;
//const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE5ODEyNjE2LCJpYXQiOjE3MTk4MTIzMTYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA2MzY5NThjLThlZjAtNGQzYS04YzJiLTU4Mjk2M2QxZDUzMSIsInN1YiI6InZrdW1hcnNhaDk5OUBnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjA2MzY5NThjLThlZjAtNGQzYS04YzJiLTU4Mjk2M2QxZDUzMSIsImNsaWVudFNlY3JldCI6IlROUVpMV3dXZm5VWEZjTnYiLCJvd25lck5hbWUiOiJWSUtSQU0iLCJvd25lckVtYWlsIjoidmt1bWFyc2FoOTk5QGdtYWlsLmNvbSIsInJvbGxObyI6IjExMjEyNzk3In0.KlMQKmo0tL97PJZjWAl3l7Jkz0KJojUS1bzbpNelatA';
//const bearerToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE5ODEyNjE2LCJpYXQiOjE3MTk4MTIzMTYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA2MzY5NThjLThlZjAtNGQzYS04YzJiLTU4Mjk2M2QxZDUzMSIsInN1YiI6InZrdW1hcnNhaDk5OUBnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjA2MzY5NThjLThlZjAtNGQzYS04YzJiLTU4Mjk2M2QxZDUzMSIsImNsaWVudFNlY3JldCI6IlROUVpMV3dXZm5VWEZjTnYiLCJvd25lck5hbWUiOiJWSUtSQU0iLCJvd25lckVtYWlsIjoidmt1bWFyc2FoOTk5QGdtYWlsLmNvbSIsInJvbGxObyI6IjExMjEyNzk3In0.KlMQKmo0tL97PJZjWAl3l7Jkz0KJojUS1bzbpNelatA';
// Function to calculate average of numbers in array

const bearerToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE5ODE0MTgxLCJpYXQiOjE3MTk4MTM4ODEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA2MzY5NThjLThlZjAtNGQzYS04YzJiLTU4Mjk2M2QxZDUzMSIsInN1YiI6InZrdW1hcnNhaDk5OUBnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjA2MzY5NThjLThlZjAtNGQzYS04YzJiLTU4Mjk2M2QxZDUzMSIsImNsaWVudFNlY3JldCI6IlROUVpMV3dXZm5VWEZjTnYiLCJvd25lck5hbWUiOiJWSUtSQU0iLCJvd25lckVtYWlsIjoidmt1bWFyc2FoOTk5QGdtYWlsLmNvbSIsInJvbGxObyI6IjExMjEyNzk3In0.xi3ctTEnHJw_zDhX74sWWav6N9ZF-5sXPOM0CfUtpGU';
const calculateAverage = (numbers) => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return numbers.length > 0 ? (sum / numbers.length).toFixed(2) : 0;
};

// Axios instance with default configurations
const axiosInstance = axios.create({
    headers: {
        'Authorization': `Bearer ${bearerToken}`
    }
});

// Endpoint handler for /numbers/:numberid
app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    let apiUrl;

    // Determine API URL based on numberid
    switch (numberid) {
        case 'p':
            apiUrl = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            apiUrl = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            apiUrl = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            apiUrl = 'http://20.244.56.144/test/random';
            break;
        default:
            return res.status(400).json({ error: `Invalid numberid: ${numberid}` });
    }

    try {
        // Fetch numbers from the test server using axiosInstance
        const response = await axiosInstance.get(apiUrl);

        if (response.status !== 200 || !response.data.numbers || !Array.isArray(response.data.numbers)) {
            throw new Error('Invalid response from the test server');
        }

        const newNumbers = response.data.numbers.filter((num) => !storedNumbers.includes(num));
        storedNumbers = [...storedNumbers, ...newNumbers].slice(-windowSize); // Maintain window size limit

        const windowPrevState = [...storedNumbers];
        const windowCurrState = [...storedNumbers];
        const avg = calculateAverage(storedNumbers.map(Number));

        const responseBody = {
            numbers: newNumbers,
            windowPrevState,
            windowCurrState,
            avg
        };

        res.json(responseBody);
    } catch (error) {
        console.error(`Error fetching or processing data for ${numberid}:`, error.message);
        res.status(error.response ? error.response.status : 500).json({ error: 'Failed to fetch or process data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Average Calculator Microservice running on http://localhost:${PORT}`);
});
