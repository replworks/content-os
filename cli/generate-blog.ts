import { runGenerate } from "../src/core/runGenerate";
import fs from "fs";
import path from "path";

async function main() {
  const result = await runGenerate({
    type: "blog",
    templateId: "seo-v1",
    context: {
      topic: "강아지가 혀를 내미는 이유",
      audience: "초보 반려인",
    },
  });

  const fileName = `blog-${Date.now()}.json`;
  const filePath = path.join(process.cwd(), "outputs", fileName);

  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));

  console.log("Saved:", fileName);
}

main();
