const axios = require('axios');

const Sending_message = async (message) => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/conversation', { user_message: message });
        if (!response.data || !response.data.ai_message) {
            throw new Error('Unexpected response from server');
        }
        return response.data;
    } catch (error) {
        console.error(`Error: ${error}`);
        if (error.code === 'ECONNREFUSED') {
            throw new Error('Cannot connect to server. Please make sure the server is running.');
        } else {
            throw new Error(`Unexpected error: ${error.message}`);
        }
    }
}


module.exports = Sending_message;
