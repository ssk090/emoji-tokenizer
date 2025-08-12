# Custom Tokenizer JS

A JavaScript tokenizer that learns vocabulary from text, supports ENCODE/DECODE, and handles special tokens. Includes a CLI demo with emoji sequence encoding for large vocabularies.


https://github.com/user-attachments/assets/a4da855b-978e-4abf-988f-a9d6434cd28b



## Features

- Learns vocab from any input text
- Handles special tokens (customizable)
- ENCODE: Converts text to token IDs and emoji sequences
- DECODE: Converts token IDs or emoji sequences back to text
- CLI demo for interactive usage
- Supports large vocabularies using repeated emoji sequences

## Setup

1. Clone the repo:
   ```sh
   git clone <your-repo-url>
   cd emoji-tokenizer
   ```
2. Install dependencies (none required for core demo):
   ```sh
   pnpm install
   # or
   npm install
   ```

## Usage

### CLI Demo

Run the demo:

```sh
pnpm start
# or
node demo.js
```

#### Example CLI

- Learn vocab from text
- Encode text to emoji sequences (e.g., "⚡⚡ 💎💎💎")
- Decode emoji sequences back to text
- Show vocab table with token, ID, and emoji sequence
- Vocab is auto-saved to `vocab.json`

### API Usage

```js
const Tokenizer = require("./custom-tokenizer");
const tokenizer = new Tokenizer();
tokenizer.learnVocabFromText("hello world");
const { rawIds, funEncoded } = tokenizer.encode("hello world");
console.log(rawIds, funEncoded); // e.g., [1,2], ["⚡", "💎"]
const text = tokenizer.decode(rawIds); // decode from IDs
const textFromEmoji = tokenizer.decode(funEncoded); // decode from emoji sequences
console.log(text, textFromEmoji);
```

## Customization

- Change special tokens in `custom-tokenizer.js`.
- Extend vocab learning logic for more advanced tokenization.
- Emoji mapping logic can be customized for different visual styles.

## License

MIT
