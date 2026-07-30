"use client";

import Image from "next/image";

type Tool = {
  name: string;
  src: string;
};

const tools: Tool[] = [
  { name: "Excel", src: "/logos/excel4.png" },
  { name: "Word", src: "/logos/word.png" },
  { name: "PDF Editor", src: "/logos/pdf.png" },
  { name: "PowerBI", src: "/logos/powerbi.png" },
  { name: "Tableau", src: "/logos/tableau.png" },
  { name: "n8n", src: "/logos/n8n.png" },
  { name: "ChatGPT", src: "/logos/openai.png" },
  { name: "Gemini", src: "/logos/gemini.svg" },
  { name: "Claude", src: "/logos/claude.svg" },
  { name: "NotebookLM", src: "/logos/notebooklm.svg" },
  { name: "Notion", src: "/logos/notion2.png" },
  { name: "VS Code", src: "/logos/vscode.png" },
  { name: "SQL", src: "/logos/sql1.png" },
  { name: "Python", src: "/logos/python.png" },
  { name: "TypeScript", src: "/logos/typescript2.png" },
  { name: "Jira", src: "/logos/jira.png" },
  { name: "Postman", src: "/logos/postman.png" },
  { name: "App Script", src: "/logos/appscript.png" },
];

function ToolTile({ tool }: { tool: Tool }) {
  return (
    <div
      className="group flex items-center justify-center"
      role="img"
      aria-label={tool.name}
      title={tool.name}
    >
      <Image
        src={tool.src}
        alt=""
        width={64}
        height={64}
        quality={100}
        sizes="36px"
        className="h-9 w-auto grayscale brightness-0 opacity-65 transition-opacity duration-200 group-hover:opacity-90"
      />
    </div>
  );
}

export default function ToolsMarquee() {
  return (
    <section className="py-8 sm:py-10" aria-label="Herramientas">
      <div
        className="tools-marquee relative overflow-x-auto overflow-y-hidden sm:overflow-hidden"
        tabIndex={0}
      >
        <div
          className="tools-marquee-track flex w-max"
          style={{ animation: "tools-marquee-scroll 54s linear infinite" }}
        >
          <div className="tools-marquee-group flex items-center gap-6 pr-6">
            {tools.map((tool) => (
              <ToolTile key={tool.name} tool={tool} />
            ))}
          </div>

          <div
            className="tools-marquee-group tools-marquee-duplicate flex items-center gap-6 pr-6"
            aria-hidden="true"
          >
            {tools.map((tool) => (
              <ToolTile key={`dup-${tool.name}`} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
