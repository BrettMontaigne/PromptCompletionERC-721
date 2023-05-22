const iterations = parseInt(args[0], 10);
const apiUrl = args[1];
const model = args[2];
const temperature = parseInt(args[3], 10);
const maxTokens = parseInt(args[4], 10);
const prompt = args[5];
let results = [];

const openAIRequest = Functions.makeHttpRequest({
    url: apiUrl,
    method: "POST",
    headers: { 'Authorization': `Bearer ${secrets.openaikey}` },
    data: { 
        "model": model, 
        "prompt": prompt, 
        "temperature": temperature, 
        "max_tokens": maxTokens 
    }
});

const openAiResponse = await openAIRequest;
let result = openAiResponse.data.choices[0].text.replace(/\./g, "").trim();

const pinataRequest = Functions.makeHttpRequest({
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    method: 'POST',
    headers: {
        'pinata_api_key': secrets.pinatakey,
        'pinata_secret_api_key': secrets.pinatasecretkey,
        'Content-Type': 'application/json'
    },
    data: JSON.stringify({
        name: 'PromptCompletion NFT (alpha)',
        description: 'This is an NFT that represents a prompt and its completion by an AI model.',
        image: `https://gateway.pinata.cloud/ipfs/QmVwCmhnu5wLxMi3axFajkuSGjspgGZgqbRws7VeNNtjoY`,
        external_url: "placeholder",
        attributes: [
            {
                trait_type: "model",
                value: model
            },
            {
                trait_type: "endpoint",
                value: apiUrl
            },
            {
                trait_type: "prompt",
                value: prompt
            },
            {
                trait_type: "completion",
                value: result
            },
            {
                trait_type: "evaluated?",
                value: "false"
            },
        ]
    })
});

const pinataResponse = await pinataRequest;
const ipfsHash = `ipfs://${pinataResponse.data.IpfsHash}`;
results.push(ipfsHash);

return Buffer.from(results[0]);
