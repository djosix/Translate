import { Backend } from "./types";

const backend: Backend = {
  metadata: {
    name: "OpenAI",
    configurable: [
      {
        name: "Model",
        type: "text",
        key: "model",
        value: "gpt-4o-mini",
      },
      {
        name: "API Key",
        type: "password",
        key: "apiKey",
        value: "",
      },
      {
        name: "Prompt",
        type: "text",
        key: "prompt",
        value:
          "You are a professional translator. " +
          "Translate any text to LANGUAGE. " +
          "The translation must be native and fluent. " +
          "Do not add any comments. " +
          "Please only output the translated text. ",
      },
    ],
  },

  translate: async (text, targetLanguage, settings) => {
    const future = fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          {
            role: "system",
            content: settings.prompt.replace("LANGUAGE", targetLanguage),
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });
    let response;
    try {
      response = await future;
    } catch (error) {
      throw `Failed to connect to OpenAI: ${error}`;
    }
    if (!response.ok) {
      throw await response.text();
    }
    const data = await response.json();
    return data.choices[0].message.content;
  },
};

export default backend;
