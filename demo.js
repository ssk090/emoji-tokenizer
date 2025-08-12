import CustomTokenizer from "@shivanandasai/emoji-tokenizer";
import readline from "readline";
import fs from "fs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const tokenizer = new CustomTokenizer();

function showMenu() {
  console.log("\nCustom Tokenizer CLI Demo");
  console.log("1. Learn vocab from text");
  console.log("2. Encode text");
  console.log("3. Decode token IDs");
  console.log("6. Decode emojis");
  console.log("4. Show vocab");
  console.log("5. Exit");
  rl.question("Choose an option: ", handleMenu);
}

function printVocabTable(vocabArr, fromFile = false) {
  if (fromFile) {
    console.log("\nVocab Table (loaded from vocab.json):");
  } else {
    console.log("\nVocab Table:");
  }
  console.log("ID   | Token            | Emoji");
  console.log("-----|------------------|------");
  for (const entry of vocabArr) {
    const idPad = String(entry.id).padEnd(4);
    const tokenPad = String(entry.token).padEnd(16);
    console.log(`${idPad} | ${tokenPad} | ${entry.emoji}`);
  }
}

function getVocabArray(vocabObj, tokenDisplayMap) {
  const arr = [];
  for (const idStr in vocabObj) {
    arr.push({
      id: Number(idStr),
      token: vocabObj[idStr],
      emoji: tokenDisplayMap.get(Number(idStr)) || "",
    });
  }
  return arr;
}

function saveVocabToFile(vocabArr, filename = "vocab.json") {
  fs.writeFileSync(filename, JSON.stringify(vocabArr, null, 2), "utf8");
}

function handleMenu(option) {
  switch (option.trim()) {
    case "1":
      rl.question("Enter text to learn vocab: ", (text) => {
        tokenizer.learnVocabFromText(text);
        const vocabArr = getVocabArray(
          tokenizer.getVocab(),
          tokenizer.tokenDisplayMap
        );
        saveVocabToFile(vocabArr);
        console.log("Vocab learned and saved to vocab.json.");
        showMenu();
      });
      break;
    case "2":
      rl.question("Enter text to encode: ", (text) => {
        const result = tokenizer.encode(text);
        const vocabArr = getVocabArray(
          tokenizer.getVocab(),
          tokenizer.tokenDisplayMap
        );
        saveVocabToFile(vocabArr);
        if (result && result.rawIds && result.funEncoded) {
          console.log("Token IDs:", result.rawIds);
          console.log("Emojis:", result.funEncoded.join(" "));
        } else {
          console.log("Token IDs:", result);
        }
        showMenu();
      });
      break;
    case "3":
      rl.question("Enter token IDs (comma separated): ", (input) => {
        const ids = input.split(",").map((x) => parseInt(x.trim(), 10));
        const decoded = tokenizer.decode(ids);
        const emojis = ids.map(
          (id) => tokenizer.tokenDisplayMap.get(id) || "❓"
        );
        console.log("Decoded text:", decoded);
        console.log("Emojis:", emojis.join(" "));
        showMenu();
      });
      break;
    case "6":
      rl.question("Enter emojis (space separated): ", (input) => {
        const emojiArr = input.split(/\s+/).filter(Boolean);
        const ids = emojiArr
          .map((emoji) => {
            for (const [id, emj] of tokenizer.tokenDisplayMap.entries()) {
              if (emj === emoji) return id;
            }
            return null;
          })
          .filter((id) => id !== null);
        if (ids.length === 0) {
          console.log("No valid emojis found in vocab.");
        } else {
          const decoded = tokenizer.decode(ids);
          console.log("Decoded text:", decoded);
        }
        showMenu();
      });
      break;
    case "4":
      let loadedFromFile = false;
      if (fs.existsSync("vocab.json")) {
        try {
          const fileData = fs.readFileSync("vocab.json", "utf8");
          const vocabArr = JSON.parse(fileData);
          printVocabTable(vocabArr, true);
          loadedFromFile = true;
        } catch (err) {
          console.log("Error loading vocab.json, showing in-memory vocab.");
        }
      }
      if (!loadedFromFile) {
        const vocabArr = getVocabArray(
          tokenizer.getVocab(),
          tokenizer.tokenDisplayMap
        );
        printVocabTable(vocabArr, false);
      }
      showMenu();
      break;
    case "5":
      rl.close();
      break;
    case "7":
      const vocabArr = getVocabArray(
        tokenizer.getVocab(),
        tokenizer.tokenDisplayMap
      );
      saveVocabToFile(vocabArr);
      console.log("Vocab saved to vocab.json");
      showMenu();
      break;
    default:
      console.log("Invalid option.");
      showMenu();
  }
}

showMenu();
