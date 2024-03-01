import generateGreeting from "./shared/answer-generation/greeting";

self.addEventListener('message', async (event) => {

    const gender = await generateGreeting(event.data.text, self.postMessage);

    self.postMessage({
        status: 'complete',
        output: gender,
    });
});