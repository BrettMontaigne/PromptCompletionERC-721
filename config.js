const fs = require("fs")
require("@chainlink/env-enc").config()

const Location = {
  Inline: 0,
  Remote: 1,
}

const CodeLanguage = {
  JavaScript: 0,
}

const ReturnType = {
  uint: "uint256",
  uint256: "uint256",
  int: "int256",
  int256: "int256",
  string: "string",
  bytes: "Buffer",
  Buffer: "Buffer",
}

const requestConfig = {
  codeLocation: Location.Inline,
  codeLanguage: CodeLanguage.JavaScript,
  source: fs.readFileSync("./GPT-request-pinata.js").toString(),
  secrets: { 
    openaikey: process.env.OPENAI_KEY, 
    pinatakey: process.env.PINATA_KEY, 
    pinatasecretkey: process.env.PINATA_SECRET_KEY 
  },
  perNodeSecrets: [],
  expectedReturnType: ReturnType.Buffer,
  secretsURLs: [],
}

module.exports = requestConfig
