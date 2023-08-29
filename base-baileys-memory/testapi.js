const Sending_message = require('./apii.js');

(async () => {
    const aiResponse = await Sending_message("my name is jair carmona casiano");
    console.log(aiResponse.ai_message);
})();
