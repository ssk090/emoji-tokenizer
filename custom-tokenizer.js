// Pure JS custom tokenizer with emoji mapping and special token support

const FUN_SYMBOLS = [
  "🐍",
  "🦄",
  "🔥",
  "🌟",
  "🚀",
  "💎",
  "⚡",
  "🌈",
  "🎯",
  "💡",
  "🍕",
  "🥑",
  "🛸",
  "🏆",
  "📚",
  "🎨",
  "🎵",
  "🔮",
  "🧩",
  "🪐",
  "🌊",
  "🍀",
  "🌙",
  "🌻",
  "🍩",
  "🥇",
  "🧭",
  "🪄",
  "🪐",
  "✨",
];

const SPECIAL_TOKEN_EMOJIS = {
  "<|im_start|>": "🛫",
  "<|im_end|>": "🛑",
  "<|im_sep|>": "✂️",
  "<|system|>": "🖥️",
  "<|user|>": "🙋",
  "<|assistant|>": "🤖",
};

const DEFAULT_SPECIAL_TOKENS = [
  "<|im_start|>",
  "<|im_end|>",
  "<|im_sep|>",
  "<|system|>",
  "<|user|>",
  "<|assistant|>",
];

class CustomTokenizer {
  constructor(specialTokens = DEFAULT_SPECIAL_TOKENS) {
    this.specialTokens = new Set(specialTokens);
    this.vocab = new Map();
    this.reverseVocab = new Map();
    this.tokenDisplayMap = new Map();
    this.nextId = 1;
    this._nextFunIndex = 0;
    for (const tok of specialTokens) {
      this._addToken(tok, true);
    }
  }

  _addToken(token, isSpecial = false) {
    if (!this.vocab.has(token)) {
      const id = this.nextId++;
      this.vocab.set(token, id);
      this.reverseVocab.set(id, token);
      if (isSpecial) {
        this.tokenDisplayMap.set(id, SPECIAL_TOKEN_EMOJIS[token] || "🔹");
      } else {
        // Assign emoji sequence: repeat the emoji (id % FUN_SYMBOLS.length + 1) times
        const baseEmoji = FUN_SYMBOLS[id % FUN_SYMBOLS.length];
        // For uniqueness, repeat emoji (id // FUN_SYMBOLS.length + 1) times
        const repeatCount = Math.floor(id / FUN_SYMBOLS.length) + 1;
        const emojiSeq = baseEmoji.repeat(repeatCount);
        this.tokenDisplayMap.set(id, emojiSeq);
      }
    }
    return this.vocab.get(token);
  }

  learnVocabFromText(text) {
    const tokens = text.match(/<\|im_\w+\|>|<\|\w+\|>|\S+/g) || [];
    for (const tok of tokens) {
      this._addToken(tok, this.specialTokens.has(tok));
    }
  }

  encode(text) {
    const tokens = text.match(/<\|im_\w+\|>|<\|\w+\|>|\S+/g) || [];
    const ids = tokens.map((tok) =>
      this._addToken(tok, this.specialTokens.has(tok))
    );
    // Emoji sequences, no spaces between emojis for a single token
    const funEncoded = ids.map(
      (id) => this.tokenDisplayMap.get(id) || String(id)
    );
    return { rawIds: ids, funEncoded };
  }

  decode(tokenIdsOrEmojiSeqs) {
    // If input is array of numbers, decode as before
    if (typeof tokenIdsOrEmojiSeqs[0] === "number") {
      return tokenIdsOrEmojiSeqs
        .map((id) => this.reverseVocab.get(id) || "<UNK>")
        .join(" ");
    }
    // If input is array of emoji sequences, map back to token IDs
    if (typeof tokenIdsOrEmojiSeqs[0] === "string") {
      const ids = tokenIdsOrEmojiSeqs
        .map((seq) => {
          for (const [id, emojiSeq] of this.tokenDisplayMap.entries()) {
            if (emojiSeq === seq) return id;
          }
          return null;
        })
        .filter((id) => id !== null);
      return ids.map((id) => this.reverseVocab.get(id) || "<UNK>").join(" ");
    }
    return "";
  }

  getVocab() {
    const obj = {};
    for (const [tok, id] of this.vocab.entries()) {
      obj[id] = tok;
    }
    return obj;
  }

  printMapping(limit = 50) {
    console.log("---- token id -> token string -> emoji ----");
    let count = 0;
    for (const [id, tokenStr] of this.reverseVocab.entries()) {
      const display = this.tokenDisplayMap.get(id) || "";
      console.log(`${id} -> "${tokenStr}" -> ${display}`);
      count++;
      if (count >= limit) break;
    }
  }
}

module.exports = CustomTokenizer;
